// src/features/auth/services/authApi.ts

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUserDto;
}

export interface RegisterAdvisorPayload {
  name: string;
  email: string;
  dni: string;
  phone: string;
  password: string;
}

// -------- helper para decodificar el JWT --------
interface DecodedJwt {
  sub: string;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

function decodeJwt(token: string): DecodedJwt | null {
  try {
    const [, payload] = token.split(".");
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// -------- LOGIN --------
export async function loginRequest(
  email: string,
  password: string
): Promise<LoginResponseDto> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (response.status === 400 || response.status === 401) {
    const error = new Error("Credenciales inválidas");
    (error as any).code = "AUTH_INVALID_CREDENTIALS";
    throw error;
  }

  if (!response.ok) {
    const error = new Error("Error al iniciar sesión");
    (error as any).code = "NETWORK_GENERIC_ERROR";
    throw error;
  }

  // Lo que realmente manda tu backend
  const raw = (await response.json()) as {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };

  try {
    // eslint-disable-next-line no-console
    console.log("authApi.loginRequest: response body", raw);
  } catch {}

  // Decodificamos el token para armar el usuario
  const payload = decodeJwt(raw.accessToken);
  if (!payload) {
    const error = new Error("No se pudo decodificar el token de acceso");
    (error as any).code = "AUTH_TOKEN_DECODE_ERROR";
    throw error;
  }

  const user: AuthUserDto = {
    id: payload.sub?.toString() ?? payload.id ?? "",
    email: payload.email ?? email,
    name: payload.name ?? payload.email ?? email,
    role: payload.role ?? "Asesor Hipotecario",
  };

  // Devolvemos el objeto que el AuthProvider espera: incluye user
  return {
    ...raw,
    user,
  };
}

// -------- REGISTER --------
export async function registerAdvisor(
  payload: RegisterAdvisorPayload
): Promise<void> {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 400) {
    const error = new Error("Datos inválidos o email ya registrado");
    (error as any).code = "AUTH_INVALID_DATA";
    throw error;
  }

  if (!response.ok) {
    const error = new Error("Error al crear la cuenta");
    (error as any).code = "NETWORK_GENERIC_ERROR";
    throw error;
  }
}
