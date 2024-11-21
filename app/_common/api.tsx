import { produce } from "immer";
import { useSession } from "./SessionContext";

export class ApiError extends Error {
  httpStatus: number;

  constructor(message: string, httpStatus: number) {
    super(message);
    this.httpStatus = httpStatus;
  }
}

export async function apiFetch(endpoint: string, options: any = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    body:
      typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body),
    headers,
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    // ignore
  }

  if (!response.ok) {
    throw new ApiError(
      `HTTP error! status: ${response.status} (${text})`,
      response.status
    );
  }

  return json;
}

export const apiGet = (
  endpoint: string,
  queryParams?: Record<string, string>
) => {
  return apiFetch(
    endpoint +
      (queryParams ? "?" + new URLSearchParams(queryParams).toString() : ""),
    { method: "GET" }
  );
};

export const apiPost = (endpoint: string, body: any = {}) => {
  return apiFetch(endpoint, {
    method: "POST",
    body,
  });
};

export const apiDelete = (endpoint: string) => {
  return apiFetch(endpoint, {
    method: "DELETE",
  });
};

export const apiPatch = (endpoint: string, body: any = {}) => {
  return apiFetch(endpoint, {
    method: "PATCH",
    body,
  });
};
