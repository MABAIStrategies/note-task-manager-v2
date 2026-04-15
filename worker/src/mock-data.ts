import type {
  Provider,
  SeedCollectionDescriptor,
  SeedOutboxDescriptor,
  SeedRecordDescriptor,
  SeedSourceDescriptor,
  SeedSyncRunDescriptor
} from "./types";

const now = "2026-04-15T00:00:00.000Z";

const source = (provider: Provider, name: string, workspaceName: string): SeedSourceDescriptor => ({
  id: `${provider}-mab`,
  provider,
  name,
  workspaceName,
  authState: "placeholder",
  baseUrl: null,
  externalWorkspaceId: null,
  metadata: {
    teamspace: "MAB AI Strategies",
    mode: "mirror-writeback",
    seeded: true
  }
});

export const mockSources: SeedSourceDescriptor[] = [
  source("notion", "MAB AI Strategies Notion", "MAB AI Strategies"),
  source("google", "MAB AI Strategies Google Drive", "MAB AI Strategies"),
  source("gmail", "MAB AI Strategies Gmail", "MAB AI Strategies"),
  source("calendar", "MAB AI Strategies Calendar", "MAB AI Strategies")
];

const notionCollections = [
  "CRM",
  "Clients",
  "Deals",
  "Interactions",
  "Projects",
  "Asset Library",
  "CRM Sales Tools",
  "Agent Teams",
  "Todo List",
  "The Lab",
  "Resources",
  "Lead Gen",
  "Meeting Notes",
  "Prompts"
];

const googleCollections = [
  "Strategic Fiverr AI Growth Plan",
  "Master_Merged.xlsx",
  "*Sales Pro v0.13",
  "Indiana Rust Belt B2B Prospect Database",
  "AI Research and Outreach Plan"
];

const gmailCollections = [
  "MAB AI Strategies Inbox",
  "MAB Calendar Notifications",
  "MAB Google Chat Relays"
];

const calendarCollections = [
  "MAB Operations Calendar",
  "Biz Ops"
];

export const mockCollections: SeedCollectionDescriptor[] = [
  ...notionCollections.map((name, index) => ({
    id: `notion-collection-${index + 1}`,
    sourceId: "notion-mab",
    externalId: `notion-db-${index + 1}`,
    parentCollectionId: null,
    name,
    kind: index === 0 ? "database" : "inline_database",
    isInline: index > 0,
    schema: {
      title: { type: "title" },
      status: { type: "status" },
      owner: { type: "people" }
    },
    views: {
      default: index === 0 ? "table" : "board",
      available: ["table", "board", "list", "calendar", "gallery"]
    },
    metadata: {
      source: "notion",
      teamspace: "MAB AI Strategies",
      priority: index < 4 ? "high" : "normal"
    }
  })),
  ...googleCollections.map((name, index) => ({
    id: `google-collection-${index + 1}`,
    sourceId: "google-mab",
    externalId: `gdrive-${index + 1}`,
    parentCollectionId: null,
    name,
    kind: "drive_file_group",
    isInline: false,
    schema: {
      title: { type: "title" },
      fileType: { type: "select" },
      url: { type: "url" }
    },
    views: {
      default: "list",
      available: ["list", "table", "gallery"]
    },
    metadata: {
      source: "google_drive",
      priority: index === 0 ? "high" : "normal"
    }
  })),
  ...gmailCollections.map((name, index) => ({
    id: `gmail-collection-${index + 1}`,
    sourceId: "gmail-mab",
    externalId: `gmail-${index + 1}`,
    parentCollectionId: null,
    name,
    kind: "thread_group",
    isInline: false,
    schema: {
      subject: { type: "title" },
      participants: { type: "multi_select" },
      status: { type: "status" }
    },
    views: {
      default: "table",
      available: ["table", "list"]
    },
    metadata: {
      source: "gmail",
      priority: index === 0 ? "high" : "normal"
    }
  })),
  ...calendarCollections.map((name, index) => ({
    id: `calendar-collection-${index + 1}`,
    sourceId: "calendar-mab",
    externalId: `calendar-${index + 1}`,
    parentCollectionId: null,
    name,
    kind: "event_stream",
    isInline: false,
    schema: {
      title: { type: "title" },
      start: { type: "date" },
      end: { type: "date" },
      status: { type: "status" }
    },
    views: {
      default: "calendar",
      available: ["calendar", "list", "table"]
    },
    metadata: {
      source: "google_calendar",
      priority: index === 0 ? "high" : "normal"
    }
  }))
] satisfies SeedCollectionDescriptor[];

export const mockRecords: SeedRecordDescriptor[] = [
  {
    id: "record-crm-1",
    sourceId: "notion-mab",
    collectionId: "notion-collection-1",
    externalId: "crm-row-1",
    title: "OpenClaw",
    status: "active",
    url: null,
    properties: {
      company: "OpenClaw",
      stage: "Qualified",
      owner: "MAB",
      priority: "High",
      value: 75000
    },
    relations: [],
    content: {
      summary: "Core AI systems and agent infrastructure opportunity."
    },
    metadata: {
      source: "notion",
      collection: "CRM"
    },
    archived: false
  },
  {
    id: "record-client-1",
    sourceId: "notion-mab",
    collectionId: "notion-collection-2",
    externalId: "client-row-1",
    title: "MAB Internal",
    status: "active",
    url: null,
    properties: {
      segment: "Internal",
      lifecycle: "Active"
    },
    relations: ["notion-collection-1"],
    content: {
      summary: "Internal operating record for strategy, systems, and delivery."
    },
    metadata: {
      source: "notion",
      collection: "Clients"
    },
    archived: false
  },
  {
    id: "record-project-1",
    sourceId: "notion-mab",
    collectionId: "notion-collection-5",
    externalId: "project-row-1",
    title: "Go-To-Market Systems",
    status: "in_progress",
    url: null,
    properties: {
      owner: "MAB",
      phase: "Build",
      priority: "High"
    },
    relations: ["notion-collection-1", "notion-collection-9"],
    content: {
      summary: "Operational GTM stack spanning proposals, outreach, and delivery."
    },
    metadata: {
      source: "notion",
      collection: "Projects"
    },
    archived: false
  },
  {
    id: "record-drive-1",
    sourceId: "google-mab",
    collectionId: "google-collection-1",
    externalId: "drive-file-1",
    title: "Strategic Fiverr AI Growth Plan",
    status: "active",
    url: "https://drive.google.com/",
    properties: {
      fileType: "Google Doc",
      category: "Strategy",
      excerpt: "High-ticket B2B AI consulting positioning and offer design."
    },
    relations: ["notion-collection-1", "notion-collection-5"],
    content: {
      summary: "Reference document for services, pricing, and delivery structure."
    },
    metadata: {
      source: "google_drive"
    },
    archived: false
  },
  {
    id: "record-gmail-1",
    sourceId: "gmail-mab",
    collectionId: "gmail-collection-1",
    externalId: "gmail-thread-1",
    title: "Calendar update: SOW & Proposal Templates",
    status: "active",
    url: null,
    properties: {
      sender: "Google Calendar",
      category: "Notification",
      actionRequired: "Review templates"
    },
    relations: ["calendar-collection-1"],
    content: {
      summary: "Notification related to the Biz Ops working session."
    },
    metadata: {
      source: "gmail"
    },
    archived: false
  },
  {
    id: "record-calendar-1",
    sourceId: "calendar-mab",
    collectionId: "calendar-collection-1",
    externalId: "calendar-event-1",
    title: "Biz Ops — SOW & Proposal Templates",
    status: "scheduled",
    url: null,
    properties: {
      startsAt: "2026-04-14T10:00:00-04:00",
      endsAt: "2026-04-14T11:30:00-04:00",
      location: "Virtual",
      owner: "MAB"
    },
    relations: ["notion-collection-5", "notion-collection-9"],
    content: {
      summary: "Working session to build and refine SOW and proposal templates."
    },
    metadata: {
      source: "google_calendar"
    },
    archived: false
  }
];

export const mockSyncRuns: SeedSyncRunDescriptor[] = [
  {
    id: "sync-run-1",
    sourceId: "notion-mab",
    provider: "notion",
    mode: "seed",
    status: "succeeded",
    request: {
      source: "mock",
      scope: "MAB AI Strategies"
    },
    result: {
      collections: 14,
      records: 5
    },
    errorMessage: null
  }
];

export const mockOutbox: SeedOutboxDescriptor[] = [
  {
    id: "outbox-1",
    sourceId: "notion-mab",
    collectionId: "notion-collection-1",
    recordId: "record-crm-1",
    provider: "notion",
    operation: "update",
    status: "pending",
    attempts: 0,
    payload: {
      status: "Qualified"
    },
    error: {},
    runAfter: null
  }
];

export const mockTimestamps = {
  now,
  seededAt: now
};
