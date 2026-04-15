export type SourceType = "notion" | "google-drive" | "gmail" | "google-calendar" | "github" | "cloudflare" | "local";

export type FieldType =
  | "title"
  | "text"
  | "status"
  | "select"
  | "multi"
  | "date"
  | "datetime"
  | "number"
  | "currency"
  | "url"
  | "email"
  | "phone"
  | "checkbox"
  | "relation"
  | "person"
  | "file";

export type ViewType = "table" | "board" | "list" | "calendar" | "gallery";

export type SyncState = "connected" | "snapshot" | "needs-auth" | "syncing" | "error";

export interface FieldOption {
  name: string;
  color: string;
  group?: "to_do" | "in_progress" | "complete";
}

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  options?: FieldOption[];
  relationTo?: string;
  width?: number;
  readOnly?: boolean;
  sourceKey?: string;
}

export type RecordValue = string | number | boolean | string[] | undefined;

export interface RecordSource {
  type: SourceType;
  id: string;
  url?: string;
  collectionId?: string;
  capturedAt: string;
  writeback?: "supported" | "explicit-only" | "read-only" | "planned";
}

export interface RecordItem {
  id: string;
  _source?: RecordSource;
  _summary?: string;
  _links?: string[];
  [key: string]: RecordValue | RecordSource;
}

export interface DatabaseView {
  id: string;
  name: string;
  type: ViewType;
  fields: string[];
  groupBy?: string;
  sortBy?: string;
  filter?: {
    field: string;
    value: string;
  };
}

export interface DatabaseSync {
  sourceType: SourceType;
  sourceId: string;
  sourceUrl?: string;
  state: SyncState;
  lastSyncedAt: string;
  writeback: "supported" | "explicit-only" | "read-only" | "planned";
  notes: string;
}

export interface Database {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  source: string;
  sync: DatabaseSync;
  fields: Field[];
  views: DatabaseView[];
  records: RecordItem[];
  template: Record<string, string | number | boolean | string[]>;
}

export interface SourceConnection {
  id: SourceType;
  name: string;
  state: SyncState;
  detail: string;
  lastSyncedAt: string;
  recordCount: number;
  writeback: string;
}

export interface SyncRun {
  id: string;
  source: SourceType;
  status: "success" | "warning" | "failed" | "queued";
  startedAt: string;
  finishedAt?: string;
  recordsSeen: number;
  message: string;
}

export interface OutboxOperation {
  id: string;
  source: SourceType;
  collectionId: string;
  recordId: string;
  action: "create" | "update" | "delete" | "draft" | "label";
  field?: string;
  value?: RecordValue;
  createdAt: string;
  status: "pending" | "blocked" | "ready" | "sent";
  note: string;
}

export interface ConflictItem {
  id: string;
  source: SourceType;
  collectionId: string;
  recordId: string;
  field: string;
  localValue: RecordValue;
  remoteValue: RecordValue;
  detectedAt: string;
}
