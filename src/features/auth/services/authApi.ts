import { apiClient } from "@/core/api/apiClient";

export interface RegisterAdvisorPayload {
  name: string;
  email: string;
  dni: string;
  phone: string;
  password: string;
}

export async function registerAdvisor(payload: RegisterAdvisorPayload) {
  await apiClient<void>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
