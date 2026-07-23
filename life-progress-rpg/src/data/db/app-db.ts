import Dexie, { type Table } from 'dexie';
import type { DbRecord, DbSettings } from './schema';

export class AppDb extends Dexie {
  records!: Table<DbRecord, string>;
  settings!: Table<DbSettings, string>;

  constructor() {
    super('life-progress-rpg');
    this.version(1).stores({
      records: 'id, &[userId+localDate], localDate, userId, updatedAt, *tags',
      settings: 'id, updatedAt',
    });
  }
}

export const appDb = new AppDb();
