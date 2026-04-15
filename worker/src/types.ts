export type Provider = "notion" | "google" | "gmail" | "calendar";

export type SourceKind = Provider;
export type SyncMode = "initial" | "incremental" | "manual" | "seed";
export type SyncStatus = "pending" | "running" | "succeeded" | "failed";
export type OutboxStatus = "pending" | "queued" | "processing" | "succeeded" | "failed";
export type OutboxOperation = "create" | "update" | "delete" | "link" | "label" | "draft" | "refresh";

export interface SourceRow {
  id: string;
  provider: Provider;
  name: string;
  workspaceName: string | null;
  authState: string;
  baseUrl: string | null;
  externalWorkspaceId: string | null;
  cursor: string | null;
  metadata: JsonObject;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionRow {
  id: string;
  sourceId: string;
  externalId: string | null;
  parentCollectionId: string | null;
  name: string;
  kind: string;
  isInline: boolean;
  schema: JsonObject;
  views: JsonObject;
  metadata: JsonObject;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecordRow {
  id: string;
  sourceId: string;
  collectionId: string;
  externalId: string | null;
  title: string;
  status: string;
  url: string | null;
  properties: JsonObject;
  relations: JsonValue[];
  content: JsonObject;
  metadata: JsonObject;
  archived: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SyncRunRow {
  id: string;
  sourceId: string | null;
  provider: Provider;
  mode: SyncMode;
  status: SyncStatus;
  requestedBy: string | null;
  request: JsonObject;
  result: JsonObject;
  errorMessage: string | null;
  startedAt: string;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OutboxRow {
  id: string;
  sourceId: string | null;
  collectionId: string | null;
  recordId: string | null;
  provider: Provider;
  operation: OutboxOperation;
  status: OutboxStatus;
  attempts: number;
  payload: JsonObject;
  error: JsonObject;
  runAfter: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OAuthConnectionRow {
  id: string;
  provider: Provider;
  status: string;
  externalAccountId: string | null;
  accountName: string | null;
  scopes: string[];
  tokenExpiresAt: string | null;
  metadata: JsonObject;
  createdAt: string;
  updatedAt: string;
}

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonValue[];

export interface ApiEnvelope<T> {
  ok: true;
  data: T;
  meta: {
    generatedAt: string;
    source: string;
    seedMode?: boolean;
  };
}

export interface ApiErrorEnvelope {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: JsonObject;
  };
}

export interface SyncRequestBody {
  provider?: Provider;
  mode?: SyncMode;
  seedOnly?: boolean;
  collectionId?: string;
  recordLimit?: number;
}

export interface OutboxCreateBody {
  provider: Provider;
  operation: OutboxOperation;
  sourceId?: string;
  collectionId?: string;
  recordId?: string;
  payload?: JsonObject;
  runAfter?: string | null;
}

export interface OAuthStartResponse {
  provider: Provider;
  status: "placeholder";
  authorizationUrl: null;
  redirectUri: string;
  state: string;
  challenge: string;
  instructions: string;
}

export interface OAuthCallbackResponse {
  provider: Provider;
  status: "placeholder";
  message: string;
  nextStep: string;
}

export interface SeedSourceDescriptor {
  id: string;
  provider: Provider;
  name: string;
  workspaceName: string;
  authState: string;
  baseUrl: string | null;
  externalWorkspaceId: string | null;
  metadata: JsonObject;
}

export interface SeedCollectionDescriptor {
  id: string;
  sourceId: string;
  externalId: string | null;
  parentCollectionId: string | null;
  name: string;
  kind: string;
  isInline: boolean;
  schema: JsonObject;
  views: JsonObject;
  metadata: JsonObject;
}

export interface SeedRecordDescriptor {
  id: string;
  sourceId: string;
  collectionId: string;
  externalId: string | null;
  title: string;
  status: string;
  url: string | null;
  properties: JsonObject;
  relations: JsonValue[];
  content: JsonObject;
  metadata: JsonObject;
  archived: boolean;
}

export interface SeedSyncRunDescriptor {
  id: string;
  sourceId: string | null;
  provider: Provider;
  mode: SyncMode;
  status: SyncStatus;
  request: JsonObject;
  result: JsonObject;
  errorMessage: string | null;
}

export interface SeedOutboxDescriptor {
  id: string;
  sourceId: string | null;
  collectionId: string | null;
  recordId: string | null;
  provider: Provider;
  operation: OutboxOperation;
  status: OutboxStatus;
  attempts: number;
  payload: JsonObject;
  error: JsonObject;
  runAfter: string | null;
}
