import { AppError } from "@/core/errors/base/AppError";
import { ErrorCodes } from "@/core/errors/base/ErrorCodes";

export class NetworkConnectionError extends AppError {
  constructor() {
    super(
      ErrorCodes.NETWORK_CONNECTION_FAILED,
      "No se pudo conectar con el servidor. Verifica tu conexión."
    );
  }
}

export class NetworkTimeoutError extends AppError {
  constructor() {
    super(
      ErrorCodes.NETWORK_TIMEOUT,
      "La solicitud tardó demasiado. Inténtalo nuevamente."
    );
  }
}
