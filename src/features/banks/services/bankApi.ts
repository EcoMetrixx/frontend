// src/features/banks/services/bankApi.ts

export interface BankDto {
  id: string;
  name: string;
  description?: string | null;
  tea?: number | null;
  tem?: number | null;
  availableTerms: number[];
  gracePeriod?: number | null;
  evaluationFee?: number | null;
  lifeInsurance?: number | null;
  adminFees?: number | null;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

function findTokenInLocalStorage(): string | null {
  if (typeof window === "undefined") return null;

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    if (raw.includes(".") && raw.split(".").length === 3) {
      return raw;
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const maybeToken =
        typeof parsed.accessToken === "string"
          ? parsed.accessToken
          : typeof parsed.token === "string"
          ? parsed.token
          : typeof parsed.jwt === "string"
          ? parsed.jwt
          : null;
      if (maybeToken) return maybeToken;
    } catch {
    }
  }

  return null;
}

function getAuthHeaders(): Record<string, string> {
  const token = findTokenInLocalStorage();
  if (!token) return {};
  if (token.startsWith("Bearer ")) return { Authorization: token };
  return { Authorization: `Bearer ${token}` };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(options && options.headers),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let body: any = null;
    try {
      body = await response.json();
    } catch {}

    try {
      console.error("[bankApi] error", response.status, body ?? {});
    } catch {}

    const message =
      body && body.message
        ? body.message
        : `Cannot ${options?.method ?? "GET"} ${path}`;
    const error: any = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return (await response.json()) as T;
}

export async function getBanks(): Promise<BankDto[]> {
  return request<BankDto[]>("/banks");
}

export async function getAvailableBanksForClient(
  clientId: string
): Promise<BankDto[]> {
  if (!clientId) return getBanks();
  return request<BankDto[]>(`/banks/available/${clientId}`);
}
