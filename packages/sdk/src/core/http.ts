import { stripTrailingSlash } from "./utils.js";

export class HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly agentToken?: string,
  ) {}

  get url(): string {
    return stripTrailingSlash(this.baseUrl);
  }

  hasAgentToken(): boolean {
    return Boolean(this.agentToken);
  }

  private authHeaders(extra?: Record<string, string>): Record<string, string> {
    return {
      Accept: "application/json",
      ...(this.agentToken ? { Authorization: `Bearer ${this.agentToken}` } : {}),
      ...extra,
    };
  }

  async get<T>(path: string, init?: { headers?: Record<string, string> }): Promise<T> {
    const response = await fetch(`${this.url}${path}`, {
      ...init,
      method: "GET",
      headers: this.authHeaders(init?.headers),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new HttpError(response.status, `GET ${path} failed (${response.status})${body ? `: ${body}` : ""}`);
    }
    return response.json() as Promise<T>;
  }

  async post<T>(path: string, body: unknown, init?: { headers?: Record<string, string> }): Promise<T> {
    const response = await fetch(`${this.url}${path}`, {
      ...init,
      method: "POST",
      headers: {
        ...this.authHeaders({
          "Content-Type": "application/json",
        }),
        ...init?.headers,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new HttpError(response.status, `POST ${path} failed (${response.status})${text ? `: ${text}` : ""}`);
    }
    return response.json() as Promise<T>;
  }

  async delete<T>(path: string, body?: unknown, init?: { headers?: Record<string, string> }): Promise<T> {
    const response = await fetch(`${this.url}${path}`, {
      ...init,
      method: "DELETE",
      headers: {
        ...this.authHeaders({
          "Content-Type": "application/json",
        }),
        ...init?.headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new HttpError(response.status, `DELETE ${path} failed (${response.status})${text ? `: ${text}` : ""}`);
    }
    return response.json() as Promise<T>;
  }
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
