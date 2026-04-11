import { Decimal } from "@prisma/client/runtime/library";
import prisma from "./prisma";
import { AppError } from "./errors";
import { computeBalanceInTx } from "./wallet";

interface PaymentParams {
  walletId: string;
  amount: number | string;
  description?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Process a payment (money out) from a wallet.
 *
 * 1. Validate wallet exists
 * 2. Check sufficient funds
 * 3. Create a PAYMENT transaction
 * 4. Write a DEBIT ledger entry
 * 5. Update cached balance
 */
export async function executePayment({
  walletId,
  amount: rawAmount,
  description,
  referenceId,
  metadata,
}: PaymentParams) {
  const amount = new Decimal(rawAmount);

  if (amount.lte(0)) {
    throw new AppError("Amount must be positive", 400, "INVALID_AMOUNT");
  }

  return prisma.$transaction(async (tx) => {
    // Idempotency: if referenceId provided, check for duplicates
    if (referenceId) {
      const existing = await tx.transaction.findUnique({
        where: { referenceId },
      });
      if (existing) {
        return { message: "Already processed", transactionId: existing.id };
      }
    }

    // 1. Verify wallet exists
    const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) {
      throw new AppError("Wallet not found", 404, "WALLET_NOT_FOUND");
    }

    // 2. Check balance
    const currentBalance = await computeBalanceInTx(tx, walletId);
    if (currentBalance.lt(amount)) {
      throw new AppError(
        `Insufficient funds. Available: ${currentBalance.toString()}`,
        400,
        "INSUFFICIENT_FUNDS"
      );
    }

    // 3. Create payment transaction
    const transaction = await tx.transaction.create({
      data: {
        type: "PAYMENT",
        status: "COMPLETED",
        amount,
        description: description ?? `Payment of R${amount.toString()}`,
        referenceId,
        metadata: metadata ?? undefined,
      },
    });

    // 4. Write DEBIT ledger entry
    const newBalance = currentBalance.sub(amount);
    await tx.ledgerEntry.create({
      data: {
        transactionId: transaction.id,
        walletId,
        amount,
        type: "DEBIT",
        runningBalance: newBalance,
      },
    });

    // 5. Sync cached balance
    await tx.wallet.update({
      where: { id: walletId },
      data: { balance: newBalance },
    });

    return {
      message: "Payment processed",
      transactionId: transaction.id,
      newBalance: newBalance.toString(),
    };
  });
}
