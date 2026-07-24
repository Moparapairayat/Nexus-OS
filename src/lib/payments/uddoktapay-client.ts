import {
  UddoktaPayCheckoutPayload,
  UddoktaPayCheckoutResponse,
  UddoktaPayVerifyResponse,
} from "@/types/payment";

function getUddoktaPayConfig() {
  const apiKey = process.env.UDDOKTAPAY_API_KEY || "sandbox_api_key_nexusos";
  const apiUrl =
    process.env.UDDOKTAPAY_API_URL || "https://sandbox.uddoktapay.com/api/v2";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return { apiKey, apiUrl, appUrl };
}

/**
 * Creates a checkout session URL with UddoktaPay API (v2).
 */
export async function createUddoktaPayCheckout(
  payload: UddoktaPayCheckoutPayload
): Promise<UddoktaPayCheckoutResponse> {
  const { apiKey, apiUrl } = getUddoktaPayConfig();

  try {
    const response = await fetch(`${apiUrl}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "RT-UDDOKTAPAY-API-KEY": apiKey,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("UddoktaPay checkout error:", errorText);
      return {
        status: false,
        message: `UddoktaPay API returned status ${response.status}: ${errorText}`,
      };
    }

    const data = await response.json();
    return {
      status: Boolean(data.status),
      message: data.message,
      payment_url: data.payment_url,
      invoice_id: data.invoice_id,
    };
  } catch (error: any) {
    console.error("Failed to connect to UddoktaPay gateway:", error);
    return {
      status: false,
      message: error?.message || "Network error connecting to UddoktaPay",
    };
  }
}

/**
 * Double-verifies a transaction status directly with UddoktaPay server.
 * Never trust client callback payloads alone — always query UddoktaPay API!
 */
export async function verifyUddoktaPayTransaction(
  invoiceId: string
): Promise<{ success: boolean; data?: UddoktaPayVerifyResponse; error?: string }> {
  const { apiKey, apiUrl } = getUddoktaPayConfig();

  try {
    const response = await fetch(`${apiUrl}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "RT-UDDOKTAPAY-API-KEY": apiKey,
      },
      body: JSON.stringify({ invoice_id: invoiceId }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Verification endpoint error (${response.status}): ${errorText}`,
      };
    }

    const data: UddoktaPayVerifyResponse = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("UddoktaPay verification request failed:", error);
    return {
      success: false,
      error: error?.message || "Failed to reach UddoktaPay verification server",
    };
  }
}

/**
 * Validates incoming webhook signature header against configured secret key.
 */
export function verifyUddoktaPayWebhookHeader(incomingApiKeyHeader: string | null): boolean {
  const { apiKey } = getUddoktaPayConfig();
  if (!incomingApiKeyHeader) return false;
  return incomingApiKeyHeader.trim() === apiKey.trim();
}
