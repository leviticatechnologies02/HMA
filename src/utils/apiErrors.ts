import { AxiosError } from "axios";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";

type ValidationIssue = {
  loc?: Array<string | number>;
  msg?: string;
};

function asAxiosError(error: unknown): AxiosError | null {
  if (error && typeof error === "object" && "isAxiosError" in error) {
    return error as AxiosError;
  }
  return null;
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  const axiosError = asAxiosError(error);
  if (!axiosError) return fallback;

  if (!axiosError.response) {
    return "Server is down. Please try again later.";
  }

  if (axiosError.response.status >= 500) {
    return "Server is down or experiencing issues. Please try again later.";
  }

  const payload = axiosError.response?.data as { detail?: unknown; code?: string } | undefined;
  if (typeof payload?.detail === "string") return payload.detail;
  if (Array.isArray(payload?.detail) && payload.detail.length > 0) {
    const first = payload.detail[0] as ValidationIssue;
    if (typeof first?.msg === "string") return first.msg;
  }
  return fallback;
}

export function applyValidationErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  keyMap: Record<string, Path<TFieldValues>> = {}
): boolean {
  const axiosError = asAxiosError(error);
  const payload = axiosError?.response?.data as { detail?: unknown; code?: string } | undefined;
  if (payload?.code !== "validation_error" || !Array.isArray(payload.detail)) {
    return false;
  }

  let applied = false;
  for (const item of payload.detail as ValidationIssue[]) {
    const loc = Array.isArray(item.loc) ? item.loc : [];
    const key = String(loc[loc.length - 1] ?? "");
    const mapped = keyMap[key] ?? (key as Path<TFieldValues>);
    if (mapped && typeof item.msg === "string") {
      setError(mapped, { type: "server", message: item.msg });
      applied = true;
    }
  }
  return applied;
}
