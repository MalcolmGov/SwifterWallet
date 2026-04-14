import { NextRequest } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import prisma from "@/lib/prisma";
import { RP_ID, ORIGIN, MOCK_USER_ID } from "@/lib/webauthn";

/**
 * POST /api/webauthn/auth/finish
 *
 * Verifies the assertion produced by navigator.credentials.get() and
 * bumps the credential counter to protect against replay attacks.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const record = await prisma.webAuthnChallenge.findFirst({
      where: { userId: MOCK_USER_ID, purpose: "auth" },
      orderBy: { createdAt: "desc" },
    });

    if (!record || record.expiresAt < new Date()) {
      return Response.json(
        { error: "No valid authentication challenge found. Please try again." },
        { status: 400 }
      );
    }

    const credentialRecord = await prisma.webAuthnCredential.findUnique({
      where: { id: body.id },
    });

    if (!credentialRecord) {
      return Response.json(
        { error: "Credential not found. Please re-register your biometric." },
        { status: 400 }
      );
    }

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge: record.challenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        credential: {
          id: credentialRecord.id,
          publicKey: new Uint8Array(credentialRecord.credentialPublicKey),
          counter: credentialRecord.counter,
          transports: credentialRecord.transports as AuthenticatorTransport[],
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Verification failed";
      console.error("[webauthn] authentication verification error:", msg);
      // Always clean up challenge on failure too
      await prisma.webAuthnChallenge.delete({ where: { id: record.id } });
      return Response.json({ error: msg }, { status: 400 });
    }

    // Always consume the challenge
    await prisma.webAuthnChallenge.delete({ where: { id: record.id } });

    if (!verification.verified) {
      return Response.json({ verified: false });
    }

    // Bump counter — prevents credential replay attacks
    await prisma.webAuthnCredential.update({
      where: { id: credentialRecord.id },
      data: { counter: verification.authenticationInfo.newCounter },
    });

    return Response.json({ verified: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[webauthn] auth/finish error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
