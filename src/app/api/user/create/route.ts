import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { errorResponse, AppError } from "@/lib/errors";

/**
 * POST /api/user/create
 * Body: { email, name? }
 *
 * Creates a new user. Returns existing user if email already taken.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      throw new AppError("email is required", 400, "MISSING_FIELDS");
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name },
    });

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
