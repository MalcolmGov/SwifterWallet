// ─── WebAuthn / FIDO2 shared configuration ───────────────────────────────────
//
// These values are used by the four WebAuthn API routes.
// Override via environment variables for non-localhost deployments.

export const RP_NAME = process.env.WEBAUTHN_RP_NAME ?? "SwifterWallet";

// Must match the effective domain the browser sees (no port, no protocol).
// localhost works without HTTPS; production requires HTTPS.
export const RP_ID = process.env.WEBAUTHN_RP_ID ?? "localhost";

// Full origin string the browser sends in the clientDataJSON.
export const ORIGIN =
  process.env.WEBAUTHN_ORIGIN ?? "http://localhost:3000";

// Demo: single hardcoded user until real auth is wired up.
export const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";
export const MOCK_USER_NAME = "Malcolm Govender";
export const MOCK_USER_EMAIL = "malcolm@swifter.app";

// Challenge TTL in milliseconds.
export const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes
