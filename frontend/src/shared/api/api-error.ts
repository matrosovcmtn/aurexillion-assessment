export type ApiValidationDetail = {
  field: string;
  message: string;
};

export type ApiErrorResponse = {
  error: string;
  details?: ApiValidationDetail[];
};

export class ApiError extends Error {
  readonly status: number;
  readonly details?: ApiValidationDetail[];

  constructor(options: { message: string; status: number; details?: ApiValidationDetail[] }) {
    super(options.message);
    this.name = "ApiError";
    this.status = options.status;
    this.details = options.details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
