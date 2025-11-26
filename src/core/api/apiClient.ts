const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9000";

export class HttpError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super("HTTP error " + status);
    this.status = status;
    this.body = body;
  }
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const body = await response
    .clone()
    .json()
    .catch(() => null as unknown);

  if (!response.ok) {
    throw new HttpError(response.status, body);
  }

  return body as T;
}
