import toast from "react-hot-toast";
import {
  AppError,
  ErrorCode,
  ErrorCodes,
} from "@/core/errors";

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: "Credenciales Incorrectas",
  [ErrorCodes.AUTH_UNAUTHORIZED]: "Acceso denegado",
  [ErrorCodes.NETWORK_CONNECTION_FAILED]: "Sin conexion",
  [ErrorCodes.NETWORK_TIMEOUT]: "El servidor no respondió",
  [ErrorCodes.VALIDATION_INVALID_DATA]: "Valor invalido",
  [ErrorCodes.VALIDATION_REQUIRED_FIELD]: "" // Note: se usa error.message
};

export class ToastErrorAdapter {
  static show(error: AppError) {
    const defaultMsg = "Ocurrió un error inesperado";

    const predefined = ERROR_MESSAGES[error.code];

    const message =
      predefined !== undefined
        ? (predefined || error.message)
        : defaultMsg;

    toast.error(message);
  }
}