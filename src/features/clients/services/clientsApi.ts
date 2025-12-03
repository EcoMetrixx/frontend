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
  propertyId: string;
}

export interface ClientFilters {
  bono?: string;
  banco?: string;
  estadoCredito?: string;
  asesor?: string;
  dni?: string;
}

// El backend se encarga de creditStatus, aquí no se envía
export type CreateClientDto = Omit<ClientDto, "id" | "creditStatus">;
export type UpdateClientDto = Partial<CreateClientDto>;

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

// =======================
//  DETECCIÓN DEL TOKEN
// =======================

const JWT_REGEX = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

/**
 * Intenta extraer un JWT de un storage dado (localStorage o sessionStorage)
 */
function findTokenInStorage(
  storage: Storage | null | undefined
): string | null {
  if (!storage) return null;

  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (!key) continue;

    const raw = storage.getItem(key);
    if (!raw) continue;

    // Caso 1: el valor ES directamente un JWT válido
    if (JWT_REGEX.test(raw)) {
      return raw;
    }

    // Caso 2: intentamos parsear como JSON
    try {
      const parsed = JSON.parse(raw);

      // 2a) El JSON es directamente un string con el JWT
      if (typeof parsed === "string" && JWT_REGEX.test(parsed)) {
        return parsed;
      }

      // 2b) El JSON es un objeto con posibles campos de token
      if (parsed && typeof parsed === "object") {
        const obj = parsed as Record<string, unknown>;

        const candidates: (string | undefined)[] = [
          typeof obj.accessToken === "string" ? obj.accessToken : undefined,
          typeof (obj as any).access_token === "string"
            ? (obj as any).access_token
            : undefined,
          typeof obj.token === "string" ? obj.token : undefined,
          typeof obj.jwt === "string" ? obj.jwt : undefined,
        ];

        for (const c of candidates) {
          if (c && JWT_REGEX.test(c)) {
            return c;
          }
        }

        // 2c) Buscar en cualquier valor string dentro del objeto
        for (const value of Object.values(obj)) {
          if (typeof value === "string" && JWT_REGEX.test(value)) {
            return value;
          }
        }
      }
    } catch {
      // no era JSON, lo ignoramos
    }
  }

  return null;
}

/**
 * Busca un JWT en localStorage y sessionStorage.
 * Soporta varios formatos:
 * - Valor directo:   storage.setItem("token", "<jwt>")
 * - JSON string:     storage.setItem("token", JSON.stringify("<jwt>"))
 * - Objeto:          { accessToken | access_token | token | jwt }
 */
function findToken(): string | null {
  if (typeof window === "undefined") return null;

  // Primero localStorage, luego sessionStorage
  return (
    findTokenInStorage(window.localStorage) ??
    findTokenInStorage(window.sessionStorage)
  );
}

function getAuthHeaders(): Record<string, string> {
  const token = findToken();

  if (!token) {
    // Si aquí no hay token, todas las llamadas protegidas caerán en 401
    return {};
  }

  // Si ya viene con "Bearer " lo respetamos
  if (token.startsWith("Bearer ")) {
    return { Authorization: token };
  }

  return { Authorization: `Bearer ${token}` };
}

// =======================
//  REQUEST GENÉRICO
// =======================

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
    } catch {
      // body no es JSON
    }

    try {
      console.error("[clientsApi] error", response.status, body ?? {});
    } catch {
      // no pasa nada si el console.error falla
    }

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

// =======================
//  MÉTODOS PÚBLICOS
// =======================

export async function getClients(
  filters: ClientFilters = {}
): Promise<ClientDto[]> {
  const params = new URLSearchParams();

  if (filters.bono) params.append("bonus", filters.bono);
  if (filters.banco) params.append("bank", filters.banco);
  if (filters.estadoCredito)
    params.append("creditStatus", filters.estadoCredito);
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
