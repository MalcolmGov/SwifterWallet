import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { errorResponse, AppError } from "@/lib/errors";

/**
 * GET /api/user/:id
 *
 * Returns a user and their wallets.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        wallets: {
          select: {
            id: true,
            name: true,
            type: true,
            balance: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return Response.json({
      ...user,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      wallets: user.wallets.map((w: any) => ({
        ...w,
        balance: w.balance.toString(),
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
