import {
  mockCollections,
  mockRecords,
  mockSources
} from "./mock-data";
import type {
  JsonObject,
  OutboxCreateBody,
  OutboxOperation,
  Provider,
  SeedCollectionDescriptor,
  SeedRecordDescriptor,
  SeedSourceDescriptor
} from "./types";

export interface SourceAdapter {
  readonly provider: Provider;
  discoverSource(): Promise<SeedSourceDescriptor>;
  listCollections(): Promise<SeedCollectionDescriptor[]>;
  listRecords(collectionId?: string): Promise<SeedRecordDescriptor[]>;
  previewWriteback(operation: OutboxOperation, input: OutboxCreateBody): Promise<JsonObject>;
}

const providerLabels: Record<Provider, string> = {
  notion: "Notion",
  google: "Google Drive",
  gmail: "Gmail",
  calendar: "Google Calendar"
};

export function createAdapter(provider: Provider): SourceAdapter {
  return new MockSourceAdapter(provider);
}

class MockSourceAdapter implements SourceAdapter {
  constructor(public readonly provider: Provider) {}

  async discoverSource(): Promise<SeedSourceDescriptor> {
    const source = mockSources.find((item) => item.provider === this.provider);
    if (!source) {
      throw new Error(`No seed source available for ${this.provider}`);
    }
    return source;
  }

  async listCollections(): Promise<SeedCollectionDescriptor[]> {
    return mockCollections.filter((collection) => collection.sourceId.startsWith(this.provider));
  }

  async listRecords(collectionId?: string): Promise<SeedRecordDescriptor[]> {
    const records = mockRecords.filter((record) => record.sourceId.startsWith(this.provider));
    if (!collectionId) {
      return records;
    }
    return records.filter((record) => record.collectionId === collectionId);
  }

  async previewWriteback(operation: OutboxOperation, input: OutboxCreateBody): Promise<JsonObject> {
    return {
      provider: this.provider,
      label: providerLabels[this.provider],
      operation,
      targetCollectionId: input.collectionId ?? null,
      targetRecordId: input.recordId ?? null,
      status: "placeholder",
      message:
        "This adapter is a scaffold. Connect the provider API and encrypted OAuth credentials to enable writeback."
    };
  }
}
