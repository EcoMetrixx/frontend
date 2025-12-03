// src/features/simulations/services/simulationsApi.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export interface SimulationResultDto {
  tcea?: number;
  TCEA?: number;
  van?: number;
  VAN?: number;
  tir?: number;
  TIR?: number;
  totalInterests?: number;
  totalPayable?: number;
}

export interface SimulationDto {
  id?: string;
  clientId?: string;
  propertyId?: string;
  bankId?: string;
  program?: string;
  amount?: number;
  term?: number;
  monthlyPayment?: number;
  result?: SimulationResultDto;
}

export interface CalculateSimulationRequest {
  amount: number;
  term: number;
  interestRate: number;
  gracePeriod?: number;
  adminFees?: number;
  evaluationFee?: number;
  lifeInsurance?: number;
  currency?: string;
  paymentFrequency?: string;
}

export interface CreateSimulationRequest {
  clientId: string;
  propertyId: string;
  bankId: string;
  program: string;
  amount: number;
  term: number;
  monthlyPayment: number;
  result: SimulationResultDto;
}

// 🔹 Respuesta de export del backend
export interface ExportSimulationResponse {
  message: string;
  downloadUrl: string;
}

type RequestOptions = RequestInit & { responseType?: "json" | "blob" };

// --- helpers para el token ---

function looksLikeJwt(value: unknown): value is string {
  if (typeof value !== "string") return false;
  // 3 partes separadas por ".", típico JWT
  return /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(value);
}

function searchJwtInObject(obj: any): string | null {
  if (!obj) return null;

  if (typeof obj === "string") {
    return looksLikeJwt(obj) ? obj : null;
  }

  if (typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      const value = (obj as any)[key];
      const found = searchJwtInObject(value);
      if (found) return found;
    }
  }

  return null;
}

function extractJwtFromRaw(raw: string | null): string | null {
  if (!raw) return null;

  // 1) El valor entero es un JWT
  if (looksLikeJwt(raw.trim())) {
    return raw.trim();
  }

  // 2) Intentar parsear JSON y buscar dentro
  try {
    const parsed = JSON.parse(raw);
    const found = searchJwtInObject(parsed);
    if (found) return found;
  } catch {
    // ignorar
  }

  return null;
}

function scanStorageForJwt(storage: Storage): string | null {
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key) continue;
    const raw = storage.getItem(key);
    const jwt = extractJwtFromRaw(raw);
    if (jwt) {
      return jwt;
    }
  }
  return null;
}

function findToken(): string | null {
  if (typeof window === "undefined") return null;

  // 1️⃣ Intento rápido con keys típicas
  const candidateKeys = [
    "accessToken",
    "token",
    "authToken",
    "jwt",
    "id_token",
    "idToken",
    "ecometrix_token",
    "ecometrix_auth",
    "user",
    "auth",
    "authUser",
    "auth_user",
    "currentUser",
  ];

  for (const key of candidateKeys) {
    const rawLocal =
      typeof window !== "undefined"
        ? window.localStorage.getItem(key)
        : null;
    const rawSession =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem(key)
        : null;

    const jwtLocal = extractJwtFromRaw(rawLocal);
    if (jwtLocal) return jwtLocal;

    const jwtSession = extractJwtFromRaw(rawSession);
    if (jwtSession) return jwtSession;
  }

  // 2️⃣ Escaneo full de localStorage
  if (typeof window !== "undefined" && window.localStorage) {
    const jwt = scanStorageForJwt(window.localStorage);
    if (jwt) return jwt;
  }

  // 3️⃣ Escaneo full de sessionStorage
  if (typeof window !== "undefined" && window.sessionStorage) {
    const jwt = scanStorageForJwt(window.sessionStorage);
    if (jwt) return jwt;
  }

  return null;
}

function getAuthHeaders(): HeadersInit {
  const token = findToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- request genérico ---

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const { responseType = "json", headers, body, ...rest } = options;

  const finalHeaders: HeadersInit = {
    ...(responseType === "json" && body ? { "Content-Type": "application/json" } : {}),
    ...getAuthHeaders(),
    ...(headers || {}),
  };

  const response = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body,
  });

  if (!response.ok) {
    let errorPayload: any = null;
    try {
      errorPayload = await response.json();
    } catch {
      // nada
    }

    const message =
      errorPayload?.message ||
      (response.status === 401
        ? "Unauthorized"
        : `Request failed with status ${response.status}`);

    const error: any = new Error(message);
    error.status = response.status;
    error.payload = errorPayload;
    throw error;
  }

  if (responseType === "blob") {
    return (await response.blob()) as any as T;
  }

  return (await response.json()) as T;
}

// --- funciones de API ---

export async function calculateSimulation(
  payload: CalculateSimulationRequest,
): Promise<SimulationDto> {
  return request<SimulationDto>("/simulation/calculate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createSimulation(
  payload: CreateSimulationRequest,
): Promise<SimulationDto> {
  return request<SimulationDto>("/simulation", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function exportSimulationPdf(
  simulationId: string,
): Promise<ExportSimulationResponse> {
  return request<ExportSimulationResponse>(
    `/simulation/${simulationId}/export/pdf`,
    {
      method: "GET",
    },
  );
}

export async function exportSimulationExcel(
  simulationId: string,
): Promise<ExportSimulationResponse> {
  return request<ExportSimulationResponse>(
    `/simulation/${simulationId}/export/excel`,
    {
      method: "GET",
    },
  );
}
