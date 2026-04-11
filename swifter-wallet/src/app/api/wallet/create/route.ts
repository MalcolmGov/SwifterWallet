import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getUserOrThrow } from "@/lib/wallet";
import { errorResponse, AppError } from "@/lib/errors";

/**
 * POST /api/wallet/create
 * Body: { userId, name, type? }
 *
 * Creates a new wallet for the given user.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, type } = body;

    if (!userId || !name) {
      throw new AppError("userId and name are required", 400, "MISSING_FIELDS");
    }

    // Verify user exists
    await getUserOrThrow(userId);

    const wallet = await prisma.wallet.create({
      data: {
        userId,
        name,
        type: type ?? "MAIN",
      },
    });

    return Response.json({ wallet }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
