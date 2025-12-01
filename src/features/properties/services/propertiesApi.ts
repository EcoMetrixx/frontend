// src/features/properties/services/propertiesApi.ts

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export type PropertyStatus = "DISPONIBLE" | "RESERVADO" | "VENDIDO" | string;

export interface PropertyDto {
  id: string;
  name: string;
  location: string;
  province: string;
  region: string;
  type: string;
  price: number;
  bank: string;
  compatibleWith: string;
  status: PropertyStatus;
  imageUrl?: string;
  van?: number | null;
  tir?: number | null;
}

export interface PropertyFilters {
  search?: string;
  maxPrice?: number;
  minPrice?: number;
  bankId?: string;
  compatibleWith?: string;
  status?: string;
  type?: string;
  province?: string;
  region?: string;
}

export interface CreatePropertyPayload {
  name: string;
  location: string;
  province: string;
  region: string;
  type: string;
  price: number;
  bank: string;
  compatibleWith: string;
  status: string;
  imageUrl?: string;
}

function buildAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth:token");

    // DEBUG: puedes dejar esto un rato para ver el token que se manda
    try {
      console.log("propertiesApi.buildAuthHeaders -> token:", token);
    } catch {}

    if (token) {
      (headers as any).Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

export async function getProperties(
  filters: PropertyFilters = {}
): Promise<PropertyDto[]> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const qs = params.toString();
  const url = `${BASE_URL}/properties${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers: buildAuthHeaders(),
  });

  if (res.status === 401 || res.status === 403) {
    const error: any = new Error("Sesión expirada o no autorizada");
    error.code = "AUTH_UNAUTHORIZED";
    throw error;
  }

  if (!res.ok) {
    const error: any = new Error("Error al cargar las propiedades");
    error.code = "PROPERTIES_FETCH_ERROR";
    throw error;
  }

  return res.json() as Promise<PropertyDto[]>;
}

export async function createProperty(
  payload: CreatePropertyPayload
): Promise<PropertyDto> {
  const res = await fetch(`${BASE_URL}/properties`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (res.status === 401 || res.status === 403) {
    const error: any = new Error("Sesión expirada o no autorizada");
    error.code = "AUTH_UNAUTHORIZED";
    throw error;
  }

  if (res.status === 400 || res.status === 422) {
    const error: any = new Error("Datos inválidos para la propiedad");
    error.code = "PROPERTY_INVALID_DATA";
    throw error;
  }

  if (!res.ok) {
    const error: any = new Error("Error al crear la propiedad");
    error.code = "NETWORK_GENERIC_ERROR";
    throw error;
  }

  return res.json() as Promise<PropertyDto>;
}
