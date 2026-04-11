import { NextRequest } from "next/server";
import { getWalletOrThrow, computeBalance } from "@/lib/wallet";
import { errorResponse } from "@/lib/errors";

/**
 * GET /api/wallet/:id/balance
 *
 * Returns both the cached balance and the computed ledger balance.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const wallet = await getWalletOrThrow(id);
    const ledgerBalance = await computeBalance(id);

    return Response.json({
      walletId: wallet.id,
      name: wallet.name,
      cachedBalance: wallet.balance.toString(),
      ledgerBalance: ledgerBalance.toString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
