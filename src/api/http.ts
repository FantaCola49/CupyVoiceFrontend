// File: src/api/http.ts
import axios, { AxiosError } from "axios";

export const http = axios.create({
  baseURL: "/", // через Vite proxy
  timeout: 20_000,
});

// type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };

type ProblemDetails = {
  title?: string;
  detail?: string;
  status?: number;
  type?: string;
  instance?: string;
};

type ValidationProblemDetails = ProblemDetails & {
  errors?: Record<string, string[]>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  if (!isRecord(value)) return false;
  const titleOk = value.title === undefined || typeof value.title === "string";
  const detailOk = value.detail === undefined || typeof value.detail === "string";
  return titleOk && detailOk;
}

function isValidationProblemDetails(value: unknown): value is ValidationProblemDetails {
  if (!isRecord(value)) return false;

  const title = value["title"];
  const detail = value["detail"];

  const titleOk = title === undefined || typeof title === "string";
  const detailOk = detail === undefined || typeof detail === "string";
  if (!titleOk || !detailOk) return false;

  const errors = value["errors"];
  if (errors === undefined) return true;

  if (!isRecord(errors)) return false;

  return Object.values(errors).every(
    (v) => Array.isArray(v) && v.every((s) => typeof s === "string")
  );
}


function firstValidationError(vpd: ValidationProblemDetails): string | null {
  if (!vpd.errors) return null;
  for (const msgs of Object.values(vpd.errors)) {
    if (msgs.length > 0) return msgs[0];
  }
  return null;
}

export function toUserMessage(err: unknown): string {
  if (!axios.isAxiosError(err)) return "Неизвестная ошибка";

  const ax = err as AxiosError<unknown>;
  const status = ax.response?.status;
  const data = ax.response?.data;

  if (isValidationProblemDetails(data)) {
    return firstValidationError(data) ?? data.title ?? `Ошибка HTTP ${status ?? "?"}`;
  }

  if (isProblemDetails(data)) {
    if (data.title && data.detail) return `${data.title}: ${data.detail}`;
    if (data.title) return data.title;
  }

  if (typeof data === "string" && data.trim().length > 0) return data;

  if (status) return `Ошибка HTTP ${status}`;
  return ax.message || "Ошибка сети";
}
