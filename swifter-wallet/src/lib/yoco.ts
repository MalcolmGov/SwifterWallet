import crypto from "crypto";
import { Decimal } from "@prisma/client/runtime/library";
import prisma from "./prisma";
import { AppError } from "./errors";
import { computeBalanceInTx } from "./wallet";

/**
 * Verify the webhook signature from Yoco.
 * Yoco signs webhooks with HMAC-SHA256 using your webhook secret.
 */
export function verifyYocoSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

interface YocoPaymentEvent {
  id: string;
  type: string;
  payload: {
    id: string;
    status: string;
    amount: number; // in cents
    currency: string;
    metadata?: {
      walletId?: string;
      userId?: string;
    };
  };
}

/**
 * Process a successful Yoco payment and credit the target wallet.
 *
 * - Idempotent: uses the Yoco payment ID as referenceId
 * - Creates a DEPOSIT transaction + CREDIT ledger entry
 * - Updates the wallet's cached balance
 */
export async function processYocoDeposit(event: YocoPaymentEvent) {
  const { payload } = event;
  const walletId = payload.metadata?.walletId;

  if (!walletId) {
    throw new AppError("Missing walletId in payment metadata", 400, "MISSING_WALLET_ID");
  }

  if (payload.status !== "successful") {
    throw new AppError("Payment not successful", 400, "PAYMENT_NOT_SUCCESSFUL");
  }

  // Convert cents to rands
  const amount = new Decimal(payload.amount).div(100);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prisma.$transaction(async (tx: any) => {
    // Idempotency check: skip if we already processed this payment
    const existing = await tx.transaction.findUnique({
      where: { referenceId: payload.id },
    });

    if (existing) {
      return { message: "Already processed", transactionId: existing.id };
    }

    // Verify wallet exists
    const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) {
      throw new AppError("Wallet not found", 404, "WALLET_NOT_FOUND");
    }

    // Create deposit transaction
    const transaction = await tx.transaction.create({
      data: {
        type: "DEPOSIT",
        status: "COMPLETED",
        amount,
        referenceId: payload.id,
        description: `Yoco deposit of R${amount.toString()}`,
        metadata: event as unknown as Record<string, unknown>,
      },
    });

    // Write ledger entry (CREDIT = money in)
    const priorBalance = await computeBalanceInTx(tx, walletId);
    const runningBalance = priorBalance.add(amount);
    await tx.ledgerEntry.create({
      data: {
        transactionId: transaction.id,
        walletId,
        amount,
        type: "CREDIT",
        runningBalance,
      },
    });

    // Compute and sync cached balance
    const newBalance = await computeBalanceInTx(tx, walletId);
    await tx.wallet.update({
      where: { id: walletId },
      data: { balance: newBalance },
    });

    return {
      message: "Deposit processed",
      transactionId: transaction.id,
      newBalance: newBalance.toString(),
    };
  });
}
