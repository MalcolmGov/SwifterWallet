import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getWalletOrThrow } from "@/lib/wallet";
import { errorResponse } from "@/lib/errors";

/**
 * GET /api/wallet/:id/transactions?limit=20&offset=0&type=CREDIT
 *
 * Returns the transaction history for a wallet via its ledger entries.
 * Optionally filter by ledger entry type (DEBIT or CREDIT).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await getWalletOrThrow(id);

    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 100);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const entryType = url.searchParams.get("type")?.toUpperCase(); // DEBIT or CREDIT

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { walletId: id };
    if (entryType === "DEBIT" || entryType === "CREDIT") {
      where.type = entryType;
    }

    const entries = await prisma.ledgerEntry.findMany({
      where,
      include: {
        transaction: {
          select: {
            id: true,
            type: true,
            status: true,
            description: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.ledgerEntry.count({ where });

    return Response.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entries: entries.map((e: any) => ({
        id: e.id,
        amount: e.amount.toString(),
        type: e.type,
        transactionType: e.transaction.type,
        status: e.transaction.status,
        description: e.transaction.description,
        createdAt: e.createdAt,
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
