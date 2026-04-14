import { NextRequest } from "next/server";
import { executeTransfer } from "@/lib/transfer";
import { errorResponse, AppError } from "@/lib/errors";

/**
 * POST /api/wallet/transfer
 * Body: { fromWalletId, toWalletId, amount, description? }
 *
 * Executes an internal transfer between two wallets.
 * No real money moves — this is purely ledger-based.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromWalletId, toWalletId, amount, description } = body;

    if (!fromWalletId || !toWalletId || !amount) {
      throw new AppError(
        "fromWalletId, toWalletId, and amount are required",
        400,
        "MISSING_FIELDS"
      );
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new AppError("Amount must be a positive number", 400, "INVALID_AMOUNT");
    }

    const result = await executeTransfer({
      fromWalletId,
      toWalletId,
      amount,
      description,
    });

    return Response.json({
      message: "Transfer completed",
      transactionId: result.transaction.id,
      fromBalance: result.fromBalance,
      toBalance: result.toBalance,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
