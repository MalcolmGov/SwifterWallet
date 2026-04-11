import { NextRequest } from "next/server";
import { errorResponse, AppError } from "@/lib/errors";
import { getWalletOrThrow } from "@/lib/wallet";

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
 */
export async function POST(request: NextRequest) {
  try {
    if (!YOCO_SECRET_KEY) {
      throw new AppError("Yoco secret key not configured", 500, "CONFIG_ERROR");
    }

    const body = await request.json();
    const { walletId, amount, successUrl, cancelUrl } = body;

    if (!walletId || !amount) {
      throw new AppError("walletId and amount are required", 400, "MISSING_FIELDS");
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new AppError("Amount must be a positive number", 400, "INVALID_AMOUNT");
    }

    // Verify wallet exists
    const wallet = await getWalletOrThrow(walletId);

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
        successUrl: successUrl || "https://your-app.vercel.app/deposit/success",
        cancelUrl: cancelUrl || "https://your-app.vercel.app/deposit/cancel",
        metadata: {
          walletId: wallet.id,
          walletName: wallet.name,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Yoco checkout error:", errorData);
      throw new AppError(
        `Yoco checkout failed: ${errorData.message || response.statusText}`,
        response.status,
        "YOCO_ERROR"
      );
    }

    const checkout = await response.json();

    return Response.json({
      checkoutId: checkout.id,
      redirectUrl: checkout.redirectUrl,
      amount: Number(amount),
      walletId: wallet.id,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
