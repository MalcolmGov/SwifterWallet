import { NextResponse } from "next/server";

/**
 * Returns a short-lived signed URL for starting an ElevenLabs
 * Conversational AI WebSocket session. Used only when the agent
 * is set to Private (so the API key never leaves the server).
 *
 * Docs: https://elevenlabs.io/docs/conversational-ai/authentication
 */
export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    return NextResponse.json(
      { error: "Missing ELEVENLABS_API_KEY or ELEVENLABS_AGENT_ID" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(
        agentId
      )}`,
      { method: "GET", headers: { "xi-api-key": apiKey }, cache: "no-store" }
    );

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json(
        { error: "ElevenLabs signed-url request failed", details: body },
        { status: res.status }
      );
    }

    const data = (await res.json()) as { signed_url: string };
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error", details: (err as Error).message },
      { status: 500 }
    );
  }
}
