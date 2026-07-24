import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  verifyUddoktaPayTransaction,
  verifyUddoktaPayWebhookHeader,
} from "@/lib/payments/uddoktapay-client";

export async function POST(req: NextRequest) {
  try {
    // 1. Signature Verification
    const apiKeyHeader = req.headers.get("RT-UDDOKTAPAY-API-KEY");
    if (!verifyUddoktaPayWebhookHeader(apiKeyHeader)) {
      console.warn("Unauthorized UddoktaPay webhook call — Header signature mismatch.");
      return NextResponse.json(
        { status: false, message: "Unauthorized API key header" },
        { status: 401 }
      );
    }

    // 2. Parse payload
    const body = await req.json();
    const {
      invoice_id: gatewayInvoiceId,
      status: gatewayStatus,
      transaction_id: transactionId,
      sender_number: senderNumber,
      payment_method: paymentMethod,
      amount,
      metadata,
    } = body;

    if (!gatewayInvoiceId) {
      return NextResponse.json(
        { status: false, message: "Missing invoice_id in webhook payload" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient() as any;

    // 3. Double-verify status with UddoktaPay Server
    const verifyRes = await verifyUddoktaPayTransaction(gatewayInvoiceId);
    if (!verifyRes.success || !verifyRes.data) {
      console.error("Failed to verify transaction with UddoktaPay:", verifyRes.error);
      return NextResponse.json(
        { status: false, message: "Server-side double verification failed" },
        { status: 400 }
      );
    }

    const verifiedData = verifyRes.data;
    const isCompleted = verifiedData.status === "COMPLETED";

    // Locate target payment row in DB
    const { data: paymentRow } = await supabase
      .from("payments")
      .select("*, invoices(*), clients(*)")
      .or(`gateway_invoice_id.eq.${gatewayInvoiceId},id.eq.${metadata?.payment_id || ""}`)
      .limit(1)
      .maybeSingle();

    if (!paymentRow) {
      console.warn(`Payment record not found for UddoktaPay invoice: ${gatewayInvoiceId}`);
      return NextResponse.json(
        { status: false, message: "Associated payment record not found" },
        { status: 404 }
      );
    }

    // 4. Idempotency Protection Check
    if (paymentRow.status === "completed") {
      return NextResponse.json({
        status: true,
        message: "Payment already processed and completed",
      });
    }

    // Log webhook receipt
    await supabase.from("payment_logs").insert({
      payment_id: paymentRow.id,
      invoice_id: paymentRow.invoice_id,
      client_id: paymentRow.client_id,
      event_type: "webhook_received",
      description: `UddoktaPay webhook received with status ${verifiedData.status}.`,
      performed_by: "UddoktaPay Webhook",
      metadata: body,
    });

    if (isCompleted) {
      const finalTrxId = verifiedData.transaction_id || transactionId || `TRX-${Date.now()}`;

      // Update payment status
      await supabase
        .from("payments")
        .update({
          status: "completed",
          notes: `Verified via UddoktaPay (${verifiedData.payment_method || paymentMethod || "uddoktapay"})`,
          raw_payload: verifiedData,
        })
        .eq("id", paymentRow.id);

      // Insert transaction detail
      await supabase.from("payment_transactions").upsert({
        payment_id: paymentRow.id,
        gateway_name: "uddoktapay",
        transaction_id: finalTrxId,
        sender_number: verifiedData.sender_number || senderNumber || null,
        gateway_fee: Number(verifiedData.fee || 0),
        method: verifiedData.payment_method || paymentMethod || "uddoktapay",
        status: "COMPLETED",
        raw_payload: verifiedData,
        verified_at: new Date().toISOString(),
      }, { onConflict: "transaction_id" });

      // Mark target invoice paid
      if (paymentRow.invoice_id) {
        await supabase
          .from("invoices")
          .update({
            status: "paid",
          })
          .eq("id", paymentRow.invoice_id);
      }

      // Generate Receipt
      const receiptNumber = `RCT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      await supabase.from("receipts").upsert({
        payment_id: paymentRow.id,
        invoice_id: paymentRow.invoice_id,
        client_id: paymentRow.client_id,
        receipt_number: receiptNumber,
        invoice_number: paymentRow.invoices?.invoice_number || "INV-000",
        client_name: paymentRow.clients?.full_name || "Client",
        company_name: paymentRow.clients?.company_name || "Organization",
        amount: paymentRow.amount,
        currency: paymentRow.currency,
        payment_method: verifiedData.payment_method || paymentMethod || "uddoktapay",
        transaction_id: finalTrxId,
        issued_at: new Date().toISOString(),
      }, { onConflict: "payment_id" });

      // Log verified events
      await supabase.from("payment_logs").insert([
        {
          payment_id: paymentRow.id,
          invoice_id: paymentRow.invoice_id,
          client_id: paymentRow.client_id,
          event_type: "webhook_verified",
          description: `Server-side double verification passed for transaction ${finalTrxId}.`,
          performed_by: "System",
        },
        {
          payment_id: paymentRow.id,
          invoice_id: paymentRow.invoice_id,
          client_id: paymentRow.client_id,
          event_type: "invoice_paid",
          description: `Invoice ${paymentRow.invoices?.invoice_number || "record"} marked as PAID in full.`,
          performed_by: "System",
        },
        {
          payment_id: paymentRow.id,
          invoice_id: paymentRow.invoice_id,
          client_id: paymentRow.client_id,
          event_type: "receipt_generated",
          description: `Official receipt ${receiptNumber} generated automatically.`,
          performed_by: "System",
        },
      ]);
    } else if (verifiedData.status === "FAILED" || verifiedData.status === "CANCELLED") {
      await supabase
        .from("payments")
        .update({ status: verifiedData.status.toLowerCase() })
        .eq("id", paymentRow.id);

      await supabase.from("payment_logs").insert({
        payment_id: paymentRow.id,
        invoice_id: paymentRow.invoice_id,
        client_id: paymentRow.client_id,
        event_type: "payment_failed",
        description: `Payment marked as ${verifiedData.status} by gateway.`,
        performed_by: "System",
      });
    }

    return NextResponse.json({
      status: true,
      message: "Webhook processed successfully",
    });
  } catch (error: any) {
    console.error("UddoktaPay webhook processing exception:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
