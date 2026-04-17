import type {
  CollectionRow,
  JsonObject,
  JsonValue,
  OAuthConnectionRow,
  OutboxCreateBody,
  OutboxRow,
  Provider,
  RecordRow,
  SyncMode,
  SyncRunRow,
  SyncStatus,
  SourceRow
} from "./types";
import {
  mockCollections,
  mockOutbox,
  mockRecords,
  mockSources,
  mockSyncRuns
} from "./mock-data";

type DbEnv = {
  DB: D1Database;
};

const now = () => new Date().toISOString();
const createId = () => crypto.randomUUID();

function parseJsonObject(value: string | null | undefined): JsonObject {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as JsonObject;
    }
  } catch {
    // fall through
  }
  return {};
}

function parseJsonArray(value: string | null | undefined): JsonValue[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as JsonValue[]) : [];
  } catch {
    return [];
  }
}

function toJson(value: unknown): string {
  return JSON.stringify(value ?? {});
}

function mapSource(row: Record<string, unknown>): SourceRow {
  return {
    id: String(row.id),
    provider: String(row.provider) as Provider,
    name: String(row.name),
    workspaceName: (row.workspace_name as string | null) ?? null,
    authState: String(row.auth_state ?? "placeholder"),
    baseUrl: (row.base_url as string | null) ?? null,
    externalWorkspaceId: (row.external_workspace_id as string | null) ?? null,
    cursor: (row.cursor as string | null) ?? null,
    metadata: parseJsonObject((row.metadata_json as string | null) ?? "{}"),
    lastSyncedAt: (row.last_synced_at as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function mapCollection(row: Record<string, unknown>): CollectionRow {
  return {
    id: String(row.id),
    sourceId: String(row.source_id),
    externalId: (row.external_id as string | null) ?? null,
    parentCollectionId: (row.parent_collection_id as string | null) ?? null,
    name: String(row.name),
    kind: String(row.kind),
    isInline: Boolean(row.is_inline),
    schema: parseJsonObject((row.schema_json as string | null) ?? "{}"),
    views: parseJsonObject((row.view_json as string | null) ?? "{}"),
    metadata: parseJsonObject((row.metadata_json as string | null) ?? "{}"),
    lastSyncedAt: (row.last_synced_at as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function mapRecord(row: Record<string, unknown>): RecordRow {
  return {
    id: String(row.id),
    sourceId: String(row.source_id),
    collectionId: String(row.collection_id),
    externalId: (row.external_id as string | null) ?? null,
    title: String(row.title),
    status: String(row.status),
    url: (row.url as string | null) ?? null,
    properties: parseJsonObject((row.properties_json as string | null) ?? "{}"),
    relations: parseJsonArray((row.relations_json as string | null) ?? "[]"),
    content: parseJsonObject((row.content_json as string | null) ?? "{}"),
    metadata: parseJsonObject((row.metadata_json as string | null) ?? "{}"),
    archived: Boolean(row.archived),
    lastSyncedAt: (row.last_synced_at as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function mapSyncRun(row: Record<string, unknown>): SyncRunRow {
  return {
    id: String(row.id),
    sourceId: (row.source_id as string | null) ?? null,
    provider: String(row.provider) as Provider,
    mode: String(row.mode) as SyncMode,
    status: String(row.status) as SyncStatus,
    requestedBy: (row.requested_by as string | null) ?? null,
    request: parseJsonObject((row.request_json as string | null) ?? "{}"),
    result: parseJsonObject((row.result_json as string | null) ?? "{}"),
    errorMessage: (row.error_message as string | null) ?? null,
    startedAt: String(row.started_at),
    finishedAt: (row.finished_at as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function mapOutbox(row: Record<string, unknown>): OutboxRow {
  return {
    id: String(row.id),
    sourceId: (row.source_id as string | null) ?? null,
    collectionId: (row.collection_id as string | null) ?? null,
    recordId: (row.record_id as string | null) ?? null,
    provider: String(row.provider) as Provider,
    operation: String(row.operation) as OutboxRow["operation"],
    status: String(row.status) as OutboxRow["status"],
    attempts: Number(row.attempts ?? 0),
    payload: parseJsonObject((row.payload_json as string | null) ?? "{}"),
    error: parseJsonObject((row.error_json as string | null) ?? "{}"),
    runAfter: (row.run_after as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function mapOAuthConnection(row: Record<string, unknown>): OAuthConnectionRow {
  return {
    id: String(row.id),
    provider: String(row.provider) as Provider,
    status: String(row.status),
    externalAccountId: (row.external_account_id as string | null) ?? null,
    accountName: (row.account_name as string | null) ?? null,
    scopes: parseJsonArray((row.scopes_json as string | null) ?? "[]").map(String),
    tokenExpiresAt: (row.token_expires_at as string | null) ?? null,
    metadata: parseJsonObject((row.metadata_json as string | null) ?? "{}"),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

async function fetchAll<T>(statement: D1PreparedStatement): Promise<T[]> {
  const result = await statement.all<T>();
  return result.results;
}

async function readMany<T>(
  env: DbEnv,
  sql: string,
  values: unknown[] = []
): Promise<T[]> {
  const statement = env.DB.prepare(sql).bind(...values);
  return fetchAll<T>(statement);
}

async function readOne<T>(
  env: DbEnv,
  sql: string,
  values: unknown[] = []
): Promise<T | null> {
  const statement = env.DB.prepare(sql).bind(...values);
  return statement.first<T>();
}

async function runStatement(
  env: DbEnv,
  sql: string,
  values: unknown[] = []
): Promise<void> {
  await env.DB.prepare(sql).bind(...values).run();
}

async function runBound(
  env: DbEnv,
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

async function countRows(env: DbEnv, table: string): Promise<number> {
  const row = await readOne<{ count: number }>(env, `SELECT COUNT(*) as count FROM ${table}`);
  return row?.count ?? 0;
}

export async function hasPersistedData(env: DbEnv): Promise<boolean> {
  return (await countRows(env, "sources")) > 0;
}

export async function getSources(env: DbEnv): Promise<SourceRow[]> {
  const rows = await readMany<Record<string, unknown>>(
    env,
    `SELECT * FROM sources ORDER BY provider, name`
  );
  return rows.map(mapSource);
}

export async function getCollections(env: DbEnv, sourceId?: string): Promise<CollectionRow[]> {
  if (sourceId) {
    const rows = await readMany<Record<string, unknown>>(
      env,
      `SELECT * FROM collections WHERE source_id = ? ORDER BY is_inline, name`,
      [sourceId]
    );
    return rows.map(mapCollection);
  }
  const rows = await readMany<Record<string, unknown>>(
    env,
    `SELECT * FROM collections ORDER BY source_id, is_inline, name`
  );
  return rows.map(mapCollection);
}

export async function getCollection(env: DbEnv, id: string): Promise<CollectionRow | null> {
  const row = await readOne<Record<string, unknown>>(
    env,
    `SELECT * FROM collections WHERE id = ?`,
    [id]
  );
  return row ? mapCollection(row) : null;
}

export async function getRecords(
  env: DbEnv,
  options: { collectionId?: string; sourceId?: string; limit?: number } = {}
): Promise<RecordRow[]> {
  const limit = options.limit ?? 50;
  const values: unknown[] = [];
  const where: string[] = [];
  if (options.collectionId) {
    where.push(`collection_id = ?`);
    values.push(options.collectionId);
  }
  if (options.sourceId) {
    where.push(`source_id = ?`);
    values.push(options.sourceId);
  }
  const rows = await readMany<Record<string, unknown>>(
    env,
    `SELECT * FROM records${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY updated_at DESC LIMIT ?`,
    [...values, limit]
  );
  return rows.map(mapRecord);
}

export async function getRecord(env: DbEnv, id: string): Promise<RecordRow | null> {
  const row = await readOne<Record<string, unknown>>(
    env,
    `SELECT * FROM records WHERE id = ?`,
    [id]
  );
  return row ? mapRecord(row) : null;
}

export async function getSyncRuns(env: DbEnv, limit = 25): Promise<SyncRunRow[]> {
  const rows = await readMany<Record<string, unknown>>(
    env,
    `SELECT * FROM sync_runs ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );
  return rows.map(mapSyncRun);
}

export async function getOutbox(env: DbEnv, limit = 50): Promise<OutboxRow[]> {
  const rows = await readMany<Record<string, unknown>>(
    env,
    `SELECT * FROM outbox_ops ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );
  return rows.map(mapOutbox);
}

export async function getOAuthConnections(env: DbEnv): Promise<OAuthConnectionRow[]> {
  const rows = await readMany<Record<string, unknown>>(
    env,
    `SELECT * FROM oauth_connections ORDER BY provider`
  );
  return rows.map(mapOAuthConnection);
}

export async function getDashboardCounts(env: DbEnv): Promise<{
  sources: number;
  collections: number;
  records: number;
  runs: number;
  outbox: number;
}> {
  const [sources, collections, records, runs, outbox] = await Promise.all([
    countRows(env, "sources"),
    countRows(env, "collections"),
    countRows(env, "records"),
    countRows(env, "sync_runs"),
    countRows(env, "outbox_ops")
  ]);
  return { sources, collections, records, runs, outbox };
}

export async function createSyncRunRow(
  env: DbEnv,
  input: {
    provider: Provider;
    sourceId: string | null;
    mode: SyncMode;
    request: JsonObject;
    status?: SyncStatus;
  }
): Promise<SyncRunRow> {
  const id = createId();
  const stamp = now();
  const status = input.status ?? "pending";
  await runBound(
    env,
    `sync_run:${id}`,
    `INSERT INTO sync_runs (
      id, source_id, provider, mode, status, request_json, result_json, started_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.sourceId,
      input.provider,
      input.mode,
      status,
      toJson(input.request),
      toJson({}),
      stamp,
      stamp,
      stamp
    ]
  );
  const row = await readOne<Record<string, unknown>>(env, `SELECT * FROM sync_runs WHERE id = ?`, [
    id
  ]);
  if (!row) {
    throw new Error("Failed to create sync run");
  }
  return mapSyncRun(row);
}

export async function updateSyncRunRow(
  env: DbEnv,
  id: string,
  patch: Partial<{
    status: SyncStatus;
    result: JsonObject;
    errorMessage: string | null;
    finishedAt: string | null;
  }>
): Promise<void> {
  const currentRow = await readOne<Record<string, unknown>>(env, `SELECT * FROM sync_runs WHERE id = ?`, [
    id
  ]);
  if (!currentRow) {
    throw new Error(`Unknown sync run ${id}`);
  }
  const current = mapSyncRun(currentRow);
  const next = {
    status: patch.status ?? current.status,
    result: patch.result ?? current.result,
    errorMessage: patch.errorMessage ?? current.errorMessage,
    finishedAt: patch.finishedAt ?? current.finishedAt
  };
  await runBound(
    env,
    `sync_run:update:${id}`,
    `UPDATE sync_runs
     SET status = ?, result_json = ?, error_message = ?, finished_at = ?, updated_at = ?
     WHERE id = ?`,
    [next.status, toJson(next.result), next.errorMessage, next.finishedAt, now(), id]
  );
}

export async function createOutboxRow(
  env: DbEnv,
  input: {
    provider: Provider;
    operation: OutboxCreateBody["operation"];
    sourceId: string | null;
    collectionId: string | null;
    recordId: string | null;
    payload?: JsonObject;
    runAfter?: string | null;
  }
): Promise<OutboxRow> {
  const id = createId();
  const stamp = now();
  await runBound(
    env,
    `outbox:${id}`,
    `INSERT INTO outbox_ops (
      id, source_id, collection_id, record_id, provider, operation, status, attempts,
      payload_json, error_json, run_after, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.sourceId,
      input.collectionId ?? null,
      input.recordId ?? null,
      input.provider,
      input.operation,
      "pending",
      0,
      toJson(input.payload ?? {}),
      toJson({}),
      input.runAfter ?? null,
      stamp,
      stamp
    ]
  );
  const row = await readOne<Record<string, unknown>>(env, `SELECT * FROM outbox_ops WHERE id = ?`, [
    id
  ]);
  if (!row) {
    throw new Error("Failed to create outbox op");
  }
  return mapOutbox(row);
}

export async function markOutboxRow(
  env: DbEnv,
  id: string,
  patch: Partial<Pick<OutboxRow, "status" | "attempts" | "error">>
): Promise<void> {
  const currentRow = await readOne<Record<string, unknown>>(env, `SELECT * FROM outbox_ops WHERE id = ?`, [
    id
  ]);
  if (!currentRow) {
    throw new Error(`Unknown outbox op ${id}`);
  }
  const current = mapOutbox(currentRow);
  await runBound(
    env,
    `outbox:update:${id}`,
    `UPDATE outbox_ops
     SET status = ?, attempts = ?, error_json = ?, updated_at = ?
     WHERE id = ?`,
    [
      patch.status ?? current.status,
      patch.attempts ?? current.attempts,
      toJson(patch.error ?? current.error),
      now(),
      id
    ]
  );
}

export async function upsertOAuthConnection(
  env: DbEnv,
  input: {
    provider: Provider;
    status: string;
    externalAccountId?: string | null;
    accountName?: string | null;
    scopes?: string[];
    metadata?: JsonObject;
  }
): Promise<OAuthConnectionRow> {
  const existing = await readOne<Record<string, unknown>>(
    env,
    `SELECT * FROM oauth_connections WHERE provider = ?`,
    [input.provider]
  );
  const stamp = now();
  if (existing) {
    await runBound(
      env,
      `oauth:update:${input.provider}`,
      `UPDATE oauth_connections
       SET status = ?, external_account_id = ?, account_name = ?, scopes_json = ?, metadata_json = ?, updated_at = ?
       WHERE provider = ?`,
      [
        input.status,
        input.externalAccountId ?? null,
        input.accountName ?? null,
        toJson(input.scopes ?? []),
        toJson(input.metadata ?? {}),
        stamp,
        input.provider
      ]
    );
  } else {
    await runBound(
      env,
      `oauth:create:${input.provider}`,
      `INSERT INTO oauth_connections (
        id, provider, status, external_account_id, account_name, scopes_json, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        createId(),
        input.provider,
        input.status,
        input.externalAccountId ?? null,
        input.accountName ?? null,
        toJson(input.scopes ?? []),
        toJson(input.metadata ?? {}),
        stamp,
        stamp
      ]
    );
  }
  const row = await readOne<Record<string, unknown>>(env, `SELECT * FROM oauth_connections WHERE provider = ?`, [
    input.provider
  ]);
  if (!row) {
    throw new Error(`Failed to upsert oauth connection for ${input.provider}`);
  }
  return mapOAuthConnection(row);
}

export async function syncSeedState(env: DbEnv): Promise<{
  sources: SourceRow[];
  collections: CollectionRow[];
  records: RecordRow[];
  runs: SyncRunRow[];
  outbox: OutboxRow[];
  oauthConnections: OAuthConnectionRow[];
}> {
  const sources = await getSources(env);
  const collections = await getCollections(env);
  const records = await getRecords(env, { limit: 250 });
  const runs = await getSyncRuns(env, 50);
  const outbox = await getOutbox(env, 50);
  const oauthConnections = await getOAuthConnections(env);
  if (
    sources.length > 0 ||
    collections.length > 0 ||
    records.length > 0 ||
    runs.length > 0 ||
    outbox.length > 0
  ) {
    return { sources, collections, records, runs, outbox, oauthConnections };
  }
  return {
    sources: mockSources.map((item) => ({
      id: item.id,
      provider: item.provider,
      name: item.name,
      workspaceName: item.workspaceName,
      authState: item.authState,
      baseUrl: item.baseUrl,
      externalWorkspaceId: item.externalWorkspaceId,
      cursor: null,
      metadata: item.metadata,
      lastSyncedAt: "2026-04-15T00:00:00.000Z",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z"
    })),
    collections: mockCollections.map((item) => ({
      id: item.id,
      sourceId: item.sourceId,
      externalId: item.externalId,
      parentCollectionId: item.parentCollectionId,
      name: item.name,
      kind: item.kind,
      isInline: item.isInline,
      schema: item.schema,
      views: item.views,
      metadata: item.metadata,
      lastSyncedAt: "2026-04-15T00:00:00.000Z",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z"
    })),
    records: mockRecords.map((item) => ({
      id: item.id,
      sourceId: item.sourceId,
      collectionId: item.collectionId,
      externalId: item.externalId,
      title: item.title,
      status: item.status,
      url: item.url,
      properties: item.properties,
      relations: item.relations,
      content: item.content,
      metadata: item.metadata,
      archived: item.archived,
      lastSyncedAt: "2026-04-15T00:00:00.000Z",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z"
    })),
    runs: mockSyncRuns.map((item) => ({
      id: item.id,
      sourceId: item.sourceId,
      provider: item.provider,
      mode: item.mode,
      status: item.status,
      requestedBy: null,
      request: item.request,
      result: item.result,
      errorMessage: item.errorMessage,
      startedAt: "2026-04-15T00:00:00.000Z",
      finishedAt: "2026-04-15T00:00:00.000Z",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z"
    })),
    outbox: mockOutbox.map((item) => ({
      id: item.id,
      sourceId: item.sourceId,
      collectionId: item.collectionId,
      recordId: item.recordId,
      provider: item.provider,
      operation: item.operation,
      status: item.status,
      attempts: item.attempts,
      payload: item.payload,
      error: item.error,
      runAfter: item.runAfter,
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z"
    })),
    oauthConnections
  };
}
