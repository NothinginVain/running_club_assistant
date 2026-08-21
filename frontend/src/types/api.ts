export type ApiErrorKind =
  | "validation"
  | "not_found"
  | "conflict"
  | "bad_request"
  | "server"
  | "network"
  | "unknown";

export interface FieldValidationError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  readonly fieldErrors: FieldValidationError[];
  readonly detail: unknown;

  constructor(params: {
    kind: ApiErrorKind;
    status: number | null;
    message: string;
    fieldErrors?: FieldValidationError[];
    detail?: unknown;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.kind = params.kind;
    this.status = params.status;
    this.fieldErrors = params.fieldErrors ?? [];
    this.detail = params.detail;
  }
}
