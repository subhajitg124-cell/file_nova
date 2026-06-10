export interface DBFileRecord {
  id: string;
  name: string;
  size: number;
  type: string;
  blob: Blob;
  category: "Current" | "Recent" | "Downloads" | "Favorites" | "Shared";
  project?: string; // e.g. "Passport Application", "College Documents"
  timestamp: number;
}

export class FileDatabase {
  private dbName = "filenova-file-manager";
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files", { keyPath: "id" });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(request.error || new Error("Failed to open database"));
      };
    });
  }

  async saveFile(file: DBFileRecord): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("files", "readwrite");
      const store = transaction.objectStore("files");
      const request = store.put(file);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getFile(id: string): Promise<DBFileRecord | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("files", "readonly");
      const store = transaction.objectStore("files");
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFile(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("files", "readwrite");
      const store = transaction.objectStore("files");
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getFilesByCategory(category: string): Promise<DBFileRecord[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("files", "readonly");
      const store = transaction.objectStore("files");
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result || [];
        resolve(results.filter((f: any) => f.category === category));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getFilesByProject(project: string): Promise<DBFileRecord[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("files", "readonly");
      const store = transaction.objectStore("files");
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result || [];
        resolve(results.filter((f: any) => f.project === project));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllFiles(): Promise<DBFileRecord[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("files", "readonly");
      const store = transaction.objectStore("files");
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Deletes any cached workspace files older than expiryAgeMs (Default: 24 Hours)
  async cleanupOldFiles(expiryAgeMs: number = 24 * 60 * 60 * 1000): Promise<number> {
    const db = await this.init();
    const threshold = Date.now() - expiryAgeMs;
    const allFiles = await this.getAllFiles();
    const toDelete = allFiles.filter(f => f.timestamp < threshold && f.category !== "Favorites"); // Keep Favorites safe
    
    let deletedCount = 0;
    const transaction = db.transaction("files", "readwrite");
    const store = transaction.objectStore("files");

    await Promise.all(toDelete.map(f => {
      return new Promise<void>((resolve) => {
        const request = store.delete(f.id);
        request.onsuccess = () => {
          deletedCount++;
          resolve();
        };
        request.onerror = () => resolve(); // Ignore single file failures
      });
    }));

    return deletedCount;
  }

  // Aggregates total blob size in bytes
  async getDatabaseSize(): Promise<number> {
    try {
      const files = await this.getAllFiles();
      return files.reduce((acc, curr) => acc + (curr.blob?.size || curr.size || 0), 0);
    } catch {
      return 0;
    }
  }

  async clearDatabase(): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("files", "readwrite");
      const store = transaction.objectStore("files");
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const fileDatabase = new FileDatabase();
export default fileDatabase;
