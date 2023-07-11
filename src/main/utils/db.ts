import fs from 'fs-extra';
import path from 'path';
import Store from 'electron-store';

const dbArray = new Map();

/**
 * Database configuration options
 */
export interface DataBaseOptions {
    // Root directory for data storage
    baseDir: string;
    // File suffix
    suffix: string;
}

export const config: DataBaseOptions = {
    baseDir: "db",
    suffix: ".json"
};

export class DB<T> {
    store: Store;
    dbDir: string;
    dbPath: string;
    dbKey: string;
    data: Array<T>;

    constructor(database: string) {
        this.store = new Store({
            name: database
        });
        this.data = [];
        this.dbDir = path.join(process.cwd(), config.baseDir, database.substring(0, database.lastIndexOf('/')));
        this.dbPath = path.join(process.cwd(), config.baseDir, database + config.suffix);
        this.dbKey = database;

        let data = this.store.get(this.dbKey);
        if (data) {
            this.data = data as Array<T>;
        } else {
            this._write();
        }
    }

    insert(data: T): void {
        this.data.push(data);
        this._write();
    }

    remove(index: number, count: number = 1): void {
        this.data.splice(index, count);
        this._write();
    }

    update(): void {
        this._write();
    }

    clear(): void {
        this.data = [];
        this._write();
    }

    change(oldIndex: number, newData: T, excludeKeys: string[] = []): void {
        const oldData = this.data[oldIndex];
        const oldKeys = Object.keys(newData).filter(m => excludeKeys.indexOf(m) < 0);
        oldKeys.forEach((key, index) => {
            if (newData[key] == null || newData[key] == undefined) {
                delete oldData[key];
            } else {
                oldData[key] = newData[key];
            }
        });
        this._write();
    }

    private _write(): void {
        this.store.set(this.dbKey, this.data);
    }
}

/**
 * Get a database, create if it doesn't exist
 * @param database Database path (without suffix)
 * @returns 
 */
export function getDB<T>(database: string): DB<T> {
    if (dbArray.has(database)) {
        return dbArray.get(database);
    } else {
        const db = new DB<T>(database);
        dbArray.set(database, db);
        return db;
    }
}
