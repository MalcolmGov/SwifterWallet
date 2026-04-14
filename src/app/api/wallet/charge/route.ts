import { NextRequest } from "next/server";
import { errorResponse, AppError } from "@/lib/errors";

const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;

/**
 * POST /api/wallet/charge
 * Body: { token, amountInCents, walletId }
 *
 * Charges a card token obtained from the Yoco Web SDK popup.
 * This is the server-side step that completes the payment after
 * the client-side SDK has tokenized the card and handled 3DS.
 */
export async function POST(request: NextRequest) {
  try {
    if (!YOCO_SECRET_KEY) {
      throw new AppError("Yoco secret key not configured", 500, "CONFIG_ERROR");
    }

    const body = await request.json();
    const { token, amountInCents, walletId } = body;

    if (!token || !amountInCents) {
      throw new AppError("token and amountInCents are required", 400, "MISSING_FIELDS");
    }

    console.log(`[charge] Charging token ${token.substring(0, 10)}... for ${amountInCents} cents, wallet: ${walletId}`);

    // Charge the token using Yoco's API
    const response = await fetch("https://online.yoco.com/v1/charges/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Secret-Key": YOCO_SECRET_KEY,
      },
      body: JSON.stringify({
        token,
        amountInCents: Number(amountInCents),
        currency: "ZAR",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Yoco charge error:", response.status, JSON.stringify(data));
      throw new AppError(
        `Payment failed: ${data.displayMessage || data.errorMessage || response.statusText}`,
        response.status,
        "YOCO_CHARGE_ERROR"
      );
    }

    console.log(`[charge] Success! Charge ID: ${data.id}, Status: ${data.status}`);

    return Response.json({
      success: true,
      chargeId: data.id,
      status: data.status,
      amount: amountInCents / 100,
      walletId,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
