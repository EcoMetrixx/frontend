import { ErrorCode } from "@/core/errors/base/ErrorCodes";

export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly details?: unknown;

    constructor(code: ErrorCode, message: string, details?: unknown) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = this.constructor.name;
    }
}
