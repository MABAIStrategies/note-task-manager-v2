import { useMemo, useState } from "react";
import { initialConflicts, initialOutbox, initialSyncRuns, mabDatabases, sourceConnections } from "./data";
import type {
  ConflictItem,
  Database,
  DatabaseView,
  Field,
  OutboxOperation,
  RecordItem,
  RecordValue,
  SourceConnection,
  SourceType,
  SyncRun,
  ViewType,
} from "./types";

const storageKey = "mab-database-os:v2";
const defaultApiBase =
  ((import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_SYNC_API_BASE as string | undefined) ??
  "http://127.0.0.1:8787";

interface WorkspaceState {
  databases: Database[];
  outbox: OutboxOperation[];
  conflicts: ConflictItem[];
  syncRuns: SyncRun[];
  apiBase: string;
}

function seedState(): WorkspaceState {
  return {
    databases: mabDatabases,
    outbox: initialOutbox,
    conflicts: initialConflicts,
    syncRuns: initialSyncRuns,
    apiBase: defaultApiBase,
  };
}

function loadWorkspace(): WorkspaceState {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return seedState();
    const parsed = JSON.parse(stored) as Partial<WorkspaceState>;
    if (!Array.isArray(parsed.databases)) return seedState();
    return {
      databases: parsed.databases,
      outbox: parsed.outbox ?? initialOutbox,
      conflicts: parsed.conflicts ?? initialConflicts,
      syncRuns: parsed.syncRuns ?? initialSyncRuns,
      apiBase: parsed.apiBase ?? defaultApiBase,
    };
  } catch {
    return seedState();
  }
}

function saveWorkspace(state: WorkspaceState) {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

function recordValue(value: RecordItem[string]): RecordValue {
  if (value && typeof value === "object" && !Array.isArray(value)) return undefined;
  return value as RecordValue;
}

function formatCurrency(value: RecordItem[string]) {
  const number = typeof value === "number" ? value : Number(recordValue(value) || 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(number);
}

function formatDate(value: RecordItem[string]) {
  const resolved = recordValue(value);
  if (!resolved || Array.isArray(resolved) || typeof resolved === "boolean") return "";
  const date = new Date(resolved);
  if (Number.isNaN(date.getTime())) return String(resolved);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function valueText(value: RecordItem[string]) {
  const resolved = recordValue(value);
  if (Array.isArray(resolved)) return resolved.join(", ");
  if (typeof resolved === "boolean") return resolved ? "Yes" : "No";
  if (resolved === undefined) return "";
  return String(resolved);
}

function getTitleField(database: Database) {
  return database.fields.find((field) => field.type === "title") ?? database.fields[0];
}

function getDateField(database: Database, view?: DatabaseView) {
  const viewDate = view?.sortBy ? database.fields.find((field) => field.key === view.sortBy && (field.type === "date" || field.type === "datetime")) : undefined;
  return viewDate ?? database.fields.find((field) => field.type === "date" || field.type === "datetime");
}

function getField(database: Database, key: string) {
  return database.fields.find((field) => field.key === key);
}

function classForOption(field: Field | undefined, value: string) {
  const color = field?.options?.find((option) => option.name === value)?.color ?? "plain";
  return `pill ${color}`;
}

function matchesSearch(database: Database, record: RecordItem, query: string) {
  if (!query.trim()) return true;
  const haystack = [
    database.name,
    database.category,
    database.source,
    record._summary,
    ...database.fields.map((field) => valueText(record[field.key])),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
}

function sourceLabel(source: SourceType) {
  return {
    notion: "Notion",
    "google-drive": "Drive",
    gmail: "Gmail",
    "google-calendar": "Calendar",
    github: "GitHub",
    cloudflare: "Cloudflare",
    local: "Local",
  }[source];
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [workspace, setWorkspace] = useState<WorkspaceState>(loadWorkspace);
  const [activeDbId, setActiveDbId] = useState(workspace.databases[0]?.id ?? "clients");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showBuilder, setShowBuilder] = useState(true);
  const [activePanel, setActivePanel] = useState<"builder" | "sources" | "outbox" | "runs">("builder");

  const activeDb = workspace.databases.find((database) => database.id === activeDbId) ?? workspace.databases[0];
  const [viewByDb, setViewByDb] = useState<Record<string, string>>(
    Object.fromEntries(workspace.databases.map((database) => [database.id, database.views[0]?.id ?? ""])),
  );
  const activeView = activeDb.views.find((view) => view.id === viewByDb[activeDb.id]) ?? activeDb.views[0];
  const titleField = getTitleField(activeDb);

  const records = useMemo(() => {
    return activeDb.records
      .filter((record) => matchesSearch(activeDb, record, query))
      .filter((record) => !activeView?.filter || valueText(record[activeView.filter.field]).includes(activeView.filter.value));
  }, [activeDb, activeView, query]);

  const globalResults = useMemo(() => {
    if (!query.trim()) return [];
    return workspace.databases.flatMap((database) =>
      database.records
        .filter((record) => matchesSearch(database, record, query))
        .slice(0, 4)
        .map((record) => ({ database, record, title: valueText(record[getTitleField(database).key]) || "Untitled" })),
    );
  }, [workspace.databases, query]);

  const selectedRecord = selectedRecordId ? activeDb.records.find((record) => record.id === selectedRecordId) ?? null : null;

  const updateWorkspace = (next: WorkspaceState) => {
    setWorkspace(next);
    saveWorkspace(next);
  };

  const queueOperation = (
    database: Database,
    recordId: string,
    action: OutboxOperation["action"],
    field: string | undefined,
    value: RecordValue,
    note?: string,
  ) => {
    const nextOperation: OutboxOperation = {
      id: makeId("outbox"),
      source: database.sync.sourceType,
      collectionId: database.sync.sourceId,
      recordId,
      action,
      field,
      value,
      createdAt: new Date().toISOString(),
      status: database.sync.writeback === "supported" ? "ready" : "blocked",
      note: note ?? `${sourceLabel(database.sync.sourceType)} ${action} queued from local edit.`,
    };
    return nextOperation;
  };

  const updateRecord = (recordId: string, key: string, value: RecordValue) => {
    const field = getField(activeDb, key);
    if (field?.readOnly) return;
    const op = queueOperation(activeDb, recordId, "update", field?.sourceKey ?? key, value);
    updateWorkspace({
      ...workspace,
      databases: workspace.databases.map((database) =>
        database.id === activeDb.id
          ? {
              ...database,
              records: database.records.map((record) => (record.id === recordId ? { ...record, [key]: value } : record)),
            }
          : database,
      ),
      outbox: [op, ...workspace.outbox],
    });
  };

  const addRecord = () => {
    const nextRecord: RecordItem = {
      id: makeId(activeDb.id),
      ...activeDb.template,
      _source: {
        type: "local",
        id: "local-draft",
        collectionId: activeDb.sync.sourceId,
        capturedAt: new Date().toISOString(),
        writeback: activeDb.sync.writeback === "supported" ? "supported" : "planned",
      },
    };
    const op = queueOperation(activeDb, nextRecord.id, "create", undefined, undefined, "New local record queued for source creation.");
    updateWorkspace({
      ...workspace,
      databases: workspace.databases.map((database) =>
        database.id === activeDb.id ? { ...database, records: [nextRecord, ...database.records] } : database,
      ),
      outbox: [op, ...workspace.outbox],
    });
    setSelectedRecordId(nextRecord.id);
  };

  const duplicateRecord = (record: RecordItem) => {
    const title = valueText(record[titleField.key]);
    const nextRecord: RecordItem = {
      ...record,
      id: makeId(activeDb.id),
      [titleField.key]: `${title} copy`,
      _source: {
        type: "local",
        id: "local-duplicate",
        collectionId: activeDb.sync.sourceId,
        capturedAt: new Date().toISOString(),
        writeback: activeDb.sync.writeback === "supported" ? "supported" : "planned",
      },
    };
    const op = queueOperation(activeDb, nextRecord.id, "create", undefined, undefined, "Duplicated local record queued for source creation.");
    updateWorkspace({
      ...workspace,
      databases: workspace.databases.map((database) =>
        database.id === activeDb.id ? { ...database, records: [nextRecord, ...database.records] } : database,
      ),
      outbox: [op, ...workspace.outbox],
    });
    setSelectedRecordId(nextRecord.id);
  };

  const deleteRecord = (recordId: string) => {
    const op = queueOperation(activeDb, recordId, "delete", undefined, undefined, "Delete queued but requires explicit confirmation before source writeback.");
    updateWorkspace({
      ...workspace,
      databases: workspace.databases.map((database) =>
        database.id === activeDb.id
          ? { ...database, records: database.records.filter((record) => record.id !== recordId) }
          : database,
      ),
      outbox: [{ ...op, status: "blocked" }, ...workspace.outbox],
    });
    setSelectedRecordId(null);
  };

  const updateView = (patch: Partial<DatabaseView>) => {
    updateWorkspace({
      ...workspace,
      databases: workspace.databases.map((database) =>
        database.id === activeDb.id
          ? {
              ...database,
              views: database.views.map((view) => (view.id === activeView.id ? { ...view, ...patch } : view)),
            }
          : database,
      ),
    });
  };

  const addView = (type: ViewType) => {
    const newView: DatabaseView = {
      id: makeId("view"),
      name: `${type[0].toUpperCase()}${type.slice(1)}`,
      type,
      fields: activeDb.fields.slice(0, Math.min(6, activeDb.fields.length)).map((field) => field.key),
      groupBy: activeDb.fields.find((field) => field.type === "status")?.key,
      sortBy: activeDb.fields.find((field) => field.type === "date" || field.type === "datetime")?.key,
    };
    updateWorkspace({
      ...workspace,
      databases: workspace.databases.map((database) =>
        database.id === activeDb.id ? { ...database, views: [...database.views, newView] } : database,
      ),
    });
    setViewByDb({ ...viewByDb, [activeDb.id]: newView.id });
  };

  const resetWorkspace = () => {
    const next = seedState();
    updateWorkspace(next);
    setActiveDbId(next.databases[0].id);
    setSelectedRecordId(null);
    setViewByDb(Object.fromEntries(next.databases.map((database) => [database.id, database.views[0]?.id ?? ""])));
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `mab-database-os-export-${todayIso()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const syncNow = async () => {
    const queuedRun: SyncRun = {
      id: makeId("sync"),
      source: "cloudflare",
      status: "queued",
      startedAt: new Date().toISOString(),
      recordsSeen: workspace.databases.reduce((sum, database) => sum + database.records.length, 0),
      message: `Sync request queued against ${workspace.apiBase}.`,
    };
    updateWorkspace({ ...workspace, syncRuns: [queuedRun, ...workspace.syncRuns] });

    try {
      const response = await fetch(`${workspace.apiBase.replace(/\/$/, "")}/api/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestedAt: new Date().toISOString(), sources: sourceConnections.map((connection) => connection.id) }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = (await response.json()) as { message?: string; recordsSeen?: number };
      const finished: SyncRun = {
        ...queuedRun,
        status: "success",
        finishedAt: new Date().toISOString(),
        recordsSeen: body.recordsSeen ?? queuedRun.recordsSeen,
        message: body.message ?? "Cloudflare sync accepted the request.",
      };
      updateWorkspace({ ...workspace, syncRuns: [finished, ...workspace.syncRuns.filter((run) => run.id !== queuedRun.id)] });
    } catch (error) {
      const failed: SyncRun = {
        ...queuedRun,
        status: "failed",
        finishedAt: new Date().toISOString(),
        message: `Cloudflare backend is not reachable yet: ${error instanceof Error ? error.message : "unknown error"}.`,
      };
      updateWorkspace({ ...workspace, syncRuns: [failed, ...workspace.syncRuns.filter((run) => run.id !== queuedRun.id)] });
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        databases={workspace.databases}
        connections={sourceConnections}
        activeDbId={activeDb.id}
        onSelect={(id) => {
          setActiveDbId(id);
          setSelectedRecordId(null);
        }}
      />
      <main className="workspace">
        <Header
          database={activeDb}
          view={activeView}
          records={records}
          query={query}
          setQuery={setQuery}
          onAdd={addRecord}
          onExport={exportJson}
          onReset={resetWorkspace}
          onSync={syncNow}
          showBuilder={showBuilder}
          setShowBuilder={setShowBuilder}
          apiBase={workspace.apiBase}
          setApiBase={(apiBase) => updateWorkspace({ ...workspace, apiBase })}
        />
        <Dashboard databases={workspace.databases} outbox={workspace.outbox} conflicts={workspace.conflicts} activeDb={activeDb} />
        <SourceDock connections={sourceConnections} activeSource={activeDb.sync.sourceType} />
        {globalResults.length > 0 && (
          <GlobalResults
            results={globalResults}
            onOpen={(databaseId, recordId) => {
              setActiveDbId(databaseId);
              setSelectedRecordId(recordId);
            }}
          />
        )}
        <ViewTabs
          views={activeDb.views}
          activeViewId={activeView.id}
          onSelect={(id) => setViewByDb({ ...viewByDb, [activeDb.id]: id })}
          onAddView={addView}
        />
        <section className={`content-grid ${showBuilder ? "with-builder" : ""}`}>
          <div className="database-surface">
            <DatabaseRenderer
              database={activeDb}
              view={activeView}
              records={records}
              onOpen={setSelectedRecordId}
              onUpdate={updateRecord}
            />
          </div>
          {showBuilder && (
            <RightPanel
              activePanel={activePanel}
              setActivePanel={setActivePanel}
              database={activeDb}
              view={activeView}
              onUpdateView={updateView}
              connections={sourceConnections}
              outbox={workspace.outbox}
              conflicts={workspace.conflicts}
              syncRuns={workspace.syncRuns}
            />
          )}
        </section>
      </main>
      {selectedRecord && (
        <RecordDrawer
          database={activeDb}
          record={selectedRecord}
          onClose={() => setSelectedRecordId(null)}
          onUpdate={updateRecord}
          onDuplicate={duplicateRecord}
          onDelete={deleteRecord}
        />
      )}
    </div>
  );
}

function Sidebar({
  databases,
  connections,
  activeDbId,
  onSelect,
}: {
  databases: Database[];
  connections: SourceConnection[];
  activeDbId: string;
  onSelect: (id: string) => void;
}) {
  const categories = Array.from(new Set(databases.map((database) => database.category)));
  const totalRecords = databases.reduce((sum, database) => sum + database.records.length, 0);
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">MAB</div>
        <div>
          <strong>Database OS</strong>
          <span>{totalRecords} mirrored records</span>
        </div>
      </div>
      <div className="side-search-card">
        <span>Source state</span>
        <strong>{connections.filter((connection) => connection.state === "snapshot" || connection.state === "connected").length} connected snapshots</strong>
        <small>Cloudflare and GitHub are staged for auth.</small>
      </div>
      <nav className="nav-groups">
        {categories.map((category) => (
          <div className="nav-group" key={category}>
            <p>{category}</p>
            {databases
              .filter((database) => database.category === category)
              .map((database) => (
                <button className={database.id === activeDbId ? "active" : ""} key={database.id} onClick={() => onSelect(database.id)}>
                  <span>
                    <b>{database.shortName}</b>
                    <small>{sourceLabel(database.sync.sourceType)}</small>
                  </span>
                  <em>{database.records.length}</em>
                </button>
              ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

function Header({
  database,
  view,
  records,
  query,
  setQuery,
  onAdd,
  onExport,
  onReset,
  onSync,
  showBuilder,
  setShowBuilder,
  apiBase,
  setApiBase,
}: {
  database: Database;
  view: DatabaseView;
  records: RecordItem[];
  query: string;
  setQuery: (value: string) => void;
  onAdd: () => void;
  onExport: () => void;
  onReset: () => void;
  onSync: () => void;
  showBuilder: boolean;
  setShowBuilder: (value: boolean) => void;
  apiBase: string;
  setApiBase: (value: string) => void;
}) {
  return (
    <header className="topbar">
      <div className="title-block">
        <p className="eyebrow">{database.category} / {sourceLabel(database.sync.sourceType)}</p>
        <h1>{database.name}</h1>
        <p className="subtle">{database.description}</p>
        <div className="source-line">
          <span className={`status-dot ${database.sync.state}`} />
          <span>{database.sync.notes}</span>
        </div>
      </div>
      <div className="top-actions">
        <label className="command-search">
          <span>Ask the workspace</span>
          <input
            aria-label="Search workspace"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${records.length} ${view.name.toLowerCase()} records`}
          />
        </label>
        <label className="api-field">
          <span>Sync API</span>
          <input value={apiBase} onChange={(event) => setApiBase(event.target.value)} />
        </label>
        <div className="action-row">
          <button className="secondary" onClick={() => setShowBuilder(!showBuilder)}>{showBuilder ? "Hide panels" : "Show panels"}</button>
          <button className="secondary" onClick={onExport}>Export</button>
          <button className="secondary" onClick={onReset}>Reset mirror</button>
          <button className="secondary" onClick={onSync}>Sync now</button>
          <button className="primary" onClick={onAdd}>New record</button>
        </div>
      </div>
    </header>
  );
}

function Dashboard({ databases, outbox, conflicts, activeDb }: { databases: Database[]; outbox: OutboxOperation[]; conflicts: ConflictItem[]; activeDb: Database }) {
  const deals = databases.find((database) => database.id === "deals");
  const clients = databases.find((database) => database.id === "clients");
  const docs = databases.find((database) => database.id === "workspace-docs");
  const pipelineValue = deals?.records.reduce((sum, record) => sum + Number(recordValue(record.value) || 0), 0) ?? 0;
  const activeClients = clients?.records.filter((record) => ["Qualified", "Active Client", "In Conversation"].includes(valueText(record.status))).length ?? 0;
  const sourceTypes = new Set(databases.map((database) => database.sync.sourceType)).size;

  return (
    <section className="metrics">
      <Metric label="Mirrored records" value={databases.reduce((sum, database) => sum + database.records.length, 0).toString()} detail={`${databases.length} source-aware collections`} />
      <Metric label="Pipeline value" value={formatCurrency(pipelineValue)} detail={`${activeClients} client or cohort focus areas`} />
      <Metric label="Workspace docs" value={(docs?.records.length ?? 0).toString()} detail={`${sourceTypes} source systems represented`} />
      <Metric label="Writeback queue" value={outbox.length.toString()} detail={`${conflicts.length} conflict or redaction guardrail`} />
      <Metric label="Current view" value={activeDb.records.length.toString()} detail={`${activeDb.name} records in ${sourceLabel(activeDb.sync.sourceType)}`} />
    </section>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function SourceDock({ connections, activeSource }: { connections: SourceConnection[]; activeSource: SourceType }) {
  return (
    <section className="source-dock">
      {connections.map((connection) => (
        <article className={connection.id === activeSource ? "active" : ""} key={connection.id}>
          <span className={`status-dot ${connection.state}`} />
          <div>
            <strong>{connection.name}</strong>
            <small>{connection.detail}</small>
          </div>
          <em>{connection.recordCount}</em>
        </article>
      ))}
    </section>
  );
}

function GlobalResults({
  results,
  onOpen,
}: {
  results: Array<{ database: Database; record: RecordItem; title: string }>;
  onOpen: (databaseId: string, recordId: string) => void;
}) {
  return (
    <section className="global-results">
      <span>Cross-source matches</span>
      <div>
        {results.slice(0, 8).map(({ database, record, title }) => (
          <button key={`${database.id}-${record.id}`} onClick={() => onOpen(database.id, record.id)}>
            <strong>{title}</strong>
            <small>{database.name} / {sourceLabel(database.sync.sourceType)}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function ViewTabs({
  views,
  activeViewId,
  onSelect,
  onAddView,
}: {
  views: DatabaseView[];
  activeViewId: string;
  onSelect: (id: string) => void;
  onAddView: (type: ViewType) => void;
}) {
  return (
    <div className="view-tabs">
      {views.map((view) => (
        <button className={view.id === activeViewId ? "active" : ""} key={view.id} onClick={() => onSelect(view.id)}>
          {view.name}
          <span>{view.type}</span>
        </button>
      ))}
      <select onChange={(event) => { if (event.target.value) onAddView(event.target.value as ViewType); event.target.value = ""; }} defaultValue="">
        <option value="" disabled>New view</option>
        <option value="table">Table</option>
        <option value="board">Board</option>
        <option value="list">List</option>
        <option value="calendar">Calendar</option>
        <option value="gallery">Gallery</option>
      </select>
    </div>
  );
}

function DatabaseRenderer({
  database,
  view,
  records,
  onOpen,
  onUpdate,
}: {
  database: Database;
  view: DatabaseView;
  records: RecordItem[];
  onOpen: (id: string) => void;
  onUpdate: (id: string, key: string, value: RecordValue) => void;
}) {
  if (records.length === 0) return <EmptyState database={database} />;
  if (view.type === "board") return <BoardView database={database} view={view} records={records} onOpen={onOpen} onUpdate={onUpdate} />;
  if (view.type === "calendar") return <CalendarView database={database} view={view} records={records} onOpen={onOpen} />;
  if (view.type === "gallery") return <GalleryView database={database} view={view} records={records} onOpen={onOpen} />;
  if (view.type === "list") return <ListView database={database} view={view} records={records} onOpen={onOpen} />;
  return <TableView database={database} view={view} records={records} onOpen={onOpen} onUpdate={onUpdate} />;
}

function EmptyState({ database }: { database: Database }) {
  return (
    <div className="empty-state">
      <strong>No records in this filtered view.</strong>
      <p>{database.sync.state === "needs-auth" ? "Connect the source to pull this collection." : "Clear search or create a new record."}</p>
    </div>
  );
}

function TableView({
  database,
  view,
  records,
  onOpen,
  onUpdate,
}: {
  database: Database;
  view: DatabaseView;
  records: RecordItem[];
  onOpen: (id: string) => void;
  onUpdate: (id: string, key: string, value: RecordValue) => void;
}) {
  const fields = view.fields.map((key) => getField(database, key)).filter(Boolean) as Field[];
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th className="source-th">Source</th>
            {fields.map((field) => (
              <th key={field.key} style={{ minWidth: field.width }}>{field.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td><SourcePill record={record} fallback={database.sync.sourceType} /></td>
              {fields.map((field, index) => (
                <td key={field.key}>
                  {index === 0 ? (
                    <button className="record-link" onClick={() => onOpen(record.id)}>{valueText(record[field.key]) || "Untitled"}</button>
                  ) : (
                    <EditableCell field={field} value={record[field.key]} onChange={(value) => onUpdate(record.id, field.key, value)} />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BoardView({
  database,
  view,
  records,
  onOpen,
  onUpdate,
}: {
  database: Database;
  view: DatabaseView;
  records: RecordItem[];
  onOpen: (id: string) => void;
  onUpdate: (id: string, key: string, value: RecordValue) => void;
}) {
  const groupField = getField(database, view.groupBy ?? "") ?? database.fields.find((field) => field.type === "status" || field.type === "select");
  const groups = groupField?.options?.map((option) => option.name) ?? Array.from(new Set(records.map((record) => valueText(record[groupField?.key ?? ""]))));
  const titleField = getTitleField(database);
  const visibleFields = view.fields.map((key) => getField(database, key)).filter(Boolean) as Field[];

  return (
    <div className="board">
      {groups.map((group) => {
        const groupRecords = records.filter((record) => valueText(record[groupField?.key ?? ""]) === group);
        return (
          <section className="board-column" key={group}>
            <header>
              <span className={classForOption(groupField, group)}>{group}</span>
              <small>{groupRecords.length}</small>
            </header>
            <div className="board-stack">
              {groupRecords.map((record) => (
                <article className="board-card" key={record.id} onClick={() => onOpen(record.id)}>
                  <div className="card-topline">
                    <SourcePill record={record} fallback={database.sync.sourceType} />
                    <small>{database.shortName}</small>
                  </div>
                  <strong>{valueText(record[titleField.key])}</strong>
                  {visibleFields.filter((field) => field.key !== titleField.key).slice(0, 4).map((field) => (
                    <div className="board-field" key={field.key}>
                      <span>{field.label}</span>
                      <FieldValue field={field} value={record[field.key]} />
                    </div>
                  ))}
                  {groupField && !groupField.readOnly && (
                    <select
                      value={valueText(record[groupField.key])}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => onUpdate(record.id, groupField.key, event.target.value)}
                    >
                      {groupField.options?.map((option) => <option key={option.name}>{option.name}</option>)}
                    </select>
                  )}
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ListView({ database, view, records, onOpen }: { database: Database; view: DatabaseView; records: RecordItem[]; onOpen: (id: string) => void }) {
  const titleField = getTitleField(database);
  const fields = view.fields.map((key) => getField(database, key)).filter(Boolean) as Field[];
  return (
    <div className="list-view">
      {records.map((record) => (
        <button className="list-row" key={record.id} onClick={() => onOpen(record.id)}>
          <SourcePill record={record} fallback={database.sync.sourceType} />
          <div>
            <strong>{valueText(record[titleField.key])}</strong>
            <span>{fields.filter((field) => field.key !== titleField.key).map((field) => `${field.label}: ${valueText(record[field.key])}`).join(" | ")}</span>
          </div>
          <span>Open</span>
        </button>
      ))}
    </div>
  );
}

function CalendarView({ database, view, records, onOpen }: { database: Database; view: DatabaseView; records: RecordItem[]; onOpen: (id: string) => void }) {
  const dateField = getDateField(database, view);
  const titleField = getTitleField(database);
  const allDates = records
    .map((record) => new Date(valueText(record[dateField?.key ?? ""])))
    .filter((date) => !Number.isNaN(date.getTime()));
  const anchor = allDates[0] ?? new Date();
  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const offset = monthStart.getDay();
  const days = Array.from({ length: 35 }, (_, index) => {
    const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 + index - offset);
    const iso = date.toISOString().slice(0, 10);
    return {
      date,
      iso,
      records: records.filter((record) => valueText(record[dateField?.key ?? ""]).slice(0, 10) === iso),
    };
  });

  return (
    <div className="calendar">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <strong className="day-label" key={day}>{day}</strong>)}
      {days.map((day) => (
        <section className="calendar-day" key={day.iso}>
          <time>{day.date.getDate()}</time>
          {day.records.map((record) => (
            <button key={record.id} onClick={() => onOpen(record.id)}>{valueText(record[titleField.key])}</button>
          ))}
        </section>
      ))}
    </div>
  );
}

function GalleryView({ database, view, records, onOpen }: { database: Database; view: DatabaseView; records: RecordItem[]; onOpen: (id: string) => void }) {
  const titleField = getTitleField(database);
  const fields = view.fields.map((key) => getField(database, key)).filter(Boolean) as Field[];
  return (
    <div className="gallery">
      {records.map((record) => (
        <button className="gallery-card" key={record.id} onClick={() => onOpen(record.id)}>
          <div className="image-fallback">
            <span>{database.shortName}</span>
            <SourcePill record={record} fallback={database.sync.sourceType} />
          </div>
          <strong>{valueText(record[titleField.key])}</strong>
          {fields.filter((field) => field.key !== titleField.key).slice(0, 3).map((field) => (
            <FieldValue key={field.key} field={field} value={record[field.key]} />
          ))}
        </button>
      ))}
    </div>
  );
}

function RightPanel({
  activePanel,
  setActivePanel,
  database,
  view,
  onUpdateView,
  connections,
  outbox,
  conflicts,
  syncRuns,
}: {
  activePanel: "builder" | "sources" | "outbox" | "runs";
  setActivePanel: (panel: "builder" | "sources" | "outbox" | "runs") => void;
  database: Database;
  view: DatabaseView;
  onUpdateView: (patch: Partial<DatabaseView>) => void;
  connections: SourceConnection[];
  outbox: OutboxOperation[];
  conflicts: ConflictItem[];
  syncRuns: SyncRun[];
}) {
  return (
    <aside className="right-panel">
      <div className="panel-tabs">
        {(["builder", "sources", "outbox", "runs"] as const).map((panel) => (
          <button className={activePanel === panel ? "active" : ""} key={panel} onClick={() => setActivePanel(panel)}>{panel}</button>
        ))}
      </div>
      {activePanel === "builder" && <ViewBuilder database={database} view={view} onUpdate={onUpdateView} />}
      {activePanel === "sources" && <SourcesPanel database={database} connections={connections} />}
      {activePanel === "outbox" && <OutboxPanel outbox={outbox} conflicts={conflicts} />}
      {activePanel === "runs" && <RunsPanel syncRuns={syncRuns} />}
    </aside>
  );
}

function ViewBuilder({ database, view, onUpdate }: { database: Database; view: DatabaseView; onUpdate: (patch: Partial<DatabaseView>) => void }) {
  const groupable = database.fields.filter((field) => field.type === "status" || field.type === "select");
  const sortable = database.fields.filter((field) => field.type === "date" || field.type === "datetime" || field.type === "number" || field.type === "currency" || field.type === "title");
  const toggleField = (fieldKey: string) => {
    const fields = view.fields.includes(fieldKey) ? view.fields.filter((key) => key !== fieldKey) : [...view.fields, fieldKey];
    onUpdate({ fields });
  };

  return (
    <div className="builder">
      <div>
        <p className="eyebrow">View builder</p>
        <input className="builder-title" value={view.name} onChange={(event) => onUpdate({ name: event.target.value })} />
      </div>
      <label>
        Layout
        <select value={view.type} onChange={(event) => onUpdate({ type: event.target.value as ViewType })}>
          <option value="table">Table</option>
          <option value="board">Board</option>
          <option value="list">List</option>
          <option value="calendar">Calendar</option>
          <option value="gallery">Gallery</option>
        </select>
      </label>
      <label>
        Group by
        <select value={view.groupBy ?? ""} onChange={(event) => onUpdate({ groupBy: event.target.value || undefined })}>
          <option value="">No grouping</option>
          {groupable.map((field) => <option key={field.key} value={field.key}>{field.label}</option>)}
        </select>
      </label>
      <label>
        Sort date/value
        <select value={view.sortBy ?? ""} onChange={(event) => onUpdate({ sortBy: event.target.value || undefined })}>
          <option value="">Default order</option>
          {sortable.map((field) => <option key={field.key} value={field.key}>{field.label}</option>)}
        </select>
      </label>
      <div className="field-picker">
        <span>Visible properties</span>
        {database.fields.map((field) => (
          <label key={field.key} className="check-row">
            <input type="checkbox" checked={view.fields.includes(field.key)} onChange={() => toggleField(field.key)} />
            {field.label}
            <small>{field.type}{field.readOnly ? " / read only" : ""}</small>
          </label>
        ))}
      </div>
    </div>
  );
}

function SourcesPanel({ database, connections }: { database: Database; connections: SourceConnection[] }) {
  const active = connections.find((connection) => connection.id === database.sync.sourceType);
  return (
    <div className="panel-stack">
      <section>
        <p className="eyebrow">Active source</p>
        <h3>{sourceLabel(database.sync.sourceType)}</h3>
        <p>{database.source}</p>
        {database.sync.sourceUrl && <a href={database.sync.sourceUrl} target="_blank" rel="noreferrer">Open source</a>}
      </section>
      <section>
        <p className="eyebrow">Writeback</p>
        <strong>{database.sync.writeback}</strong>
        <p>{database.sync.notes}</p>
      </section>
      {active && (
        <section>
          <p className="eyebrow">Connection</p>
          <strong>{active.state}</strong>
          <p>{active.detail}</p>
          <small>{active.writeback}</small>
        </section>
      )}
    </div>
  );
}

function OutboxPanel({ outbox, conflicts }: { outbox: OutboxOperation[]; conflicts: ConflictItem[] }) {
  return (
    <div className="panel-stack">
      <section>
        <p className="eyebrow">Pending writeback</p>
        <strong>{outbox.length} operations</strong>
      </section>
      {outbox.slice(0, 8).map((op) => (
        <article className="event-card" key={op.id}>
          <span className={`op-status ${op.status}`}>{op.status}</span>
          <strong>{sourceLabel(op.source)} / {op.action}</strong>
          <p>{op.note}</p>
          {op.field && <small>{op.field}: {valueText(op.value)}</small>}
        </article>
      ))}
      {conflicts.map((conflict) => (
        <article className="event-card conflict" key={conflict.id}>
          <span className="op-status blocked">conflict</span>
          <strong>{conflict.field}</strong>
          <p>Local: {valueText(conflict.localValue)} / Remote: {valueText(conflict.remoteValue)}</p>
        </article>
      ))}
    </div>
  );
}

function RunsPanel({ syncRuns }: { syncRuns: SyncRun[] }) {
  return (
    <div className="panel-stack">
      <section>
        <p className="eyebrow">Sync history</p>
        <strong>{syncRuns.length} runs</strong>
      </section>
      {syncRuns.map((run) => (
        <article className="event-card" key={run.id}>
          <span className={`op-status ${run.status}`}>{run.status}</span>
          <strong>{sourceLabel(run.source)}</strong>
          <p>{run.message}</p>
          <small>{formatDate(run.startedAt)} / {run.recordsSeen} records</small>
        </article>
      ))}
    </div>
  );
}

function RecordDrawer({
  database,
  record,
  onClose,
  onUpdate,
  onDuplicate,
  onDelete,
}: {
  database: Database;
  record: RecordItem;
  onClose: () => void;
  onUpdate: (id: string, key: string, value: RecordValue) => void;
  onDuplicate: (record: RecordItem) => void;
  onDelete: (id: string) => void;
}) {
  const titleField = getTitleField(database);
  const source = record._source && typeof record._source === "object" && !Array.isArray(record._source) ? record._source : undefined;
  return (
    <aside className="drawer">
      <header>
        <div>
          <p className="eyebrow">{database.name}</p>
          <h2>{valueText(record[titleField.key]) || "Untitled"}</h2>
        </div>
        <button className="icon-button" onClick={onClose}>Close</button>
      </header>
      <div className="drawer-actions">
        <button className="secondary" onClick={() => onDuplicate(record)}>Duplicate</button>
        {source?.url && <a className="secondary button-link" href={source.url} target="_blank" rel="noreferrer">Open source</a>}
        <button className="danger" onClick={() => onDelete(record.id)}>Delete</button>
      </div>
      <section className="source-card">
        <SourcePill record={record} fallback={database.sync.sourceType} />
        <div>
          <strong>{source?.id ?? database.sync.sourceId}</strong>
          <span>{source?.writeback ?? database.sync.writeback} writeback / captured {formatDate(source?.capturedAt)}</span>
        </div>
      </section>
      {record._summary && <p className="record-summary">{record._summary}</p>}
      <div className="property-list">
        {database.fields.map((field) => (
          <label className="property-editor" key={field.key}>
            <span>{field.label}</span>
            <EditableCell field={field} value={record[field.key]} onChange={(value) => onUpdate(record.id, field.key, value)} expanded />
          </label>
        ))}
      </div>
    </aside>
  );
}

function SourcePill({ record, fallback }: { record: RecordItem; fallback: SourceType }) {
  const source = record._source && typeof record._source === "object" && !Array.isArray(record._source) ? record._source.type : fallback;
  return <span className={`source-pill source-${source}`}>{sourceLabel(source)}</span>;
}

function FieldValue({ field, value }: { field: Field; value: RecordItem[string] }) {
  if (field.type === "currency") return <span>{formatCurrency(value)}</span>;
  if (field.type === "date" || field.type === "datetime") return <span>{formatDate(value)}</span>;
  if (field.type === "checkbox") return <span>{valueText(value)}</span>;
  if (field.type === "status" || field.type === "select") return <span className={classForOption(field, valueText(value))}>{valueText(value)}</span>;
  if (field.type === "multi") {
    return (
      <span className="multi-pills">
        {(Array.isArray(recordValue(value)) ? recordValue(value) as string[] : valueText(value).split(",").filter(Boolean)).map((item) => (
          <span key={item}>{item.trim()}</span>
        ))}
      </span>
    );
  }
  if (field.type === "url" && valueText(value)) return <a href={valueText(value)} target="_blank" rel="noreferrer">{valueText(value)}</a>;
  return <span>{valueText(value)}</span>;
}

function EditableCell({
  field,
  value,
  onChange,
  expanded,
}: {
  field: Field;
  value: RecordItem[string];
  onChange: (value: RecordValue) => void;
  expanded?: boolean;
}) {
  const text = valueText(value);
  if (field.readOnly) return <div className="read-only"><FieldValue field={field} value={value} /></div>;
  if (field.type === "status" || field.type === "select") {
    return (
      <select className="cell-select" value={text} onChange={(event) => onChange(event.target.value)}>
        <option value="">Empty</option>
        {field.options?.map((option) => <option key={option.name}>{option.name}</option>)}
      </select>
    );
  }
  if (field.type === "checkbox") {
    return <input type="checkbox" checked={text === "Yes" || text === "true"} onChange={(event) => onChange(event.target.checked)} />;
  }
  if (field.type === "multi") {
    return (
      <input
        className="cell-input"
        value={Array.isArray(recordValue(value)) ? (recordValue(value) as string[]).join(", ") : text}
        onChange={(event) => onChange(event.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
      />
    );
  }
  if (field.type === "number" || field.type === "currency") {
    return <input className="cell-input" type="number" value={text} onChange={(event) => onChange(Number(event.target.value))} />;
  }
  if (expanded || field.type === "text") {
    return <textarea className="cell-input" value={text} rows={expanded || text.length > 80 ? 4 : 1} onChange={(event) => onChange(event.target.value)} />;
  }
  return <input className="cell-input" value={text} onChange={(event) => onChange(event.target.value)} />;
}
