import { NextRequest } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import prisma from "@/lib/prisma";
import { RP_ID, ORIGIN, MOCK_USER_ID } from "@/lib/webauthn";

/**
 * POST /api/webauthn/register/finish
 *
 * Verifies the attestation produced by navigator.credentials.create() and
 * stores the new credential. Idempotent: upserts on credential ID.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Look up the most-recent unexpired register challenge for this user
    const record = await prisma.webAuthnChallenge.findFirst({
      where: { userId: MOCK_USER_ID, purpose: "register" },
      orderBy: { createdAt: "desc" },
    });

    if (!record || record.expiresAt < new Date()) {
      return Response.json(
        { error: "No valid registration challenge found. Please try again." },
        { status: 400 }
      );
    }

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge: record.challenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Verification failed";
      console.error("[webauthn] registration verification error:", msg);
      return Response.json({ error: msg }, { status: 400 });
    }

    // Always clean up the consumed challenge
    await prisma.webAuthnChallenge.delete({ where: { id: record.id } });

    if (!verification.verified || !verification.registrationInfo) {
      return Response.json({ verified: false });
    }

    const { credential, aaguid } = verification.registrationInfo;

    await prisma.webAuthnCredential.upsert({
      where: { id: credential.id },
      update: {
        credentialPublicKey: Buffer.from(credential.publicKey),
        counter: credential.counter,
      },
      create: {
        id: credential.id,
        userId: MOCK_USER_ID,
        credentialPublicKey: Buffer.from(credential.publicKey),
        counter: credential.counter,
        // transports live on the response, not on registrationInfo.credential
        transports: (body.response?.transports as string[] | undefined) ?? [],
        aaguid: aaguid ?? "",
      },
    });

    return Response.json({ verified: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[webauthn] register/finish error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
