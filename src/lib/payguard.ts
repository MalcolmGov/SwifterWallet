/**
 * PayGuard Fraud Detection — SwifterWallet REST client.
 *
 * Calls the PayGuard api-gateway directly. Kept deliberately thin so we
 * can swap to `@payguard/sdk` later without touching callers.
 *
 * Reads `NEXT_PUBLIC_PAYGUARD_API_KEY` (Bearer token) and optionally
 * `NEXT_PUBLIC_PAYGUARD_ENV` (sandbox|production, default sandbox).
 */

const ENDPOINTS = {
  sandbox: 'https://api-sandbox.payguard.africa',
  production: 'https://api.payguard.africa',
} as const;

type Env = keyof typeof ENDPOINTS;

export type Decision = 'APPROVE' | 'REVIEW' | 'BLOCK' | 'STEP_UP';

export interface AssessInput {
  userId: string;
  transactionId: string;
  amount: number;
  currency?: string;
  recipientId?: string;
  recipientInContacts?: boolean;
  isOnActiveCall?: boolean;
  metadata?: Record<string, unknown>;
}

export interface AssessResult {
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommended_action: Decision;
  triggered_rules: string[];
  warning_message: string | null;
  decision_id?: string;
  timeout?: boolean;
}

function config(): { apiKey: string; baseUrl: string } | null {
  const apiKey = process.env.NEXT_PUBLIC_PAYGUARD_API_KEY;
  if (!apiKey) return null;
  const envName = (process.env.NEXT_PUBLIC_PAYGUARD_ENV as Env | undefined) ?? 'sandbox';
  return { apiKey, baseUrl: ENDPOINTS[envName] ?? ENDPOINTS.sandbox };
}

/**
 * Assess a transaction before it goes to the PSP.
 * Fails open (returns APPROVE) if PayGuard is unreachable or unconfigured —
 * callers should NOT block payments on an infra blip.
 */
export async function assessTransaction(input: AssessInput): Promise<AssessResult> {
  const cfg = config();
  if (!cfg) {
    return failOpen('NEXT_PUBLIC_PAYGUARD_API_KEY not configured');
  }

  const payload = {
    payload_id: input.transactionId,
    user_id: input.userId,
    transaction: {
      amount: input.amount,
      currency: input.currency ?? 'ZAR',
      ...(input.recipientId ? { recipient_id: input.recipientId } : {}),
    },
    call: { is_on_active_call: input.isOnActiveCall ?? false },
    recipient_in_contacts: input.recipientInContacts ?? true,
    metadata: { source: 'SwifterWallet', ...(input.metadata ?? {}) },
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const resp = await fetch(`${cfg.baseUrl}/v1/assess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!resp.ok) return failOpen(`PayGuard HTTP ${resp.status}`);
    const data = (await resp.json()) as AssessResult;
    return data;
  } catch (err) {
    return failOpen(`PayGuard unreachable: ${(err as Error).message}`);
  }
}

/** Light-touch session risk check fired after successful biometric auth. */
export async function assessSession(userId: string): Promise<AssessResult> {
  return assessTransaction({
    userId,
    transactionId: `SESSION-${Date.now()}`,
    amount: 0,
    metadata: { event: 'session_start', channel: 'biometric_auth' },
  });
}

function failOpen(reason: string): AssessResult {
  if (typeof console !== 'undefined') console.warn('[payguard] fail-open:', reason);
  return {
    risk_score: 0,
    risk_level: 'LOW',
    recommended_action: 'APPROVE',
    triggered_rules: [],
    warning_message: null,
    timeout: true,
  };
}
