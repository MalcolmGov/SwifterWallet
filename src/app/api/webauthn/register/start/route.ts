import { NextRequest } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import prisma from "@/lib/prisma";
import {
  RP_ID,
  RP_NAME,
  MOCK_USER_ID,
  MOCK_USER_EMAIL,
  MOCK_USER_NAME,
  CHALLENGE_TTL_MS,
} from "@/lib/webauthn";

/**
 * POST /api/webauthn/register/start
 *
 * Generates WebAuthn registration options for the mock user.
 * Returns a PublicKeyCredentialCreationOptionsJSON that the browser
 * passes to navigator.credentials.create() via @simplewebauthn/browser.
 */
export async function POST(_req: NextRequest) {
  try {
    // Clean up stale challenges first
    await prisma.webAuthnChallenge.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    // Exclude credentials already registered for this user
    const existing = await prisma.webAuthnCredential.findMany({
      where: { userId: MOCK_USER_ID },
      select: { id: true, transports: true },
    });

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: new TextEncoder().encode(MOCK_USER_ID),
      userName: MOCK_USER_EMAIL,
      userDisplayName: MOCK_USER_NAME,
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        // "platform" prefers the built-in sensor (Face ID / Touch ID /
        // Windows Hello). Remove if you also want roaming keys (YubiKey etc.).
        authenticatorAttachment: "platform",
      },
      excludeCredentials: existing.map((c) => ({
        id: c.id,
        transports: c.transports as AuthenticatorTransport[],
      })),
    });

    // Persist challenge so finish route can verify it
    await prisma.webAuthnChallenge.create({
      data: {
        userId: MOCK_USER_ID,
        challenge: options.challenge,
        purpose: "register",
        expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
      },
    });

    return Response.json(options);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
