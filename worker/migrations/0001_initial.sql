CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  name TEXT NOT NULL,
  workspace_name TEXT,
  auth_state TEXT NOT NULL DEFAULT 'placeholder',
  base_url TEXT,
  external_workspace_id TEXT,
  cursor TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  last_synced_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sources_provider ON sources(provider);
CREATE INDEX IF NOT EXISTS idx_sources_updated_at ON sources(updated_at);

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  external_id TEXT,
  parent_collection_id TEXT,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  is_inline INTEGER NOT NULL DEFAULT 0,
  schema_json TEXT NOT NULL DEFAULT '{}',
  view_json TEXT NOT NULL DEFAULT '{}',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  last_synced_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_collections_source_id ON collections(source_id);
CREATE INDEX IF NOT EXISTS idx_collections_parent_collection_id ON collections(parent_collection_id);
CREATE INDEX IF NOT EXISTS idx_collections_updated_at ON collections(updated_at);

CREATE TABLE IF NOT EXISTS records (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  external_id TEXT,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  url TEXT,
  properties_json TEXT NOT NULL DEFAULT '{}',
  relations_json TEXT NOT NULL DEFAULT '[]',
  content_json TEXT NOT NULL DEFAULT '{}',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  archived INTEGER NOT NULL DEFAULT 0,
  last_synced_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_records_collection_id ON records(collection_id);
CREATE INDEX IF NOT EXISTS idx_records_source_id ON records(source_id);
CREATE INDEX IF NOT EXISTS idx_records_status ON records(status);
CREATE INDEX IF NOT EXISTS idx_records_updated_at ON records(updated_at);

CREATE TABLE IF NOT EXISTS sync_runs (
  id TEXT PRIMARY KEY,
  source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  mode TEXT NOT NULL,
  status TEXT NOT NULL,
  requested_by TEXT,
  request_json TEXT NOT NULL DEFAULT '{}',
  result_json TEXT NOT NULL DEFAULT '{}',
  error_message TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_runs_provider ON sync_runs(provider);
CREATE INDEX IF NOT EXISTS idx_sync_runs_status ON sync_runs(status);
CREATE INDEX IF NOT EXISTS idx_sync_runs_created_at ON sync_runs(created_at);

CREATE TABLE IF NOT EXISTS outbox_ops (
  id TEXT PRIMARY KEY,
  source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
  collection_id TEXT REFERENCES collections(id) ON DELETE SET NULL,
  record_id TEXT REFERENCES records(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  operation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  payload_json TEXT NOT NULL DEFAULT '{}',
  error_json TEXT NOT NULL DEFAULT '{}',
  run_after TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_outbox_ops_status ON outbox_ops(status);
CREATE INDEX IF NOT EXISTS idx_outbox_ops_provider ON outbox_ops(provider);
CREATE INDEX IF NOT EXISTS idx_outbox_ops_updated_at ON outbox_ops(updated_at);

CREATE TABLE IF NOT EXISTS oauth_connections (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'placeholder',
  external_account_id TEXT,
  account_name TEXT,
  scopes_json TEXT NOT NULL DEFAULT '[]',
  token_expires_at TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_oauth_connections_provider ON oauth_connections(provider);

CREATE TABLE IF NOT EXISTS sync_cursors (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  scope TEXT NOT NULL,
  cursor TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(provider, scope)
);

CREATE INDEX IF NOT EXISTS idx_sync_cursors_provider ON sync_cursors(provider);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
