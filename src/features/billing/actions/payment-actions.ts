"use server";

import { revalidatePath } from "next/cache";
import { requireClient, requireAdmin, requireAuth } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  PaymentRecord,
  PaymentFilters,
  PaymentLog,
  PaymentReceipt,
  PaymentTransaction,
} from "@/types/payment";
import {
  createUddoktaPayCheckout,
  verifyUddoktaPayTransaction,
} from "@/lib/payments/uddoktapay-client";

function getAdmin() {
  return createAdminClient() as any;
}

function mapRowToPayment(row: any): PaymentRecord {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.clients?.full_name || row.clients?.company_name || "Client Account",
    companyName: row.clients?.company_name || "Organization",
    clientEmail: row.clients?.primary_email || "billing@client.com",
    invoiceId: row.invoice_id || undefined,
    invoiceNumber: row.invoices?.invoice_number || undefined,
    paymentNumber: row.payment_number,
    amount: Number(row.amount || 0),
    currency: row.currency || "USD",
    method: row.method || "uddoktapay",
    status: row.status || "pending",
    gatewayInvoiceId: row.gateway_invoice_id || undefined,
    paymentUrl: row.payment_url || undefined,
    paymentDate: row.payment_date || row.created_at,
    notes: row.notes || undefined,
    rawPayload: row.raw_payload || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Initiates an UddoktaPay checkout session for a given invoice.
 */
export async function createUddoktaPayCheckoutAction(invoiceId: string) {
  const user = await requireClient();
  const supabase = getAdmin();

  // 1. Retrieve invoice details
  const { data: invoiceRow, error: invError } = await supabase
    .from("invoices")
    .select(`
      *,
      clients (id, company_name, full_name, primary_email)
    `)
    .eq("id", invoiceId)
    .single();

  if (invError || !invoiceRow) {
    return { success: false, error: "Invoice record not found." };
  }

  if (invoiceRow.status === "paid") {
    return { success: false, error: "This invoice has already been paid in full." };
  }

  const balanceDue = Number(invoiceRow.total || 0) - Number(invoiceRow.paid_amount || 0);
  if (balanceDue <= 0) {
    return { success: false, error: "No balance due on this invoice." };
  }

  // 2. Prepare payment number & URLs
  const paymentSeq = Date.now().toString().slice(-6);
  const paymentNumber = `PAY-${new Date().getFullYear()}-${paymentSeq}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // 3. Create pending payment record in DB
  const { data: paymentRow, error: payError } = await supabase
    .from("payments")
    .insert({
      client_id: invoiceRow.client_id,
      invoice_id: invoiceRow.id,
      payment_number: paymentNumber,
      amount: balanceDue,
      currency: invoiceRow.currency || "USD",
      method: "uddoktapay",
      status: "pending",
    })
    .select()
    .single();

  if (payError || !paymentRow) {
    return { success: false, error: `Failed to initialize payment record: ${payError?.message}` };
  }

  // Record initial timeline log
  await supabase.from("payment_logs").insert({
    payment_id: paymentRow.id,
    invoice_id: invoiceRow.id,
    client_id: invoiceRow.client_id,
    event_type: "payment_started",
    description: `Checkout session initialized for ${paymentNumber} (${invoiceRow.currency} ${balanceDue}).`,
    performed_by: user.fullName || user.email,
  });

  // 4. Send request to UddoktaPay Gateway
  const checkoutPayload = {
    full_name: invoiceRow.clients?.full_name || invoiceRow.clients?.company_name || user.fullName || "Client",
    email: invoiceRow.clients?.primary_email || user.email,
    amount: balanceDue,
    metadata: {
      invoice_id: invoiceRow.id,
      client_id: invoiceRow.client_id,
      payment_id: paymentRow.id,
      payment_number: paymentNumber,
    },
    redirect_url: `${appUrl}/api/payments/uddoktapay/callback?payment_id=${paymentRow.id}`,
    cancel_url: `${appUrl}/client/invoices/${invoiceRow.id}?payment=cancelled`,
    webhook_url: `${appUrl}/api/payments/uddoktapay/webhook`,
  };

  const gatewayRes = await createUddoktaPayCheckout(checkoutPayload);

  if (!gatewayRes.status || !gatewayRes.payment_url) {
    // Mark payment failed
    await supabase.from("payments").update({ status: "failed" }).eq("id", paymentRow.id);
    await supabase.from("payment_logs").insert({
      payment_id: paymentRow.id,
      invoice_id: invoiceRow.id,
      client_id: invoiceRow.client_id,
      event_type: "payment_failed",
      description: `UddoktaPay checkout creation failed: ${gatewayRes.message}`,
      performed_by: "System",
    });

    return {
      success: false,
      error: gatewayRes.message || "Failed to generate UddoktaPay checkout URL.",
    };
  }

  // 5. Save gateway invoice ID and checkout URL
  await supabase
    .from("payments")
    .update({
      gateway_invoice_id: gatewayRes.invoice_id || null,
      payment_url: gatewayRes.payment_url,
      status: "processing",
    })
    .eq("id", paymentRow.id);

  await supabase.from("payment_logs").insert({
    payment_id: paymentRow.id,
    invoice_id: invoiceRow.id,
    client_id: invoiceRow.client_id,
    event_type: "redirected",
    description: `Client redirected to UddoktaPay checkout (${gatewayRes.payment_url}).`,
    performed_by: "System",
  });

  revalidatePath(`/client/invoices/${invoiceId}`);
  return { success: true, checkoutUrl: gatewayRes.payment_url, paymentId: paymentRow.id };
}

/**
 * Retrieves payment history with filters. Supports Admin & Client portal.
 */
export async function getPaymentsAction(filters: PaymentFilters = {}) {
  const user = await requireClient();
  const supabase = getAdmin();

  let query = supabase
    .from("payments")
    .select(`
      *,
      clients (id, company_name, full_name, primary_email),
      invoices (id, invoice_number)
    `)
    .order("created_at", { ascending: false });

  if (user.role === "client") {
    const { data: clientRec } = await supabase
      .from("clients")
      .select("id")
      .or(`profile_id.eq.${user.id},primary_email.eq.${user.email}`)
      .limit(1)
      .maybeSingle();

    if (clientRec) {
      query = query.eq("client_id", clientRec.id);
    } else {
      return { success: true, data: { payments: [], total: 0, page: 1, totalPages: 0 } };
    }
  } else if (filters.clientId) {
    query = query.eq("client_id", filters.clientId);
  }

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.invoiceId) {
    query = query.eq("invoice_id", filters.invoiceId);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, error: `Database error: ${error.message}` };
  }

  let result: PaymentRecord[] = (data || []).map(mapRowToPayment);

  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.paymentNumber.toLowerCase().includes(q) ||
        (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(q)) ||
        (p.companyName && p.companyName.toLowerCase().includes(q)) ||
        (p.clientName && p.clientName.toLowerCase().includes(q)) ||
        (p.gatewayInvoiceId && p.gatewayInvoiceId.toLowerCase().includes(q))
    );
  }

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const total = result.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedData = result.slice(startIndex, startIndex + limit);

  return {
    success: true,
    data: {
      payments: paginatedData,
      total,
      page,
      totalPages,
    },
  };
}

/**
 * Retrieves full single payment details, logs, transaction response, and receipt.
 */
export async function getPaymentDetailsAction(paymentId: string) {
  const user = await requireClient();
  const supabase = getAdmin();

  const { data: paymentRow, error } = await supabase
    .from("payments")
    .select(`
      *,
      clients (id, company_name, full_name, primary_email),
      invoices (id, invoice_number)
    `)
    .eq("id", paymentId)
    .single();

  if (error || !paymentRow) {
    return { success: false, error: "Payment record not found." };
  }

  const payment = mapRowToPayment(paymentRow);

  // Fetch timeline logs
  const { data: logsData } = await supabase
    .from("payment_logs")
    .select("*")
    .eq("payment_id", paymentId)
    .order("created_at", { ascending: true });

  const logs: PaymentLog[] = (logsData || []).map((l: any) => ({
    id: l.id,
    paymentId: l.payment_id,
    invoiceId: l.invoice_id,
    clientId: l.client_id,
    eventType: l.event_type,
    description: l.description,
    performedBy: l.performed_by || "System",
    metadata: l.metadata,
    createdAt: l.created_at,
  }));

  // Fetch transaction details
  const { data: trxData } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("payment_id", paymentId)
    .maybeSingle();

  const transaction: PaymentTransaction | null = trxData
    ? {
        id: trxData.id,
        paymentId: trxData.payment_id,
        gatewayName: trxData.gateway_name,
        transactionId: trxData.transaction_id,
        senderNumber: trxData.sender_number || undefined,
        gatewayFee: Number(trxData.gateway_fee || 0),
        method: trxData.method || "uddoktapay",
        status: trxData.status || "COMPLETED",
        rawPayload: trxData.raw_payload || undefined,
        verifiedAt: trxData.verified_at || undefined,
        createdAt: trxData.created_at,
      }
    : null;

  // Fetch receipt if generated
  const { data: receiptData } = await supabase
    .from("receipts")
    .select("*")
    .eq("payment_id", paymentId)
    .maybeSingle();

  const receipt: PaymentReceipt | null = receiptData
    ? {
        id: receiptData.id,
        paymentId: receiptData.payment_id,
        invoiceId: receiptData.invoice_id,
        receiptNumber: receiptData.receipt_number,
        invoiceNumber: receiptData.invoice_number || payment.invoiceNumber || "N/A",
        clientName: receiptData.client_name || payment.clientName || "Client",
        companyName: receiptData.company_name || payment.companyName || "Organization",
        amount: Number(receiptData.amount || payment.amount),
        currency: receiptData.currency || payment.currency,
        paymentMethod: receiptData.payment_method || payment.method,
        transactionId: receiptData.transaction_id || transaction?.transactionId || "N/A",
        items: receiptData.items || [],
        pdfUrl: receiptData.pdf_url || undefined,
        issuedAt: receiptData.issued_at,
      }
    : null;

  return {
    success: true,
    data: {
      payment,
      logs,
      transaction,
      receipt,
    },
  };
}

/**
 * Resyncs payment status directly with UddoktaPay server (Admin Only).
 */
export async function resyncPaymentWithGatewayAction(paymentId: string) {
  const user = await requireAdmin();
  const supabase = getAdmin();

  const { data: paymentRow, error } = await supabase
    .from("payments")
    .select("*, invoices(*), clients(*)")
    .eq("id", paymentId)
    .single();

  if (error || !paymentRow) {
    return { success: false, error: "Payment record not found." };
  }

  const gatewayInvoiceId = paymentRow.gateway_invoice_id;
  if (!gatewayInvoiceId) {
    return { success: false, error: "No UddoktaPay Gateway Invoice ID associated with this payment." };
  }

  const verifyRes = await verifyUddoktaPayTransaction(gatewayInvoiceId);
  if (!verifyRes.success || !verifyRes.data) {
    return { success: false, error: verifyRes.error || "Failed to reach UddoktaPay verify endpoint." };
  }

  const gatewayData = verifyRes.data;
  const isCompleted = gatewayData.status === "COMPLETED";

  if (isCompleted) {
    // Complete payment in DB
    await supabase
      .from("payments")
      .update({
        status: "completed",
        raw_payload: gatewayData,
      })
      .eq("id", paymentId);

    if (paymentRow.invoice_id) {
      await supabase
        .from("invoices")
        .update({
          status: "paid",
          paid_amount: paymentRow.amount,
          balance_due: 0,
        })
        .eq("id", paymentRow.invoice_id);
    }

    // Insert transaction
    if (gatewayData.transaction_id) {
      await supabase.from("payment_transactions").upsert({
        payment_id: paymentId,
        gateway_name: "uddoktapay",
        transaction_id: gatewayData.transaction_id,
        sender_number: gatewayData.sender_number || null,
        gateway_fee: Number(gatewayData.fee || 0),
        method: gatewayData.payment_method || "uddoktapay",
        status: "COMPLETED",
        raw_payload: gatewayData,
        verified_at: new Date().toISOString(),
      }, { onConflict: "transaction_id" });
    }

    // Generate receipt
    const receiptNum = `RCT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    await supabase.from("receipts").upsert({
      payment_id: paymentId,
      invoice_id: paymentRow.invoice_id,
      client_id: paymentRow.client_id,
      receipt_number: receiptNum,
      invoice_number: paymentRow.invoices?.invoice_number || "INV-000",
      client_name: paymentRow.clients?.full_name || "Client",
      company_name: paymentRow.clients?.company_name || "Organization",
      amount: paymentRow.amount,
      currency: paymentRow.currency,
      payment_method: gatewayData.payment_method || "uddoktapay",
      transaction_id: gatewayData.transaction_id || "N/A",
      issued_at: new Date().toISOString(),
    }, { onConflict: "payment_id" });

    await supabase.from("payment_logs").insert({
      payment_id: paymentId,
      invoice_id: paymentRow.invoice_id,
      client_id: paymentRow.client_id,
      event_type: "resynced",
      description: `Payment status resynced & verified with UddoktaPay by ${user.fullName || user.email}.`,
      performed_by: user.fullName || user.email,
      metadata: gatewayData,
    });
  }

  revalidatePath(`/admin/billing/payments`);
  revalidatePath(`/client/invoices/${paymentRow.invoice_id}`);

  return { success: true, data: { status: gatewayData.status, gatewayData } };
}

/**
 * Manually marks a payment as verified (Admin Override).
 */
export async function manuallyVerifyPaymentAction(paymentId: string, notes: string) {
  const user = await requireAdmin();
  const supabase = getAdmin();

  const { data: paymentRow, error } = await supabase
    .from("payments")
    .select("*, invoices(*), clients(*)")
    .eq("id", paymentId)
    .single();

  if (error || !paymentRow) {
    return { success: false, error: "Payment not found." };
  }

  await supabase
    .from("payments")
    .update({ status: "completed", notes: notes || "Manually verified by admin" })
    .eq("id", paymentId);

  if (paymentRow.invoice_id) {
    await supabase
      .from("invoices")
      .update({
        status: "paid",
        paid_amount: paymentRow.amount,
        balance_due: 0,
      })
      .eq("id", paymentRow.invoice_id);
  }

  const receiptNum = `RCT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  await supabase.from("receipts").upsert({
    payment_id: paymentId,
    invoice_id: paymentRow.invoice_id,
    client_id: paymentRow.client_id,
    receipt_number: receiptNum,
    invoice_number: paymentRow.invoices?.invoice_number || "INV-000",
    client_name: paymentRow.clients?.full_name || "Client",
    company_name: paymentRow.clients?.company_name || "Organization",
    amount: paymentRow.amount,
    currency: paymentRow.currency,
    payment_method: "manual_override",
    transaction_id: `MANUAL-${Date.now()}`,
    issued_at: new Date().toISOString(),
  }, { onConflict: "payment_id" });

  await supabase.from("payment_logs").insert({
    payment_id: paymentId,
    invoice_id: paymentRow.invoice_id,
    client_id: paymentRow.client_id,
    event_type: "manual_verified",
    description: `Payment manually marked as completed by Admin ${user.fullName || user.email}. Notes: ${notes}`,
    performed_by: user.fullName || user.email,
  });

  revalidatePath(`/admin/billing/payments`);
  revalidatePath(`/client/invoices/${paymentRow.invoice_id}`);

  return { success: true };
}
