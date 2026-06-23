export type DbRow = Record<string, unknown>;

export interface DatabaseClient {
  query<T extends DbRow = DbRow>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<void>;
}

export class NotConfiguredDatabaseClient implements DatabaseClient {
  async query<T extends DbRow = DbRow>(): Promise<T[]> {
    return [];
  }

  async execute(): Promise<void> {
    return;
  }
}

export const db: DatabaseClient = new NotConfiguredDatabaseClient();
