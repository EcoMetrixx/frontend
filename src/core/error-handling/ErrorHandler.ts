import { AppError } from "@/core/errors";
import { ToastErrorAdapter } from "@/core/error-handling/ToastErrorAdapter";

export class ErrorHandler {
  static handle(error: unknown) {
    if (error instanceof AppError) {
      ToastErrorAdapter.show(error);
      return;
    }

    // fallback errores no controlados
    console.error("Unexpected error:", error);
    ToastErrorAdapter.show(
      new AppError("VALIDATION_INVALID_DATA", "Error inesperado")
    );
  }
}
