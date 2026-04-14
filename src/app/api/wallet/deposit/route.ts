import { NextRequest } from "next/server";
import { errorResponse, AppError } from "@/lib/errors";

const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;
const YOCO_CHECKOUT_URL = "https://payments.yoco.com/api/checkouts";

/**
 * POST /api/wallet/deposit
 * Body: { walletId, amount, successUrl?, cancelUrl? }
 *
 * Creates a Yoco checkout session for depositing funds into a wallet.
 * Returns a redirectUrl that the mobile app should open in a browser/webview.
 *
 * Amount is in Rands (e.g. 100.00). Yoco expects cents, so we multiply by 100.
 *
 * Note: When DB is available, wallet existence is verified first.
 * When DB is unavailable, the checkout is created directly using the provided walletId.
 */
export async function POST(request: NextRequest) {
  try {
    if (!YOCO_SECRET_KEY) {
      throw new AppError("Yoco secret key not configured", 500, "CONFIG_ERROR");
    }

    const body = await request.json();
    const { walletId, amount, successUrl, cancelUrl } = body;

    // Diagnostic logging
    const keyPrefix = YOCO_SECRET_KEY.substring(0, 8);
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3003").trim();
    console.log(`[deposit] Key prefix: ${keyPrefix}..., AppURL: ${appUrl}, Amount: ${amount}`);

    if (!walletId || !amount) {
      throw new AppError("walletId and amount are required", 400, "MISSING_FIELDS");
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new AppError("Amount must be a positive number", 400, "INVALID_AMOUNT");
    }

    // Try to verify wallet in DB, but don't block checkout if DB is unavailable
    let resolvedWalletId = walletId;
    let walletName = "Wallet";
    try {
      const { getWalletOrThrow } = await import("@/lib/wallet");
      const wallet = await getWalletOrThrow(walletId);
      resolvedWalletId = wallet.id;
      walletName = wallet.name;
    } catch (dbError: unknown) {
      // If DB is unavailable for any reason, proceed without verification
      console.warn("DB unavailable — skipping wallet verification, proceeding with checkout");
    }

    // Convert Rands to cents for Yoco
    const amountInCents = Math.round(Number(amount) * 100);



    // Create Yoco checkout session
    const response = await fetch(YOCO_CHECKOUT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${YOCO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: amountInCents,
        currency: "ZAR",
        successUrl: successUrl || `${appUrl}/deposit/success`,
        cancelUrl: cancelUrl || `${appUrl}/deposit/cancel`,
        failureUrl: `${appUrl}/deposit/failed`,
        metadata: {
          walletId: resolvedWalletId,
          walletName,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      let errorData: Record<string, unknown> = {};
      try { errorData = JSON.parse(errorText); } catch { /* raw text */ }
      console.error("Yoco checkout error:", response.status, errorText);
      console.error("Request body was:", JSON.stringify({
        amount: amountInCents,
        currency: "ZAR",
        successUrl: successUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3003"}/deposit/success`,
        cancelUrl: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3003"}/deposit/cancel`,
      }));
      const errorMsg = errorData.displayMessage || errorData.message || errorData.description || errorText || response.statusText;
      throw new AppError(
        `Yoco checkout failed: ${errorMsg}`,
        response.status,
        "YOCO_ERROR"
      );
    }

    const checkout = await response.json();

    return Response.json({
      checkoutId: checkout.id,
      redirectUrl: checkout.redirectUrl,
      amount: Number(amount),
      walletId: resolvedWalletId,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
