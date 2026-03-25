import type { Lang } from "./lang.ts";

export const API_BASE = "https://universal-api.panewslab.com";

export interface RequestOptions {
  lang?: Lang;
  session?: string;
}

export async function request<T>(
  path: string,
  options: RequestOptions & { method?: string; body?: unknown } = {},
): Promise<T> {
  const { lang, session, method = "GET", body } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (lang) headers["PA-Accept-Language"] = lang;
  if (session) headers["PA-User-Session"] = session;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    console.error(
      JSON.stringify({
        error: "Session 已失效或无效，请重新获取 PA-User-Session。",
      }),
    );
    process.exit(1);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(
      JSON.stringify({ error: `HTTP ${res.status}`, detail: text }),
    );
    process.exit(1);
  }

  return res.json() as Promise<T>;
}
