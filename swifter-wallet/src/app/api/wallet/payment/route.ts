import { NextRequest } from "next/server";
import { executePayment } from "@/lib/payment";
import { errorResponse, AppError } from "@/lib/errors";

/**
 * POST /api/wallet/payment
 * Body: { walletId, amount, description?, referenceId?, metadata? }
 *
 * Processes a payment (money out) from a wallet.
 * Checks balance, creates a PAYMENT transaction with a DEBIT ledger entry.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletId, amount, description, referenceId, metadata } = body;

    if (!walletId || !amount) {
      throw new AppError("walletId and amount are required", 400, "MISSING_FIELDS");
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new AppError("Amount must be a positive number", 400, "INVALID_AMOUNT");
    }

    const result = await executePayment({
      walletId,
      amount,
      description,
      referenceId,
      metadata,
    });

    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
