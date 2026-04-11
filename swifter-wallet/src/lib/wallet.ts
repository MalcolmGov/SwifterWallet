import { Decimal } from "@prisma/client/runtime/library";
import prisma from "./prisma";
import { AppError } from "./errors";

/**
 * Compute a wallet's balance from the ledger (source of truth).
 * Credits add to the balance, debits subtract.
 */
export async function computeBalance(walletId: string): Promise<Decimal> {
  const credits = await prisma.ledgerEntry.aggregate({
    where: { walletId, type: "CREDIT" },
    _sum: { amount: true },
  });
  const debits = await prisma.ledgerEntry.aggregate({
    where: { walletId, type: "DEBIT" },
    _sum: { amount: true },
  });

  const totalCredits = credits._sum.amount ?? new Decimal(0);
  const totalDebits = debits._sum.amount ?? new Decimal(0);

  return totalCredits.sub(totalDebits);
}

/**
 * Compute balance within a Prisma transaction context.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function computeBalanceInTx(tx: any, walletId: string): Promise<Decimal> {
  const credits = await tx.ledgerEntry.aggregate({
    where: { walletId, type: "CREDIT" },
    _sum: { amount: true },
  });
  const debits = await tx.ledgerEntry.aggregate({
    where: { walletId, type: "DEBIT" },
    _sum: { amount: true },
  });

  const totalCredits = credits._sum.amount ?? new Decimal(0);
  const totalDebits = debits._sum.amount ?? new Decimal(0);

  return totalCredits.sub(totalDebits);
}

/**
 * Sync the cached balance on the wallet row with the ledger.
 */
export async function syncCachedBalance(walletId: string): Promise<Decimal> {
  const balance = await computeBalance(walletId);
  await prisma.wallet.update({
    where: { id: walletId },
    data: { balance },
  });
  return balance;
}

/**
 * Assert a wallet exists and return it, or throw.
 */
export async function getWalletOrThrow(walletId: string) {
  const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
  if (!wallet) throw new AppError("Wallet not found", 404, "WALLET_NOT_FOUND");
  return wallet;
}

/**
 * Assert a user exists and return them, or throw.
 */
export async function getUserOrThrow(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  return user;
}
