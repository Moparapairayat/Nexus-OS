import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyUddoktaPayTransaction } from "@/lib/payments/uddoktapay-client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("payment_id");
  const invoiceIdParam = searchParams.get("invoice_id");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const supabase = createAdminClient() as any;

  // Locate target payment
  let query = supabase.from("payments").select("*, invoices(*)");
  if (paymentId) {
    query = query.eq("id", paymentId);
  } else if (invoiceIdParam) {
    query = query.eq("gateway_invoice_id", invoiceIdParam);
  }

  const { data: paymentRow } = await query.limit(1).maybeSingle();

  if (!paymentRow) {
    return NextResponse.redirect(`${appUrl}/client/invoices?payment=not_found`);
  }

  const targetInvoiceId = paymentRow.invoice_id;
  const gatewayInvoiceId = paymentRow.gateway_invoice_id || invoiceIdParam;

  if (gatewayInvoiceId && paymentRow.status !== "completed") {
    // Attempt real-time double verification check
    const verifyRes = await verifyUddoktaPayTransaction(gatewayInvoiceId);
    if (verifyRes.success && verifyRes.data?.status === "COMPLETED") {
      // Complete in DB
      await supabase
        .from("payments")
        .update({ status: "completed", raw_payload: verifyRes.data })
        .eq("id", paymentRow.id);

      if (targetInvoiceId) {
        await supabase
          .from("invoices")
          .update({
            status: "paid",
          })
          .eq("id", targetInvoiceId);
      }
    }
  }

  if (targetInvoiceId) {
    return NextResponse.redirect(
      `${appUrl}/client/invoices/${targetInvoiceId}?payment=success`
    );
  }

  return NextResponse.redirect(`${appUrl}/client/invoices?payment=success`);
}

export async function POST(req: NextRequest) {
  return GET(req);
}
