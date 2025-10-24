import { appConfig } from './config.js';

let db = null;

// Inicializar IndexedDB
export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(appConfig.DB_NAME, appConfig.DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      console.log('✅ IndexedDB inicializada');
      resolve(db);
    };

request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Store de configuraciÃ³n
      if (!db.objectStoreNames.contains('config')) {
        db.createObjectStore('config', { keyPath: 'id' });
      }

      // AÑADIR: Store de usuarios locales
      if (!db.objectStoreNames.contains('usuarios_locales')) {
        const usuariosStore = db.createObjectStore('usuarios_locales', { 
          keyPath: 'userCode'
        });
        usuariosStore.createIndex('lastAccess', 'lastAccess', { unique: false });
      }

      // Store de mediciones
      if (!db.objectStoreNames.contains('mediciones')) {
        const medicionesStore = db.createObjectStore('mediciones', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        medicionesStore.createIndex('tipo', 'tipo', { unique: false });
        medicionesStore.createIndex('ts', 'ts', { unique: false });
        medicionesStore.createIndex('tipo_ts', ['tipo', 'ts'], { unique: false });
        medicionesStore.createIndex('userCode', 'userCode', { unique: false }); // AÑADIR
      }

      // Store de comentarios
      if (!db.objectStoreNames.contains('comentarios')) {
        const comentariosStore = db.createObjectStore('comentarios', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        comentariosStore.createIndex('fechaISO', 'fechaISO', { unique: false });
        comentariosStore.createIndex('ts', 'ts', { unique: false });
        comentariosStore.createIndex('userCode', 'userCode', { unique: false }); // AÑADIR
      }

      // Store de cola de sincronizaciÃ³n
      if (!db.objectStoreNames.contains('sync_queue')) {
        const syncStore = db.createObjectStore('sync_queue', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        syncStore.createIndex('synced', 'synced', { unique: false });
        syncStore.createIndex('ts', 'ts', { unique: false });
        syncStore.createIndex('userCode', 'userCode', { unique: false }); // AÑADIR
      }

      console.log('✅ Stores de IndexedDB creadas');
    };
  });
}

// Obtener el objeto de base de datos
export function getDB() {
  if (!db) {
    throw new Error('Database no inicializada. Llama a initDB() primero.');
  }
  return db;
}

// Guardar en store
export async function saveToStore(storeName, data) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Obtener de store por ID
export async function getFromStore(storeName, id) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Obtener todos los registros de un store
export async function getAllFromStore(storeName) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Obtener registros por índice
export async function getByIndex(storeName, indexName, value) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Eliminar de store
export async function deleteFromStore(storeName, id) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Limpiar registros antiguos (retención de 30 días)
export async function cleanOldRecords(storeName) {
  const db = getDB();
  const retentionMs = appConfig.RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const cutoffTime = Date.now() - retentionMs;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const index = store.index('ts');
    const request = index.openCursor();

    let deletedCount = 0;

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.ts < cutoffTime) {
          cursor.delete();
          deletedCount++;
        }
        cursor.continue();
      } else {
        console.log(`🗑️ Eliminados ${deletedCount} registros antiguos de ${storeName}`);
        resolve(deletedCount);
      }
    };

    request.onerror = () => reject(request.error);
  });

}
