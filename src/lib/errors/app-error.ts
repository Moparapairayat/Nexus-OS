export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, string[]>;

  constructor(message: string, statusCode: number = 500, code: string = "INTERNAL_SERVER_ERROR", details?: Record<string, string[]>) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access", details?: Record<string, string[]>) {
    super(message, 401, "UNAUTHORIZED", details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden", details?: Record<string, string[]>) {
    super(message, 403, "FORBIDDEN", details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", details?: Record<string, string[]>) {
    super(message, 404, "NOT_FOUND", details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", details?: Record<string, string[]>) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export function handleServerError(error: unknown): { error: string; code: string; fieldErrors?: Record<string, string[]> } {
  console.error("🔴 Server Error encountered:", error);

  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      fieldErrors: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      code: "INTERNAL_SERVER_ERROR",
    };
  }

  return {
    error: "An unexpected error occurred. Please try again.",
    code: "UNKNOWN_ERROR",
  };
}
