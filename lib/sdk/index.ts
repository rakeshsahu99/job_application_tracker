/**
 * Typed API Client (SDK) for Frontend-to-Backend communication.
 * This abstracts standard fetch calls, adds generic typing, and handles error states globally.
 */

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface FetchOptions<TBody = any> extends Omit<RequestInit, "body"> {
  body?: TBody;
}

export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

async function fetchApi<TResponse, TBody = any>(
  endpoint: string,
  method: HttpMethod,
  options: FetchOptions<TBody> = {}
): Promise<TResponse> {
  const { body, ...customConfig } = options;

  const headers = {
    "Content-Type": "application/json",
    ...customConfig.headers,
  };

  const config: RequestInit = {
    method,
    headers,
    ...customConfig,
  };

  if (body) {
    // Check if the body is FormData (e.g. for file uploads). If so, we let the browser set the Content-Type.
    if (body instanceof FormData) {
      delete (config.headers as Record<string, string>)["Content-Type"];
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
    }
  }

  const response = await fetch(endpoint, config);

  let data;
  try {
    data = await response.json();
  } catch (error) {
    // Some endpoints might return empty body on 204 or DELETE
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message || "An unexpected error occurred",
      data
    );
  }

  return data as TResponse;
}

// SDK Interface
export const sdk = {
  get: <TResponse>(endpoint: string, options?: Omit<FetchOptions, "body">) =>
    fetchApi<TResponse>(endpoint, "GET", options),

  post: <TResponse, TBody = any>(endpoint: string, body?: TBody, options?: FetchOptions<TBody>) =>
    fetchApi<TResponse, TBody>(endpoint, "POST", { ...options, body }),

  patch: <TResponse, TBody = any>(endpoint: string, body?: TBody, options?: FetchOptions<TBody>) =>
    fetchApi<TResponse, TBody>(endpoint, "PATCH", { ...options, body }),

  delete: <TResponse>(endpoint: string, options?: Omit<FetchOptions, "body">) =>
    fetchApi<TResponse>(endpoint, "DELETE", options),
};
