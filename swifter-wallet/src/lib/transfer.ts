import { Decimal } from "@prisma/client/runtime/library";
import prisma from "./prisma";
import { AppError } from "./errors";
import { computeBalanceInTx } from "./wallet";

interface TransferParams {
  fromWalletId: string;
  toWalletId: string;
  amount: number | string;
  description?: string;
}

/**
 * Execute an internal transfer between two wallets using double-entry
 * ledger accounting inside a single database transaction.
 *
 * 1. Validate both wallets exist
 * 2. Check the sender has sufficient funds
 * 3. Create a TRANSFER transaction
 * 4. Write two ledger entries (DEBIT sender, CREDIT receiver)
 * 5. Update cached balances on both wallets
 */
export async function executeTransfer({
  fromWalletId,
  toWalletId,
  amount: rawAmount,
  description,
}: TransferParams) {
  const amount = new Decimal(rawAmount);

  if (amount.lte(0)) {
    throw new AppError("Amount must be positive", 400, "INVALID_AMOUNT");
  }

  if (fromWalletId === toWalletId) {
    throw new AppError("Cannot transfer to the same wallet", 400, "SAME_WALLET");
  }

  return prisma.$transaction(async (tx) => {
    // 1. Fetch both wallets
    const [fromWallet, toWallet] = await Promise.all([
      tx.wallet.findUnique({ where: { id: fromWalletId } }),
      tx.wallet.findUnique({ where: { id: toWalletId } }),
    ]);

    if (!fromWallet) throw new AppError("Source wallet not found", 404, "WALLET_NOT_FOUND");
    if (!toWallet) throw new AppError("Destination wallet not found", 404, "WALLET_NOT_FOUND");

    // 2. Check balance from ledger (source of truth)
    const senderBalance = await computeBalanceInTx(tx, fromWalletId);
    if (senderBalance.lt(amount)) {
      throw new AppError(
        `Insufficient funds. Available: ${senderBalance.toString()}`,
        400,
        "INSUFFICIENT_FUNDS"
      );
    }

    // 3. Create the transaction record
    const transaction = await tx.transaction.create({
      data: {
        type: "TRANSFER",
        status: "COMPLETED",
        amount,
        description: description ?? `Transfer from ${fromWallet.name} to ${toWallet.name}`,
      },
    });

    // 4. Write ledger entries — DEBIT sender, CREDIT receiver
    const priorSender = await computeBalanceInTx(tx, fromWalletId);
    const priorReceiver = await computeBalanceInTx(tx, toWalletId);
    const senderAfterDebit = priorSender.sub(amount);
    const receiverAfterCredit = priorReceiver.add(amount);

    await tx.ledgerEntry.createMany({
      data: [
        {
          transactionId: transaction.id,
          walletId: fromWalletId,
          amount, // always positive
          type: "DEBIT",
          runningBalance: senderAfterDebit,
        },
        {
          transactionId: transaction.id,
          walletId: toWalletId,
          amount, // always positive
          type: "CREDIT",
          runningBalance: receiverAfterCredit,
        },
      ],
    });

    // 5. Compute and sync cached balances
    const newSenderBalance = await computeBalanceInTx(tx, fromWalletId);
    const newReceiverBalance = await computeBalanceInTx(tx, toWalletId);

    await Promise.all([
      tx.wallet.update({
        where: { id: fromWalletId },
        data: { balance: newSenderBalance },
      }),
      tx.wallet.update({
        where: { id: toWalletId },
        data: { balance: newReceiverBalance },
      }),
    ]);

    return {
      transaction,
      fromBalance: newSenderBalance.toString(),
      toBalance: newReceiverBalance.toString(),
    };
  });
}
