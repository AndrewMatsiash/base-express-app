import { FieldError } from "../core/api-error/types";

type Raw<T> = { [K in keyof T]: unknown };

export type Check<T> = {
  field: keyof T & string;
  isValid: (input: Raw<T>) => boolean;
  message: string;
};

export function validate<T>(input: Raw<T>, checks: Check<T>[]): FieldError[] {
  const fieldErrors: FieldError[] = [];

  checks
    .filter((item) => !item.isValid(input))
    .map((item) =>
      fieldErrors.push({ field: item.field, message: item.message }),
    );

  return fieldErrors;
}
