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
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9000";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options && options.headers),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Error en la solicitud";
    try {
      const body = await response.json();
      if (body && body.message) {
        message = body.message;
      }
    } catch {}
    const error: any = new Error(message);
    error.status = response.status;
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
  const url = query ? `/clients?${query}` : "/clients";
  return request<ClientDto>(url).then((r) => r as unknown as ClientDto[]);
}

export async function getClientById(id: string): Promise<ClientDto> {
  return request<ClientDto>(`/clients/${id}`);
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
