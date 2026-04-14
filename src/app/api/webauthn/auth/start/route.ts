import { NextRequest } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import prisma from "@/lib/prisma";
import { RP_ID, MOCK_USER_ID, CHALLENGE_TTL_MS } from "@/lib/webauthn";

/**
 * POST /api/webauthn/auth/start
 *
 * Generates WebAuthn authentication options.
 * Returns a PublicKeyCredentialRequestOptionsJSON that the browser passes
 * to navigator.credentials.get() via @simplewebauthn/browser.
 */
export async function POST(_req: NextRequest) {
  try {
    // Clean up stale challenges
    await prisma.webAuthnChallenge.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    const credentials = await prisma.webAuthnCredential.findMany({
      where: { userId: MOCK_USER_ID },
      select: { id: true, transports: true },
    });

    if (credentials.length === 0) {
      return Response.json(
        { error: "No credentials registered. Please set up biometric in Settings first." },
        { status: 400 }
      );
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: "preferred",
      allowCredentials: credentials.map((c) => ({
        id: c.id,
        transports: c.transports as AuthenticatorTransport[],
      })),
    });

    await prisma.webAuthnChallenge.create({
      data: {
        userId: MOCK_USER_ID,
        challenge: options.challenge,
        purpose: "auth",
        expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
      },
    });

    return Response.json(options);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[webauthn] auth/start error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
