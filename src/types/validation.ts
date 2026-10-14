export type FieldErrors<T = Record<string, unknown>> = Partial<Record<keyof T | string, string>>;

export interface ValidationResult<T = Record<string, unknown>> {
  isValid: boolean;
  errors: FieldErrors<T>;
}
