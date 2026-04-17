import type { Provider } from "./types";

export interface RouteMatch {
  readonly params: Record<string, string>;
}

export type Handler<Env, Message> = (
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  match: RouteMatch
) => Promise<Response>;

export interface Route<Env, Message> {
  readonly method: string;
  readonly pattern: string;
  readonly handler: Handler<Env, Message>;
}

export function createRouter<Env, Message>(routes: Route<Env, Message>[]) {
  return async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response | null> => {
    const url = new URL(request.url);
    for (const route of routes) {
      if (request.method.toUpperCase() !== route.method.toUpperCase()) {
        continue;
      }
      const params = matchPath(url.pathname, route.pattern);
      if (params) {
        return route.handler(request, env, ctx, { params });
      }
    }
    return null;
  };
}

function matchPath(pathname: string, pattern: string): Record<string, string> | null {
  const pathParts = trim(pathname).split("/").filter(Boolean);
  const patternParts = trim(pattern).split("/").filter(Boolean);
  if (pathParts.length !== patternParts.length) {
    return null;
  }
  const params: Record<string, string> = {};
  for (let index = 0; index < patternParts.length; index += 1) {
    const expected = patternParts[index];
    const actual = pathParts[index];
    if (expected.startsWith(":")) {
      params[expected.slice(1)] = decodeURIComponent(actual);
      continue;
    }
    if (expected !== actual) {
      return null;
    }
  }
  return params;
}

function trim(value: string): string {
  if (value === "/") return "";
  return value.replace(/\/+$/, "").replace(/^\/+/, "");
}

export function parseProvider(value: string): Provider {
  if (value === "notion" || value === "google" || value === "gmail" || value === "calendar") {
    return value;
  }
  throw new Error(`Unsupported provider: ${value}`);
}
