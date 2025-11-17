import { AppError } from "@/core/errors/base/AppError";
import { ErrorCodes } from "@/core/errors/base/ErrorCodes";

export class InvalidDataError extends AppError {
  constructor(details?: unknown) {
    super(
      ErrorCodes.VALIDATION_INVALID_DATA,
      "Los datos ingresados no son válidos.",
      details
    );
  }
}

export class RequiredFieldError extends AppError {
  constructor(field: string) {
    super(
      ErrorCodes.VALIDATION_REQUIRED_FIELD,
      `El campo '${field}' es obligatorio.`,
      { field }
    );
  }
}
