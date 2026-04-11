import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { errorResponse, AppError } from "@/lib/errors";

/**
 * GET /api/wallet/list?userId=<uuid>
 *
 * Returns all wallets for a given user with their cached balances.
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      throw new AppError("userId query parameter is required", 400, "MISSING_FIELDS");
    }

    const wallets = await prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        balance: true,
        createdAt: true,
      },
    });

    return Response.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      wallets: wallets.map((w: any) => ({
        ...w,
        balance: w.balance.toString(),
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
