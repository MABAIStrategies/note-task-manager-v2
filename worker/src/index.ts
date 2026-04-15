import { createAdapter } from "./adapters";
import { createRouter, parseProvider } from "./router";
import {
  createOutboxRow,
  createSyncRunRow,
  getCollections,
  getDashboardCounts,
  getOutbox,
  getOAuthConnections,
  getRecord,
  getRecords,
  getSources,
  getSyncRuns,
  hasPersistedData,
  markOutboxRow,
  syncSeedState,
  updateSyncRunRow,
  upsertOAuthConnection
} from "./store";
import type {
  ApiEnvelope,
  ApiErrorEnvelope,
  JsonObject,
  OAuthCallbackResponse,
  OAuthStartResponse,
  OutboxCreateBody,
  Provider,
  SeedCollectionDescriptor,
  SeedRecordDescriptor,
  SeedSourceDescriptor,
  SyncRequestBody
} from "./types";

type Env = {
  APP_NAME: string;
  APP_ENV: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  APP_ENCRYPTION_KEY?: string;
  DB: D1Database;
  SYNC_KV: KVNamespace;
  ARTIFACTS: R2Bucket;
  SYNC_QUEUE: Queue<SyncQueueMessage>;
};

interface SyncQueueMessage {
  runId: string;
  provider: Provider;
  mode?: SyncRequestBody["mode"];
  sourceId?: string | null;
  seedOnly?: boolean;
}

const router = createRouter<Env, SyncQueueMessage>([
  { method: "OPTIONS", pattern: "/", handler: optionsHandler },
  { method: "OPTIONS", pattern: "/health", handler: optionsHandler },
  { method: "OPTIONS", pattern: "/sources", handler: optionsHandler },
  { method: "OPTIONS", pattern: "/collections", handler: optionsHandler },
  { method: "OPTIONS", pattern: "/records", handler: optionsHandler },
  { method: "OPTIONS", pattern: "/sync/runs", handler: optionsHandler },
  { method: "OPTIONS", pattern: "/outbox", handler: optionsHandler },
  { method: "OPTIONS", pattern: "/api/sync", handler: optionsHandler },
  { method: "GET", pattern: "/", handler: rootHandler },
  { method: "GET", pattern: "/health", handler: healthHandler },
  { method: "GET", pattern: "/sources", handler: sourcesHandler },
  { method: "GET", pattern: "/collections", handler: collectionsHandler },
  { method: "GET", pattern: "/collections/:collectionId", handler: collectionHandler },
  { method: "GET", pattern: "/records", handler: recordsHandler },
  { method: "GET", pattern: "/records/:recordId", handler: recordHandler },
  { method: "POST", pattern: "/records", handler: createRecordOutboxHandler },
  { method: "PATCH", pattern: "/records/:recordId", handler: updateRecordOutboxHandler },
  { method: "GET", pattern: "/sync/runs", handler: syncRunsHandler },
  { method: "POST", pattern: "/sync/runs", handler: createSyncRunHandler },
  { method: "POST", pattern: "/api/sync", handler: apiSyncHandler },
  { method: "GET", pattern: "/outbox", handler: outboxHandler },
  { method: "POST", pattern: "/outbox", handler: createOutboxHandler },
  { method: "POST", pattern: "/outbox/:outboxId/retry", handler: retryOutboxHandler },
  { method: "GET", pattern: "/oauth/:provider/start", handler: oauthStartHandler },
  { method: "GET", pattern: "/oauth/:provider/callback", handler: oauthCallbackHandler },
  { method: "POST", pattern: "/oauth/:provider/callback", handler: oauthCallbackHandler },
  { method: "GET", pattern: "/oauth/:provider/status", handler: oauthStatusHandler }
]);

export default {
  async fetch(request, env, ctx) {
    try {
      const response = await router(request, env, ctx);
      if (response) {
        return response;
      }
      return jsonError(404, "not_found", "Route not found");
    } catch (error) {
      return handleError(error);
    }
  },
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(
      createScheduledSync(env, {
        provider: "google",
        mode: "incremental",
        seedOnly: !(await hasPersistedData(env))
      })
    );
  },
  async queue(batch, env, ctx) {
    ctx.waitUntil(processQueueBatch(batch.messages, env));
  }
} satisfies ExportedHandler<Env, SyncQueueMessage>;

async function optionsHandler(
  _request: Request,
  _env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

async function rootHandler(
  request: Request,
  _env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  if (request.method !== "GET") {
    return jsonError(405, "method_not_allowed", "Only GET is supported");
  }
  return jsonOk({
    name: "MAB Database OS Worker",
    routes: [
      "/health",
      "/sources",
      "/collections",
      "/records",
      "/sync/runs",
      "/outbox",
      "/oauth/:provider/start",
      "/oauth/:provider/callback",
      "/oauth/:provider/status"
    ]
  });
}

async function healthHandler(
  request: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  if (request.method !== "GET") {
    return jsonError(405, "method_not_allowed", "Only GET is supported");
  }
  const counts = await getDashboardCounts(env);
  const seedMode = counts.sources === 0 && counts.collections === 0 && counts.records === 0;
  return jsonOk(
    {
      status: "ok",
      app: env.APP_NAME,
      environment: env.APP_ENV,
      compatibilityDate: "2026-04-15",
      bindings: {
        d1: true,
        kv: true,
        r2: true,
        queue: true
      },
      counts
    },
    { seedMode }
  );
}

async function sourcesHandler(
  request: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  if (request.method !== "GET") {
    return jsonError(405, "method_not_allowed", "Only GET is supported");
  }
  const sources = await getSources(env);
  const seed = await syncSeedState(env);
  return jsonOk(sources.length ? sources : seed.sources, { seedMode: sources.length === 0 });
}

async function collectionsHandler(
  request: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  if (request.method !== "GET") {
    return jsonError(405, "method_not_allowed", "Only GET is supported");
  }
  const url = new URL(request.url);
  const sourceId = url.searchParams.get("sourceId") ?? undefined;
  const collections = await getCollections(env, sourceId);
  const seed = await syncSeedState(env);
  return jsonOk(collections.length ? collections : seed.collections, { seedMode: collections.length === 0 });
}

async function collectionHandler(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  match: { params: Record<string, string> }
): Promise<Response> {
  if (request.method !== "GET") {
    return jsonError(405, "method_not_allowed", "Only GET is supported");
  }
  const collection = (await getCollections(env)).find((item) => item.id === match.params.collectionId);
  const seed = (await syncSeedState(env)).collections.find((item) => item.id === match.params.collectionId);
  if (!collection && !seed) {
    return jsonError(404, "collection_not_found", `Unknown collection ${match.params.collectionId}`);
  }
  return jsonOk(collection ?? seed);
}

async function recordsHandler(
  request: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  if (request.method !== "GET") {
    return jsonError(405, "method_not_allowed", "Only GET is supported");
  }
  const url = new URL(request.url);
  const collectionId = url.searchParams.get("collectionId") ?? undefined;
  const sourceId = url.searchParams.get("sourceId") ?? undefined;
  const limit = url.searchParams.get("limit");
  const filters: { collectionId?: string; sourceId?: string; limit?: number } = {};
  if (collectionId) filters.collectionId = collectionId;
  if (sourceId) filters.sourceId = sourceId;
  if (limit) filters.limit = Number(limit);
  const records = await getRecords(env, filters);
  const seed = await syncSeedState(env);
  return jsonOk(records.length ? records : seed.records, { seedMode: records.length === 0 });
}

async function recordHandler(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  match: { params: Record<string, string> }
): Promise<Response> {
  if (request.method !== "GET") {
    return jsonError(405, "method_not_allowed", "Only GET is supported");
  }
  const record = await getRecord(env, match.params.recordId);
  const seed = (await syncSeedState(env)).records.find((item) => item.id === match.params.recordId);
  if (!record && !seed) {
    return jsonError(404, "record_not_found", `Unknown record ${match.params.recordId}`);
  }
  return jsonOk(record ?? seed);
}

async function createRecordOutboxHandler(
  request: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonError(405, "method_not_allowed", "Only POST is supported");
  }
  const body = await readJson<OutboxCreateBody>(request);
  if (!body.provider || !body.operation) {
    return jsonError(400, "invalid_payload", "provider and operation are required");
  }
  const outbox = await createOutboxRow(env, {
    provider: body.provider,
    operation: body.operation,
    sourceId: body.sourceId ?? null,
    collectionId: body.collectionId ?? null,
    recordId: body.recordId ?? null,
    payload: body.payload ?? {},
    runAfter: body.runAfter ?? null
  });
  return jsonOk(outbox);
}

async function updateRecordOutboxHandler(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  match: { params: Record<string, string> }
): Promise<Response> {
  if (request.method !== "PATCH") {
    return jsonError(405, "method_not_allowed", "Only PATCH is supported");
  }
  const body = await readJson<{ provider?: Provider; payload?: JsonObject }>(request);
  const record = await getRecord(env, match.params.recordId);
  if (!record) {
    return jsonError(404, "record_not_found", `Unknown record ${match.params.recordId}`);
  }
  const outbox = await createOutboxRow(env, {
    provider: body.provider ?? "google",
    operation: "update",
    sourceId: record.sourceId,
    collectionId: record.collectionId,
    recordId: record.id,
    payload: body.payload ?? {},
    runAfter: null
  });
  return jsonOk(outbox);
}

async function syncRunsHandler(
  request: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  if (request.method !== "GET") {
    return jsonError(405, "method_not_allowed", "Only GET is supported");
  }
  const runs = await getSyncRuns(env);
  const seed = await syncSeedState(env);
  return jsonOk(runs.length ? runs : seed.runs, { seedMode: runs.length === 0 });
}

async function createSyncRunHandler(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonError(405, "method_not_allowed", "Only POST is supported");
  }
  const body = await readJson<SyncRequestBody>(request);
  const provider = body.provider ?? "google";
  const mode = body.mode ?? "manual";
  const run = await createSyncRunRow(env, {
    provider,
    sourceId: body.seedOnly ? null : `${provider}-mab`,
    mode,
    request: {
      provider,
      mode,
      seedOnly: Boolean(body.seedOnly),
      collectionId: body.collectionId ?? null,
      recordLimit: body.recordLimit ?? null
    },
    status: "pending"
  });
  ctx.waitUntil(
    runSync(env, run.id, {
      provider,
      mode,
      sourceId: run.sourceId,
      seedOnly: Boolean(body.seedOnly)
    })
  );
  return jsonOk(run, { seedMode: Boolean(body.seedOnly) });
}

async function apiSyncHandler(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonError(405, "method_not_allowed", "Only POST is supported");
  }
  const body = await readJson<{ sources?: string[]; requestedAt?: string }>(request);
  const requestedSources = body.sources?.length ? body.sources : ["google", "calendar", "gmail"];
  const provider = requestedSources.includes("notion") && requestedSources.length === 1 ? "notion" : "google";
  const run = await createSyncRunRow(env, {
    provider,
    sourceId: `${provider}-mab`,
    mode: "manual",
    request: {
      requestedAt: body.requestedAt ?? new Date().toISOString(),
      requestedSources
    },
    status: "pending"
  });
  ctx.waitUntil(
    runSync(env, run.id, {
      provider,
      mode: "manual",
      sourceId: run.sourceId,
      seedOnly: false
    })
  );
  return jsonOk({
    runId: run.id,
    recordsSeen: 0,
    message: "Cloudflare sync accepted the request. Watch /sync/runs for completion."
  });
}

async function outboxHandler(
  request: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  if (request.method !== "GET") {
    return jsonError(405, "method_not_allowed", "Only GET is supported");
  }
  const outbox = await getOutbox(env);
  const seed = await syncSeedState(env);
  return jsonOk(outbox.length ? outbox : seed.outbox, { seedMode: outbox.length === 0 });
}

async function createOutboxHandler(
  request: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonError(405, "method_not_allowed", "Only POST is supported");
  }
  const body = await readJson<OutboxCreateBody>(request);
  if (!body.provider || !body.operation) {
    return jsonError(400, "invalid_payload", "provider and operation are required");
  }
  const outbox = await createOutboxRow(env, {
    provider: body.provider,
    operation: body.operation,
    sourceId: body.sourceId ?? null,
    collectionId: body.collectionId ?? null,
    recordId: body.recordId ?? null,
    payload: body.payload ?? {},
    runAfter: body.runAfter ?? null
  });
  return jsonOk(outbox);
}

async function retryOutboxHandler(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  match: { params: Record<string, string> }
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonError(405, "method_not_allowed", "Only POST is supported");
  }
  await markOutboxRow(env, match.params.outboxId, {
    status: "queued",
    attempts: 1
  });
  return jsonOk({
    outboxId: match.params.outboxId,
    status: "queued"
  });
}

async function oauthStartHandler(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  match: { params: Record<string, string> }
): Promise<Response> {
  if (request.method !== "GET") {
    return jsonError(405, "method_not_allowed", "Only GET is supported");
  }
  const provider = parseProvider(match.params.provider);
  if (!isGoogleProvider(provider)) {
    return jsonError(400, "unsupported_oauth_provider", "Notion OAuth is intentionally disabled because Notion is now a legacy migration source.");
  }
  const clientId = getGoogleClientId(env);
  if (!clientId) {
    return jsonError(503, "missing_google_client_id", "GOOGLE_CLIENT_ID is not configured as a Worker secret.");
  }
  const state = crypto.randomUUID();
  const challenge = crypto.randomUUID().replaceAll("-", "");
  const redirectUri = googleRedirectUri(request);
  const scopes = googleScopes(provider);
  await env.SYNC_KV.put(
    `oauth:start:${provider}:${state}`,
    JSON.stringify({ provider, state, challenge, redirectUri, scopes, createdAt: new Date().toISOString() }),
    { expirationTtl: 900 }
  );
  await env.SYNC_KV.put(
    `oauth:start:${state}`,
    JSON.stringify({ provider, state, challenge, redirectUri, scopes, createdAt: new Date().toISOString() }),
    { expirationTtl: 900 }
  );
  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", scopes.join(" "));
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("access_type", "offline");
  authorizationUrl.searchParams.set("prompt", "consent");
  authorizationUrl.searchParams.set("include_granted_scopes", "true");
  const payload: OAuthStartResponse = {
    provider,
    status: "ready",
    authorizationUrl: authorizationUrl.toString(),
    redirectUri,
    state,
    challenge,
    instructions: "Open authorizationUrl, approve access, and Google will return to the callback endpoint automatically."
  };
  const wantsJson = new URL(request.url).searchParams.get("format") === "json";
  if (!wantsJson) {
    return Response.redirect(authorizationUrl.toString(), 302);
  }
  return jsonOk(payload);
}

async function oauthCallbackHandler(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  match: { params: Record<string, string> }
): Promise<Response> {
  if (request.method !== "POST" && request.method !== "GET") {
    return jsonError(405, "method_not_allowed", "Only GET and POST are supported");
  }
  const routeProvider = parseProvider(match.params.provider);
  if (!isGoogleProvider(routeProvider)) {
    return jsonError(400, "unsupported_oauth_provider", "Notion OAuth is intentionally disabled because Notion is now a legacy migration source.");
  }
  const body =
    request.method === "GET"
      ? Object.fromEntries(new URL(request.url).searchParams.entries())
      : await readJson<{ code?: string; state?: string; accountName?: string }>(request);
  const state = String(body.state ?? "");
  const start = await readOAuthStart(env, state);
  const provider = start?.provider ?? routeProvider;
  const code = typeof body.code === "string" ? body.code : undefined;
  if (!code) {
    return jsonError(400, "missing_code", "Google did not provide an OAuth code.");
  }
  if (!start) {
    return jsonError(400, "invalid_state", "OAuth state is missing or expired. Start the connection again.");
  }
  const token = await exchangeGoogleCode(env, code, start.redirectUri);
  const encryptedToken = await encryptJson(env, token);
  const grantedScopes = typeof token.scope === "string" ? token.scope.split(/\s+/).filter(Boolean) : start.scopes;
  const account = await fetchGoogleAccount(token.access_token);
  const connection = await upsertOAuthConnection(env, {
    provider: "google",
    status: token.refresh_token ? "connected" : "connected_no_refresh_token",
    externalAccountId: account.sub ?? account.email ?? null,
    accountName: account.email ?? body.accountName ?? "Google Workspace",
    scopes: grantedScopes,
    metadata: {
      requestedProvider: provider,
      connectedProviders: ["google", "calendar", "gmail"],
      token: encryptedToken,
      tokenType: token.token_type ?? null,
      expiresAt: new Date(Date.now() + Number(token.expires_in ?? 0) * 1000).toISOString(),
      hasRefreshToken: Boolean(token.refresh_token),
      account
    }
  });
  const payload: OAuthCallbackResponse = {
    provider: "google",
    status: connection.status,
    message: "Google OAuth is connected for Drive, Calendar, and Gmail scopes.",
    nextStep: "The Worker can now use the encrypted refresh token for Google Workspace ingestion."
  };
  return jsonOk({
    connection,
    callback: payload
  });
}

async function oauthStatusHandler(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  match: { params: Record<string, string> }
): Promise<Response> {
  if (request.method !== "GET") {
    return jsonError(405, "method_not_allowed", "Only GET is supported");
  }
  const provider = parseProvider(match.params.provider);
  const connections = await getOAuthConnections(env);
  const connection =
    connections.find((item) => item.provider === provider) ??
    (isGoogleProvider(provider) ? connections.find((item) => item.provider === "google") : null) ??
    null;
  return jsonOk({
    provider,
    connection: connection ? sanitizeOAuthConnection(connection) : null,
    status: connection?.status ?? "placeholder"
  });
}

function sanitizeOAuthConnection(
  connection: Awaited<ReturnType<typeof getOAuthConnections>>[number]
): JsonObject {
  return {
    id: connection.id,
    provider: connection.provider,
    status: connection.status,
    externalAccountId: connection.externalAccountId,
    accountName: connection.accountName,
    scopes: connection.scopes,
    tokenExpiresAt: connection.tokenExpiresAt,
    metadata: {
      connectedProviders: connection.metadata.connectedProviders ?? [],
      hasRefreshToken: connection.metadata.hasRefreshToken ?? false,
      requestedProvider: connection.metadata.requestedProvider ?? null
    },
    createdAt: connection.createdAt,
    updatedAt: connection.updatedAt
  };
}

type OAuthStartState = {
  provider: Provider;
  state: string;
  challenge: string;
  redirectUri: string;
  scopes: string[];
  createdAt: string;
};

type GoogleTokenResponse = {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  id_token?: string;
};

type GoogleAccount = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

function isGoogleProvider(provider: Provider): boolean {
  return provider === "google" || provider === "calendar" || provider === "gmail";
}

function getGoogleClientId(env: Env): string | undefined {
  return env.GOOGLE_CLIENT_ID;
}

function getGoogleClientSecret(env: Env): string | undefined {
  return env.GOOGLE_CLIENT_SECRET;
}

function googleRedirectUri(request: Request): string {
  return `${new URL(request.url).origin}/oauth/google/callback`;
}

function googleScopes(provider: Provider): string[] {
  const identity = ["openid", "email", "profile"];
  const drive = ["https://www.googleapis.com/auth/drive.readonly"];
  const calendar = ["https://www.googleapis.com/auth/calendar.events"];
  const gmail = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.modify"
  ];
  if (provider === "calendar") return [...identity, ...calendar];
  if (provider === "gmail") return [...identity, ...gmail];
  return [...identity, ...drive, ...calendar, ...gmail];
}

async function readOAuthStart(env: Env, state: string): Promise<OAuthStartState | null> {
  if (!state) return null;
  const raw = await env.SYNC_KV.get(`oauth:start:${state}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as OAuthStartState;
    if (!isGoogleProvider(parsed.provider)) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function exchangeGoogleCode(
  env: Env,
  code: string,
  redirectUri: string
): Promise<GoogleTokenResponse> {
  const clientId = getGoogleClientId(env);
  const clientSecret = getGoogleClientSecret(env);
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured as Worker secrets.");
  }
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });
  const payload = (await response.json()) as GoogleTokenResponse & { error?: string; error_description?: string };
  if (!response.ok || payload.error) {
    throw new Error(payload.error_description ?? payload.error ?? "Google token exchange failed.");
  }
  return payload;
}

async function fetchGoogleAccount(accessToken: string): Promise<GoogleAccount> {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) {
    return {};
  }
  return (await response.json()) as GoogleAccount;
}

async function encryptJson(env: Env, value: unknown): Promise<string> {
  if (!env.APP_ENCRYPTION_KEY) {
    throw new Error("APP_ENCRYPTION_KEY must be configured as a Worker secret before storing OAuth tokens.");
  }
  const keyMaterial = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(env.APP_ENCRYPTION_KEY)
  );
  const key = await crypto.subtle.importKey("raw", keyMaterial, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(value))
  );
  return `v1:${base64UrlEncode(iv)}:${base64UrlEncode(new Uint8Array(encrypted))}`;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function decryptJson<T>(env: Env, value: string): Promise<T> {
  if (!env.APP_ENCRYPTION_KEY) {
    throw new Error("APP_ENCRYPTION_KEY must be configured as a Worker secret before reading OAuth tokens.");
  }
  const [version, iv, ciphertext] = value.split(":");
  if (version !== "v1" || !iv || !ciphertext) {
    throw new Error("Unsupported encrypted OAuth token format.");
  }
  const keyMaterial = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(env.APP_ENCRYPTION_KEY)
  );
  const key = await crypto.subtle.importKey("raw", keyMaterial, "AES-GCM", false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64UrlDecode(iv) },
    key,
    base64UrlDecode(ciphertext)
  );
  return JSON.parse(new TextDecoder().decode(decrypted)) as T;
}

type GoogleOAuthMetadata = {
  token?: string;
  requestedProvider?: Provider;
  connectedProviders?: string[];
  tokenType?: string | null;
  expiresAt?: string;
  hasRefreshToken?: boolean;
  account?: JsonObject;
};

type GoogleWorkspaceToken = GoogleTokenResponse & {
  refresh_token?: string;
};

type GoogleDriveFile = {
  id: string;
  name?: string;
  mimeType?: string;
  webViewLink?: string;
  modifiedTime?: string;
  owners?: Array<{ displayName?: string; emailAddress?: string }>;
  size?: string;
};

type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  htmlLink?: string;
  status?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
  attendees?: Array<{ email?: string; displayName?: string; responseStatus?: string }>;
  organizer?: { email?: string; displayName?: string };
  location?: string;
  description?: string;
  updated?: string;
};

type GoogleGmailMessageListItem = {
  id: string;
  threadId?: string;
};

type GoogleGmailMessage = {
  id: string;
  threadId?: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: {
    headers?: Array<{ name?: string; value?: string }>;
  };
};

async function getGoogleWorkspaceAccess(env: Env): Promise<{
  accessToken: string;
  accountName: string | null;
  scopes: string[];
  metadata: GoogleOAuthMetadata;
}> {
  const connections = await getOAuthConnections(env);
  const connection = connections.find((item) => item.provider === "google");
  const metadata = (connection?.metadata ?? {}) as GoogleOAuthMetadata;
  if (!connection || connection.status === "placeholder") {
    throw new Error("Google OAuth is not connected. Open /oauth/google/start first.");
  }
  if (typeof metadata.token !== "string") {
    throw new Error("Google OAuth connection is missing its encrypted token.");
  }
  const token = await decryptJson<GoogleWorkspaceToken>(env, metadata.token);
  if (!token.refresh_token) {
    throw new Error("Google OAuth connection has no refresh token. Reconnect with consent prompt.");
  }
  const refreshed = await refreshGoogleToken(env, token.refresh_token);
  const mergedToken: GoogleWorkspaceToken = {
    ...token,
    ...refreshed,
    refresh_token: refreshed.refresh_token ?? token.refresh_token
  };
  const expiresAt = new Date(Date.now() + Number(mergedToken.expires_in ?? 3600) * 1000).toISOString();
  const encryptedToken = await encryptJson(env, mergedToken);
  const scopes =
    typeof mergedToken.scope === "string"
      ? mergedToken.scope.split(/\s+/).filter(Boolean)
      : connection.scopes;
  await upsertOAuthConnection(env, {
    provider: "google",
    status: "connected",
    externalAccountId: connection.externalAccountId,
    accountName: connection.accountName,
    scopes,
    metadata: {
      requestedProvider: metadata.requestedProvider ?? "google",
      connectedProviders: ["google", "calendar", "gmail"],
      token: encryptedToken,
      tokenType: mergedToken.token_type ?? metadata.tokenType ?? null,
      expiresAt,
      hasRefreshToken: true,
      account: metadata.account ?? {}
    }
  });
  return {
    accessToken: mergedToken.access_token,
    accountName: connection.accountName,
    scopes,
    metadata: {
      ...metadata,
      tokenType: mergedToken.token_type ?? metadata.tokenType ?? null,
      expiresAt,
      hasRefreshToken: true
    }
  };
}

async function refreshGoogleToken(env: Env, refreshToken: string): Promise<GoogleTokenResponse> {
  const clientId = getGoogleClientId(env);
  const clientSecret = getGoogleClientSecret(env);
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured as Worker secrets.");
  }
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });
  const payload = (await response.json()) as GoogleTokenResponse & { error?: string; error_description?: string };
  if (!response.ok || payload.error) {
    throw new Error(payload.error_description ?? payload.error ?? "Google token refresh failed.");
  }
  return payload;
}

async function fetchGoogleJson<T>(accessToken: string, url: URL | string): Promise<T> {
  const response = await fetch(url.toString(), {
    headers: { authorization: `Bearer ${accessToken}` }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = payload as { error?: { message?: string }; error_description?: string };
    throw new Error(error.error?.message ?? error.error_description ?? `Google API request failed with ${response.status}`);
  }
  return payload as T;
}

async function fetchGoogleDriveFiles(accessToken: string): Promise<GoogleDriveFile[]> {
  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("pageSize", "60");
  url.searchParams.set("orderBy", "modifiedTime desc");
  url.searchParams.set("q", "trashed = false");
  url.searchParams.set(
    "fields",
    "files(id,name,mimeType,webViewLink,modifiedTime,owners(displayName,emailAddress),size),nextPageToken"
  );
  const payload = await fetchGoogleJson<{ files?: GoogleDriveFile[] }>(accessToken, url);
  return payload.files ?? [];
}

async function fetchGoogleCalendarEvents(accessToken: string): Promise<GoogleCalendarEvent[]> {
  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "60");
  url.searchParams.set("timeMin", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
  url.searchParams.set("timeMax", new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString());
  const payload = await fetchGoogleJson<{ items?: GoogleCalendarEvent[] }>(accessToken, url);
  return payload.items ?? [];
}

async function fetchGoogleGmailMessages(accessToken: string): Promise<GoogleGmailMessage[]> {
  const listUrl = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  listUrl.searchParams.set("q", "newer_than:90d");
  listUrl.searchParams.set("maxResults", "35");
  const payload = await fetchGoogleJson<{ messages?: GoogleGmailMessageListItem[] }>(accessToken, listUrl);
  const messages: GoogleGmailMessage[] = [];
  for (const item of payload.messages ?? []) {
    const messageUrl = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}`);
    messageUrl.searchParams.set("format", "metadata");
    messageUrl.searchParams.append("metadataHeaders", "Subject");
    messageUrl.searchParams.append("metadataHeaders", "From");
    messageUrl.searchParams.append("metadataHeaders", "Date");
    const message = await fetchGoogleJson<GoogleGmailMessage>(accessToken, messageUrl);
    messages.push(message);
  }
  return messages;
}

async function runGoogleWorkspaceSync(
  env: Env,
  runId: string,
  input: {
    provider: Provider;
    mode: SyncRequestBody["mode"];
    seedOnly: boolean;
  }
): Promise<void> {
  const access = await getGoogleWorkspaceAccess(env);
  const [driveFiles, calendarEvents, gmailMessages] = await Promise.all([
    fetchGoogleDriveFiles(access.accessToken),
    fetchGoogleCalendarEvents(access.accessToken),
    fetchGoogleGmailMessages(access.accessToken)
  ]);
  const source = googleWorkspaceSource(access.accountName);
  const collections = googleWorkspaceCollections(source.id);
  const records = [
    ...driveFiles.map((file) => driveFileRecord(source.id, file)),
    ...calendarEvents.map((event) => calendarEventRecord(source.id, event)),
    ...gmailMessages.map((message) => gmailMessageRecord(source.id, message))
  ];
  await persistMockData(env, source, collections, records);
  await env.ARTIFACTS.put(
    `google-sync-runs/${runId}.json`,
    JSON.stringify(
      {
        runId,
        generatedAt: new Date().toISOString(),
        provider: input.provider,
        mode: input.mode ?? "manual",
        accountName: access.accountName,
        counts: {
          driveFiles: driveFiles.length,
          calendarEvents: calendarEvents.length,
          gmailMessages: gmailMessages.length,
          records: records.length
        },
        driveFiles,
        calendarEvents,
        gmailMessages: gmailMessages.map((message) => ({
          id: message.id,
          threadId: message.threadId,
          labelIds: message.labelIds,
          snippet: message.snippet,
          headers: message.payload?.headers ?? []
        }))
      },
      null,
      2
    ),
    { httpMetadata: { contentType: "application/json" } }
  );
  await updateSyncRunRow(env, runId, {
    status: "succeeded",
    result: {
      provider: input.provider,
      mode: input.mode ?? "manual",
      sourceId: source.id,
      collections: collections.length,
      records: records.length,
      seedOnly: input.seedOnly,
      counts: {
        driveFiles: driveFiles.length,
        calendarEvents: calendarEvents.length,
        gmailMessages: gmailMessages.length
      }
    },
    finishedAt: new Date().toISOString()
  });
}

function googleWorkspaceSource(accountName: string | null): SeedSourceDescriptor {
  return {
    id: "google-mab",
    provider: "google",
    name: "MAB AI Strategies Google Workspace",
    workspaceName: accountName ?? "MAB AI Strategies",
    authState: "connected",
    baseUrl: "https://workspace.google.com",
    externalWorkspaceId: accountName,
    metadata: {
      mirroredProviders: ["google-drive", "google-calendar", "gmail"],
      syncModel: "mirror",
      writeback: {
        calendar: "event edits",
        gmail: "explicit drafts and labels",
        drive: "metadata and app-side records"
      }
    }
  };
}

function googleWorkspaceCollections(sourceId: string): SeedCollectionDescriptor[] {
  return [
    {
      id: "google-drive-files",
      sourceId,
      externalId: "drive.files",
      parentCollectionId: null,
      name: "Google Drive Files",
      kind: "drive_files",
      isInline: false,
      schema: {
        name: { type: "title" },
        mimeType: { type: "text" },
        modifiedTime: { type: "date" },
        owner: { type: "person" },
        size: { type: "number" },
        source: { type: "url" }
      },
      views: {
        default: "table",
        table: { sort: [{ property: "modifiedTime", direction: "descending" }] },
        gallery: { cover: "mimeType", title: "name" }
      },
      metadata: { sourceProduct: "google-drive" }
    },
    {
      id: "google-calendar-events",
      sourceId,
      externalId: "calendar.primary.events",
      parentCollectionId: null,
      name: "Google Calendar Events",
      kind: "calendar_events",
      isInline: false,
      schema: {
        summary: { type: "title" },
        start: { type: "date" },
        end: { type: "date" },
        organizer: { type: "person" },
        attendees: { type: "number" },
        location: { type: "text" },
        source: { type: "url" }
      },
      views: {
        default: "calendar",
        calendar: { dateProperty: "start" },
        table: { sort: [{ property: "start", direction: "ascending" }] }
      },
      metadata: { sourceProduct: "google-calendar" }
    },
    {
      id: "google-gmail-messages",
      sourceId,
      externalId: "gmail.messages",
      parentCollectionId: null,
      name: "Gmail Messages",
      kind: "gmail_messages",
      isInline: false,
      schema: {
        subject: { type: "title" },
        from: { type: "email" },
        date: { type: "date" },
        threadId: { type: "text" },
        labels: { type: "multi_select" },
        snippet: { type: "text" }
      },
      views: {
        default: "list",
        table: { sort: [{ property: "date", direction: "descending" }] },
        list: { title: "subject", subtitle: "from" }
      },
      metadata: { sourceProduct: "gmail" }
    }
  ];
}

function driveFileRecord(sourceId: string, file: GoogleDriveFile): SeedRecordDescriptor {
  const owner = file.owners?.[0];
  return {
    id: stableRecordId("google-drive", file.id),
    sourceId,
    collectionId: "google-drive-files",
    externalId: file.id,
    title: file.name ?? "Untitled Drive file",
    status: "active",
    url: file.webViewLink ?? null,
    properties: {
      name: file.name ?? "Untitled Drive file",
      mimeType: file.mimeType ?? "unknown",
      modifiedTime: file.modifiedTime ?? null,
      owner: owner?.emailAddress ?? owner?.displayName ?? null,
      size: file.size ? Number(file.size) : null,
      source: file.webViewLink ?? null
    },
    relations: [],
    content: {
      summary: `${file.name ?? "Drive file"} from Google Drive`,
      extractedTextStatus: "metadata-indexed"
    },
    metadata: {
      sourceProduct: "google-drive",
      owners: file.owners ?? [],
      rawMimeType: file.mimeType ?? null
    },
    archived: false
  };
}

function calendarEventRecord(sourceId: string, event: GoogleCalendarEvent): SeedRecordDescriptor {
  const start = event.start?.dateTime ?? event.start?.date ?? null;
  const end = event.end?.dateTime ?? event.end?.date ?? null;
  return {
    id: stableRecordId("google-calendar", event.id),
    sourceId,
    collectionId: "google-calendar-events",
    externalId: event.id,
    title: event.summary ?? "Untitled calendar event",
    status: event.status ?? "confirmed",
    url: event.htmlLink ?? null,
    properties: {
      summary: event.summary ?? "Untitled calendar event",
      start,
      end,
      organizer: event.organizer?.email ?? event.organizer?.displayName ?? null,
      attendees: event.attendees?.length ?? 0,
      location: event.location ?? null,
      source: event.htmlLink ?? null
    },
    relations: [],
    content: {
      description: compactText(event.description ?? ""),
      timeZone: event.start?.timeZone ?? event.end?.timeZone ?? null
    },
    metadata: {
      sourceProduct: "google-calendar",
      updated: event.updated ?? null,
      attendees: event.attendees ?? []
    },
    archived: event.status === "cancelled"
  };
}

function gmailMessageRecord(sourceId: string, message: GoogleGmailMessage): SeedRecordDescriptor {
  const subject = gmailHeader(message, "Subject") || "(no subject)";
  const from = gmailHeader(message, "From") || null;
  const date = gmailHeader(message, "Date") || (message.internalDate ? new Date(Number(message.internalDate)).toISOString() : null);
  const threadId = message.threadId ?? message.id;
  return {
    id: stableRecordId("google-gmail", message.id),
    sourceId,
    collectionId: "google-gmail-messages",
    externalId: message.id,
    title: subject,
    status: message.labelIds?.includes("UNREAD") ? "unread" : "read",
    url: `https://mail.google.com/mail/u/0/#all/${threadId}`,
    properties: {
      subject,
      from,
      date,
      threadId,
      labels: message.labelIds ?? [],
      snippet: message.snippet ?? ""
    },
    relations: [],
    content: {
      snippet: message.snippet ?? "",
      bodyStatus: "metadata-indexed"
    },
    metadata: {
      sourceProduct: "gmail",
      headers: message.payload?.headers ?? []
    },
    archived: false
  };
}

function gmailHeader(message: GoogleGmailMessage, name: string): string | undefined {
  return message.payload?.headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase())?.value;
}

function stableRecordId(prefix: string, externalId: string): string {
  return `${prefix}-${externalId.replaceAll(/[^a-zA-Z0-9_-]/g, "_")}`;
}

function compactText(value: string): string {
  return value.replaceAll(/<[^>]*>/g, " ").replaceAll(/\s+/g, " ").trim().slice(0, 2000);
}

async function runSync(
  env: Env,
  runId: string,
  input: {
    provider: Provider;
    mode: SyncRequestBody["mode"];
    sourceId: string | null;
    seedOnly: boolean;
  }
): Promise<void> {
  try {
    await updateSyncRunRow(env, runId, { status: "running" });
    if (isGoogleProvider(input.provider)) {
      await runGoogleWorkspaceSync(env, runId, input);
      return;
    }
    const adapter = createAdapter(input.provider);
    const source = await adapter.discoverSource();
    const collections = await adapter.listCollections();
    const records = await adapter.listRecords();
    await persistMockData(env, source, collections, records);
    await updateSyncRunRow(env, runId, {
      status: "succeeded",
      result: {
        provider: input.provider,
        mode: input.mode ?? "manual",
        collections: collections.length,
        records: records.length,
        seedOnly: input.seedOnly
      },
      finishedAt: new Date().toISOString()
    });
  } catch (error) {
    await updateSyncRunRow(env, runId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : String(error),
      result: {
        provider: input.provider,
        mode: input.mode ?? "manual",
        seedOnly: input.seedOnly
      },
      finishedAt: new Date().toISOString()
    });
    throw error;
  }
}

async function createScheduledSync(
  env: Env,
  input: { provider: Provider; mode: SyncRequestBody["mode"]; seedOnly: boolean }
): Promise<void> {
  const run = await createSyncRunRow(env, {
    provider: input.provider,
    sourceId: `${input.provider}-mab`,
    mode: input.mode ?? "incremental",
    request: {
      provider: input.provider,
      mode: input.mode ?? "incremental",
      seedOnly: input.seedOnly
    },
    status: "pending"
  });
  await runSync(env, run.id, {
    provider: input.provider,
    mode: input.mode,
    sourceId: `${input.provider}-mab`,
    seedOnly: input.seedOnly
  });
}

async function processQueueBatch(
  messages: readonly Message<SyncQueueMessage>[],
  env: Env
): Promise<void> {
  for (const message of messages) {
    const body = message.body;
    const run = await createSyncRunRow(env, {
      provider: body.provider,
      sourceId: body.sourceId ?? null,
      mode: body.mode ?? "manual",
      request: {
        runId: body.runId,
        provider: body.provider,
        mode: body.mode ?? "manual",
        sourceId: body.sourceId ?? null,
        seedOnly: Boolean(body.seedOnly)
      },
      status: "pending"
    });
    await runSync(env, run.id, {
      provider: body.provider,
      mode: body.mode ?? "manual",
      sourceId: body.sourceId ?? null,
      seedOnly: Boolean(body.seedOnly)
    });
  }
}

async function persistMockData(
  env: Env,
  source: SeedSourceDescriptor,
  collections: SeedCollectionDescriptor[],
  records: SeedRecordDescriptor[]
): Promise<void> {
  const stamp = new Date().toISOString();
  await runBound(
    env,
    "source",
    `INSERT INTO sources (
      id, provider, name, workspace_name, auth_state, base_url, external_workspace_id, cursor,
      metadata_json, last_synced_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      provider = excluded.provider,
      name = excluded.name,
      workspace_name = excluded.workspace_name,
      auth_state = excluded.auth_state,
      base_url = excluded.base_url,
      external_workspace_id = excluded.external_workspace_id,
      cursor = excluded.cursor,
      metadata_json = excluded.metadata_json,
      last_synced_at = excluded.last_synced_at,
      updated_at = excluded.updated_at`,
    [
      source.id,
      source.provider,
      source.name ?? "",
      source.workspaceName ?? null,
      source.authState ?? "placeholder",
      source.baseUrl ?? null,
      source.externalWorkspaceId ?? null,
      null,
      JSON.stringify(source.metadata ?? {}),
      stamp,
      stamp,
      stamp
    ]
  );

  for (const collection of collections) {
    await runBound(
      env,
      `collection:${collection.id}`,
      `INSERT INTO collections (
        id, source_id, external_id, parent_collection_id, name, kind, is_inline, schema_json,
        view_json, metadata_json, last_synced_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        source_id = excluded.source_id,
        external_id = excluded.external_id,
        parent_collection_id = excluded.parent_collection_id,
        name = excluded.name,
        kind = excluded.kind,
        is_inline = excluded.is_inline,
        schema_json = excluded.schema_json,
        view_json = excluded.view_json,
        metadata_json = excluded.metadata_json,
        last_synced_at = excluded.last_synced_at,
        updated_at = excluded.updated_at`,
      [
        collection.id ?? "",
        collection.sourceId ?? "",
        collection.externalId ?? null,
        collection.parentCollectionId ?? null,
        collection.name ?? "",
        collection.kind ?? "database",
        collection.isInline ? 1 : 0,
        JSON.stringify(collection.schema ?? {}),
        JSON.stringify(collection.views ?? {}),
        JSON.stringify(collection.metadata ?? {}),
        stamp,
        stamp,
        stamp
      ]
    );
  }

  for (const record of records) {
    await runBound(
      env,
      `record:${record.id}`,
      `INSERT INTO records (
        id, source_id, collection_id, external_id, title, status, url, properties_json, relations_json,
        content_json, metadata_json, archived, last_synced_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        source_id = excluded.source_id,
        collection_id = excluded.collection_id,
        external_id = excluded.external_id,
        title = excluded.title,
        status = excluded.status,
        url = excluded.url,
        properties_json = excluded.properties_json,
        relations_json = excluded.relations_json,
        content_json = excluded.content_json,
        metadata_json = excluded.metadata_json,
        archived = excluded.archived,
        last_synced_at = excluded.last_synced_at,
        updated_at = excluded.updated_at`,
      [
        record.id ?? "",
        record.sourceId ?? "",
        record.collectionId ?? "",
        record.externalId ?? null,
        record.title ?? "",
        record.status ?? "active",
        record.url ?? null,
        JSON.stringify(record.properties ?? {}),
        JSON.stringify(record.relations ?? []),
        JSON.stringify(record.content ?? {}),
        JSON.stringify(record.metadata ?? {}),
        record.archived ? 1 : 0,
        stamp,
        stamp,
        stamp
      ]
    );
  }
}

async function runBound(
  env: Env,
  label: string,
  sql: string,
  values: unknown[]
): Promise<void> {
  try {
    await env.DB.prepare(sql).bind(...values).run();
  } catch (error) {
    throw new Error(
      `D1 write failed at ${label}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function jsonOk<T>(data: T, meta: Partial<{ seedMode: boolean }> = {}): Response {
  const body: ApiEnvelope<T> = {
    ok: true,
    data,
    meta: {
      generatedAt: new Date().toISOString(),
      source: "cloudflare-worker",
      ...meta
    }
  };
  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: jsonHeaders()
  });
}

function jsonError(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>
): Response {
  const error: ApiErrorEnvelope["error"] = { code, message };
  if (details) {
    error.details = details as JsonObject;
  }
  const body: ApiErrorEnvelope = { ok: false, error };
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: jsonHeaders()
  });
}

function jsonHeaders(): Headers {
  const headers = corsHeaders();
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  return headers;
}

function corsHeaders(): Headers {
  return new Headers({
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "access-control-max-age": "86400",
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
}

async function readJson<T>(request: Request): Promise<T> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Request must include application/json content-type");
  }
  return (await request.json()) as T;
}

function handleError(error: unknown): Response {
  const message = error instanceof Error ? error.message : String(error);
  console.error(
    JSON.stringify({
      level: "error",
      message,
      error: error instanceof Error ? { name: error.name, stack: error.stack } : { value: error }
    })
  );
  return jsonError(500, "internal_error", message);
}
