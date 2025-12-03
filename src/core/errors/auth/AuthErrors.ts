import { AppError } from "@/core/errors/base/AppError";
import { ErrorCodes } from "@/core/errors/base/ErrorCodes";

export class InvalidCredentialsError extends AppError {
    constructor(){
        super(
            ErrorCodes.AUTH_INVALID_CREDENTIALS,
            "Credenciales incorrectas"
        );
    }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super(
      ErrorCodes.AUTH_UNAUTHORIZED,
      "No tienes permisos para acceder a este recurso."
    );
  }
}