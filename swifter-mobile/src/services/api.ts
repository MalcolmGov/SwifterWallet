import { API_BASE_URL } from "../constants/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data as T;
}

// ─── User ────────────────────────────────────────────────────────

export interface UserData {
  id: string;
  email: string;
  name: string | null;
  wallets: WalletData[];
}

export async function createUser(email: string, name?: string) {
  return request<{ user: UserData }>("/api/user/create", {
    method: "POST",
    body: JSON.stringify({ email, name }),
  });
}

export async function getUser(id: string) {
  return request<UserData>(`/api/user/${id}`);
}

// ─── Wallets ─────────────────────────────────────────────────────

export interface WalletData {
  id: string;
  name: string;
  type: string;
  balance: string;
  createdAt: string;
}

export async function listWallets(userId: string) {
  return request<{ wallets: WalletData[] }>(`/api/wallet/list?userId=${userId}`);
}

export async function createWallet(userId: string, name: string, type?: string) {
  return request<{ wallet: WalletData }>("/api/wallet/create", {
    method: "POST",
    body: JSON.stringify({ userId, name, type }),
  });
}

export async function getBalance(walletId: string) {
  return request<{ walletId: string; name: string; cachedBalance: string; ledgerBalance: string }>(
    `/api/wallet/${walletId}/balance`
  );
}

// ─── Transactions ────────────────────────────────────────────────

export interface TransactionEntry {
  id: string;
  amount: string;
  type: "DEBIT" | "CREDIT";
  transactionType: "DEPOSIT" | "TRANSFER" | "PAYMENT";
  status: string;
  description: string | null;
  createdAt: string;
}

export async function getTransactions(
  walletId: string,
  options?: { limit?: number; offset?: number; type?: "DEBIT" | "CREDIT" }
) {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));
  if (options?.type) params.set("type", options.type);

  return request<{ entries: TransactionEntry[]; total: number }>(
    `/api/wallet/${walletId}/transactions?${params.toString()}`
  );
}

// ─── Transfer ────────────────────────────────────────────────────

export async function transfer(fromWalletId: string, toWalletId: string, amount: number, description?: string) {
  return request<{ message: string; transactionId: string; fromBalance: string; toBalance: string }>(
    "/api/wallet/transfer",
    {
      method: "POST",
      body: JSON.stringify({ fromWalletId, toWalletId, amount, description }),
    }
  );
}

// ─── Payment ─────────────────────────────────────────────────────

export async function makePayment(walletId: string, amount: number, description?: string, referenceId?: string) {
  return request<{ message: string; transactionId: string; newBalance: string }>(
    "/api/wallet/payment",
    {
      method: "POST",
      body: JSON.stringify({ walletId, amount, description, referenceId }),
    }
  );
}

// ─── Deposit (Yoco Checkout) ─────────────────────────────────────

export async function createDeposit(walletId: string, amount: number, successUrl?: string, cancelUrl?: string) {
  return request<{ checkoutId: string; redirectUrl: string; amount: number; walletId: string }>(
    "/api/wallet/deposit",
    {
      method: "POST",
      body: JSON.stringify({ walletId, amount, successUrl, cancelUrl }),
    }
  );
}
