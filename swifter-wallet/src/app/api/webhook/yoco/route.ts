import { NextRequest } from "next/server";
import { verifyYocoSignature, processYocoDeposit } from "@/lib/yoco";
import { errorResponse, AppError } from "@/lib/errors";

const WEBHOOK_SECRET = process.env.YOCO_WEBHOOK_SECRET;

/**
 * POST /api/webhook/yoco
 *
 * Receives payment webhooks from Yoco.
 * - Verifies HMAC signature
 * - Prevents duplicate processing (idempotent)
 * - Credits the wallet specified in payment metadata
 */
export async function POST(request: NextRequest) {
  try {
    if (!WEBHOOK_SECRET) {
      throw new AppError("Webhook secret not configured", 500, "CONFIG_ERROR");
    }

    // Read raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-yoco-signature") ?? "";

    // Verify webhook authenticity
    if (!verifyYocoSignature(rawBody, signature, WEBHOOK_SECRET)) {
      throw new AppError("Invalid webhook signature", 401, "INVALID_SIGNATURE");
    }

    const event = JSON.parse(rawBody);

    // Only process payment.successful events
    if (event.type !== "payment.successful") {
      return Response.json({ message: "Event type ignored" }, { status: 200 });
    }

    const result = await processYocoDeposit(event);

    return Response.json(result, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}
