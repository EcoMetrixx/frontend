// src/features/clients/services/clientsApi.ts

export interface ClientDto {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  phone?: string | null;
  bank?: string | null;
  bonus?: string | null;
  creditStatus?: string | null;
  birthDate?: string | null;
  civilStatus?: string | null;
  address?: string | null;
  region?: string | null;
  province?: string | null;
  employmentType?: string | null;
  occupation?: string | null;
  jobSeniority?: number | null;
  familyLoad?: number | null;
  familyIncome?: number | null;
  savings?: number | null;
  debts?: number | null;
  firstHome?: boolean | null;
  notes?: string | null;
}

export interface ClientFilters {
  bono?: string;
  banco?: string;
  estadoCredito?: string;
  asesor?: string;
  dni?: string;
}

export type CreateClientDto = Omit<ClientDto, "id" | "creditStatus">;
export type UpdateClientDto = Partial<CreateClientDto>;

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

      if (maybeToken) {
        return maybeToken;
      }
    } catch {
    }
  }

  return null;
}

function getAuthHeaders(): Record<string, string> {
  const token = findTokenInLocalStorage();
  if (!token) return {};
  if (token.startsWith("Bearer ")) {
    return { Authorization: token };
  }
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
      console.error("[clientsApi] error", response.status, body ?? {});
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

export async function getClients(
  filters: ClientFilters = {}
): Promise<ClientDto[]> {
  const params = new URLSearchParams();

  if (filters.bono) params.append("bonus", filters.bono);
  if (filters.banco) params.append("bank", filters.banco);
  if (filters.estadoCredito) params.append("creditStatus", filters.estadoCredito);
  if (filters.asesor) params.append("advisor", filters.asesor);
  if (filters.dni) params.append("dni", filters.dni);

  const query = params.toString();
  const path = query ? `/clients?${query}` : "/clients";

  const data = await request<ClientDto[] | ClientDto>(path);
  if (Array.isArray(data)) return data;
  return [data];
}

export async function createClient(
  payload: CreateClientDto
): Promise<ClientDto> {
  return request<ClientDto>("/clients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateClient(
  id: string,
  payload: UpdateClientDto
): Promise<ClientDto> {
  return request<ClientDto>(`/clients/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteClient(id: string): Promise<void> {
  await request<void>(`/clients/${id}`, {
    method: "DELETE",
  });
}
