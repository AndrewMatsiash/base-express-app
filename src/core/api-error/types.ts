export interface FieldError {
  message: string;
  field: string;
}

export interface APIErrorResult {
  errorsMessages: FieldError[];
}
