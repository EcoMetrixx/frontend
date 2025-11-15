import toast from "react-hot-toast";
import {
  AppError,
  ErrorCodes,
} from "@/core/errors";

export class ToastErrorAdapter {
  static show(error: AppError) {
    switch (error.code) {
      case ErrorCodes.AUTH_INVALID_CREDENTIALS:
        toast.error("Credenciales incorrectas. Inténtalo nuevamente.");
        break;

      case ErrorCodes.AUTH_UNAUTHORIZED:
        toast.error("Acceso denegado.");
        break;

      case ErrorCodes.NETWORK_CONNECTION_FAILED:
        toast.error("Sin conexión. Revisa tu internet.");
        break;

      case ErrorCodes.NETWORK_TIMEOUT:
        toast.error("El servidor no respondió a tiempo.");
        break;

      case ErrorCodes.VALIDATION_REQUIRED_FIELD:
        toast.error(error.message);
        break;

      default:
        toast.error("Ocurrió un error inesperado.");
    }
  }
}
