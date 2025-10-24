import { saveToStore, getFromStore, getAllFromStore, getByIndex, deleteFromStore, cleanOldRecords, getDB } from './db.js';
import { defaultUserConfig } from './config.js';
import { formatDateISO } from './util.js';

// ====== CONFIGURACIÓN ======

export async function getConfig() {
  let config = await getFromStore('config', 'singleton');
  if (!config) {
    config = { id: 'singleton', ...defaultUserConfig };
    await saveConfig(config);
  }
  return config;
}

export async function saveConfig(config) {
  config.id = 'singleton';
  await saveToStore('config', config);
  return config;
}

export async function updateConfig(updates) {
  const config = await getConfig();
  const newConfig = { ...config, ...updates };
  await saveConfig(newConfig);
  return newConfig;
}

// ====== MEDICIONES ======

export async function saveMeasurement(measurement) {
  // Agregar a mediciones
  const id = await saveToStore('mediciones', measurement);

  // Agregar a cola de sincronización
  await saveToStore('sync_queue', {
    type: 'measurement',
    data: { ...measurement, id },
    synced: false,
    ts: Date.now()
  });

  // Limpiar registros antiguos
  await cleanOldRecords('mediciones');

  return id;
}

export async function getAllMeasurements() {
  return await getAllFromStore('mediciones');
}

export async function getMeasurementsByType(tipo) {
  return await getByIndex('mediciones', 'tipo', tipo);
}

export async function getLastMeasurementByType(tipo) {
  const measurements = await getMeasurementsByType(tipo);
  if (measurements.length === 0) return null;
  return measurements.sort((a, b) => b.ts - a.ts)[0];
}

export async function deleteMeasurement(id) {
  await deleteFromStore('mediciones', id);
}

// ====== COMENTARIOS ======

export async function saveComment(comment) {
  const id = await saveToStore('comentarios', comment);

  // Agregar a cola de sincronización
  await saveToStore('sync_queue', {
    type: 'comment',
    data: { ...comment, id },
    synced: false,
    ts: Date.now()
  });

  return id;
}

export async function getAllComments() {
  const comments = await getAllFromStore('comentarios');
  return comments.sort((a, b) => b.ts - a.ts);
}

export async function getCommentsByDate(fechaISO) {
  return await getByIndex('comentarios', 'fechaISO', fechaISO);
}

export async function deleteComment(id) {
  await deleteFromStore('comentarios', id);
}

// ====== COLA DE SINCRONIZACIÓN ======

export async function getPendingSync() {
  const queue = await getAllFromStore('sync_queue');
  return queue.filter(item => !item.synced);
}

export async function markAsSynced(id) {
  const item = await getFromStore('sync_queue', id);
  if (item) {
    item.synced = true;
    await saveToStore('sync_queue', item);
  }
}

export async function clearSyncedItems() {
  const queue = await getAllFromStore('sync_queue');
  const synced = queue.filter(item => item.synced);

  for (const item of synced) {
    await deleteFromStore('sync_queue', item.id);
  }

  console.log(`🗑️ Eliminados ${synced.length} items sincronizados`);
}

// ====== ÚLTIMOS VALORES ======

export async function getLastValues() {
  const types = ['ph', 'temp', 'nivel', 'conductividad', 'dureza', 'amonio', 'nitrito', 'nitrato', 'mortalidad', 'comida'];
  const lastValues = {};

  for (const tipo of types) {
    const last = await getLastMeasurementByType(tipo);
    if (last) {
      lastValues[tipo] = last;
    }
  }

  return lastValues;
}

// ====== ESTADÍSTICAS ======

export async function getMeasurementStats(tipo, days = 7) {
  const measurements = await getMeasurementsByType(tipo);
  const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
  const recent = measurements.filter(m => m.ts >= cutoffTime);

  if (recent.length === 0) return null;

  const values = recent.map(m => m.valor);
  const sum = values.reduce((a, b) => a + b, 0);

  return {
    count: recent.length,
    min: Math.min(...values),
    max: Math.max(...values),
    avg: sum / values.length,
    latest: recent[recent.length - 1]
  };

}

// ====== IMPORTAR DATOS DESDE FIREBASE ======

// ====== IMPORTAR DATOS DESDE FIREBASE ======

export async function importMeasurementsFromFirebase(firebaseMediciones) {
  if (!firebaseMediciones || typeof firebaseMediciones !== 'object') {
    console.log('⚠️ No hay mediciones para importar');
    return 0;
  }

  let imported = 0;
  const db = getDB();
  
  // Primero verificar cuántas mediciones ya existen
  const existingMeasurements = await getAllFromStore('mediciones');
  console.log(`📊 Mediciones existentes en local: ${existingMeasurements.length}`);
  
  for (const key in firebaseMediciones) {
    const medicion = firebaseMediciones[key];
    
    // Validar que tiene los campos necesarios
    if (!medicion.tipo || medicion.valor === undefined || !medicion.ts) {
      console.warn('⚠️ Medición inválida:', medicion);
      continue;
    }

    try {
      // Verificar si ya existe (por timestamp)
      const exists = existingMeasurements.some(m => m.ts === medicion.ts && m.tipo === medicion.tipo);
      
      if (exists) {
        console.log(`⏭️ Medición ya existe: ${medicion.tipo} - ${medicion.ts}`);
        continue;
      }

      // Guardar en IndexedDB sin añadir a sync_queue
      await new Promise((resolve, reject) => {
        const transaction = db.transaction(['mediciones'], 'readwrite');
        const store = transaction.objectStore('mediciones');
        const request = store.add({
          tipo: medicion.tipo,
          valor: medicion.valor,
          unidad: medicion.unidad || '',
          ts: medicion.ts,
          tendencia: medicion.tendencia || 'same'
        });
        
        request.onsuccess = () => {
          imported++;
          console.log(`✅ Importada medición ${imported}: ${medicion.tipo} = ${medicion.valor}`);
          resolve();
        };
        request.onerror = () => {
          console.error('❌ Error importando medición:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('❌ Error procesando medición:', error);
    }
  }
  
  console.log(`📥 Total importadas: ${imported} mediciones desde Firebase`);
  return imported;
}

export async function importCommentsFromFirebase(firebaseComentarios) {
  if (!firebaseComentarios || typeof firebaseComentarios !== 'object') {
    console.log('⚠️ No hay comentarios para importar');
    return 0;
  }

  let imported = 0;
  const db = getDB();
  
  const existingComments = await getAllFromStore('comentarios');
  console.log(`💬 Comentarios existentes en local: ${existingComments.length}`);
  
  for (const key in firebaseComentarios) {
    const comentario = firebaseComentarios[key];
    
    if (!comentario.texto || !comentario.ts) {
      console.warn('⚠️ Comentario inválido:', comentario);
      continue;
    }

    try {
      const exists = existingComments.some(c => c.ts === comentario.ts);
      
      if (exists) {
        console.log(`⏭️ Comentario ya existe: ${comentario.ts}`);
        continue;
      }

      await new Promise((resolve, reject) => {
        const transaction = db.transaction(['comentarios'], 'readwrite');
        const store = transaction.objectStore('comentarios');
        const request = store.add({
          texto: comentario.texto,
          fechaISO: comentario.fechaISO || formatDateISO(comentario.ts),
          ts: comentario.ts
        });
        
        request.onsuccess = () => {
          imported++;
          console.log(`✅ Importado comentario ${imported}`);
          resolve();
        };
        request.onerror = () => {
          console.error('❌ Error importando comentario:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('❌ Error procesando comentario:', error);
    }
  }
  
  console.log(`📥 Total importados: ${imported} comentarios desde Firebase`);
  return imported;
}


// AÑADIR AL INICIO del archivo, después de los imports:
let currentUserCode = null;

export function setCurrentUser(userCode) {
  currentUserCode = userCode;
  console.log('👤 Usuario actual:', userCode);
}

export function getCurrentUser() {
  return currentUserCode;
}

// ====== GESTIÓN DE USUARIOS LOCALES ======

export async function saveLocalUser(userData) {
  const user = {
    userCode: userData.userCode,
    nombreSistema: userData.nombreSistema || '',
    deviceId: userData.deviceId,
    lastAccess: Date.now()
  };
  
  await saveToStore('usuarios_locales', user);
  console.log('✅ Usuario local guardado:', user);
  return user;
}

export async function getAllLocalUsers() {
  const users = await getAllFromStore('usuarios_locales');
  return users.sort((a, b) => b.lastAccess - a.lastAccess);
}

export async function updateUserLastAccess(userCode) {
  const user = await getFromStore('usuarios_locales', userCode);
  if (user) {
    user.lastAccess = Date.now();
    await saveToStore('usuarios_locales', user);
  }
}

export async function deleteLocalUser(userCode) {
  await deleteFromStore('usuarios_locales', userCode);
  
  // También eliminar sus mediciones y comentarios
  const mediciones = await getAllFromStore('mediciones');
  for (const m of mediciones) {
    if (m.userCode === userCode) {
      await deleteFromStore('mediciones', m.id);
    }
  }
  
  const comentarios = await getAllFromStore('comentarios');
  for (const c of comentarios) {
    if (c.userCode === userCode) {
      await deleteFromStore('comentarios', c.id);
    }
  }
  
  console.log('🗑️ Usuario eliminado:', userCode);
}

// MODIFICAR saveMeasurement para incluir userCode:
export async function saveMeasurement(measurement) {
  const userCode = getCurrentUser();
  if (!userCode) {
    throw new Error('No hay usuario activo');
  }
  
  // Agregar userCode a la medición
  measurement.userCode = userCode;
  
  const id = await saveToStore('mediciones', measurement);

  // Agregar a cola de sincronización
  await saveToStore('sync_queue', {
    type: 'measurement',
    data: { ...measurement, id },
    userCode: userCode, // AÑADIR
    synced: false,
    ts: Date.now()
  });

  await cleanOldRecords('mediciones');

  return id;
}

// MODIFICAR getAllMeasurements para filtrar por usuario:
export async function getAllMeasurements() {
  const userCode = getCurrentUser();
  if (!userCode) return [];
  
  const all = await getAllFromStore('mediciones');
  return all.filter(m => m.userCode === userCode);
}

// MODIFICAR getMeasurementsByType:
export async function getMeasurementsByType(tipo) {
  const userCode = getCurrentUser();
  if (!userCode) return [];
  
  const all = await getByIndex('mediciones', 'tipo', tipo);
  return all.filter(m => m.userCode === userCode);
}

// MODIFICAR saveComment:
export async function saveComment(comment) {
  const userCode = getCurrentUser();
  if (!userCode) {
    throw new Error('No hay usuario activo');
  }
  
  comment.userCode = userCode;
  const id = await saveToStore('comentarios', comment);

  await saveToStore('sync_queue', {
    type: 'comment',
    data: { ...comment, id },
    userCode: userCode, // AÑADIR
    synced: false,
    ts: Date.now()
  });

  return id;
}

// MODIFICAR getAllComments:
export async function getAllComments() {
  const userCode = getCurrentUser();
  if (!userCode) return [];
  
  const all = await getAllFromStore('comentarios');
  const filtered = all.filter(c => c.userCode === userCode);
  return filtered.sort((a, b) => b.ts - a.ts);
}

// MODIFICAR getPendingSync:
export async function getPendingSync() {
  const userCode = getCurrentUser();
  const queue = await getAllFromStore('sync_queue');
  return queue.filter(item => !item.synced && item.userCode === userCode);
}
