import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getDatabase, ref, set, push, get, update } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';
import { firebaseConfig } from './config.js';
import { getPendingSync, markAsSynced, clearSyncedItems } from './repo.js';

let firebaseApp = null;
let database = null;
let isInitialized = false;

// Inicializar Firebase
export function initFirebase() {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    database = getDatabase(firebaseApp);
    isInitialized = true;
    console.log('✅ Firebase inicializado');
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar Firebase:', error);
    return false;
  }
}

// Verificar si Firebase está inicializado
export function isFirebaseReady() {
  return isInitialized;
}

// Sincronizar configuración del usuario
export async function syncUserConfig(config) {
  if (!isInitialized) {
    console.warn('Firebase no inicializado');
    return false;
  }

  try {
    const userRef = ref(database, `usuarios/${config.userCode}`);
    
    const snapshot = await get(userRef);
    
    const userData = {
      nombreSistema: config.nombreSistema,
      unidadComida: config.unidadComida,
      parametrosActivos: config.parametrosActivos, // AÑADIR ESTO
      terminosAceptadosTs: config.terminosAceptadosTs, // AÑADIR ESTO
      umbrales: {
        phMin: config.umbralPhMin,
        phMax: config.umbralPhMax,
        condMin: config.umbralCondMin,
        condMax: config.umbralCondMax,
        amonioMin: config.umbralAmonioMin,
        amonioMax: config.umbralAmonioMax,
        nitritoMin: config.umbralNitritoMin,
        nitritoMax: config.umbralNitritoMax,
        nitratoMin: config.umbralNitratoMin,
        nitratoMax: config.umbralNitratoMax
      },
      nivel: {
        min: config.minNivel,
        max: config.maxNivel
      },
      updatedAt: Date.now()
    };
    
    if (!snapshot.exists()) {
      // Crear usuario nuevo
      await set(userRef, {
        createdAt: Date.now(),
        deviceId: config.deviceId,
        ...userData
      });
      console.log('✅ Usuario creado en Firebase');
    } else {
      // Actualizar usuario existente
      await update(userRef, userData);
      console.log('✅ Usuario actualizado en Firebase');
    }

    return true;
  } catch (error) {
    console.error('❌ Error al sincronizar configuración:', error);
    return false;
  }
}

// Sincronizar mediciones pendientes
export async function syncMeasurements(userCode) {
  if (!isInitialized) {
    console.warn('Firebase no inicializado');
    return { success: false, synced: 0 };
  }

  try {
    const pending = await getPendingSync();
    const measurements = pending.filter(item => item.type === 'measurement');

    if (measurements.length === 0) {
      console.log('✅ No hay mediciones pendientes');
      return { success: true, synced: 0 };
    }

    console.log(`🔄 Sincronizando ${measurements.length} mediciones...`);

    const medicionesRef = ref(database, `usuarios/${userCode}/mediciones`);

    for (const item of measurements) {
      const newMeasurementRef = push(medicionesRef);
      await set(newMeasurementRef, {
        tipo: item.data.tipo,
        valor: item.data.valor,
        unidad: item.data.unidad,
        ts: item.data.ts,
        tendencia: item.data.tendencia
      });

      // Marcar como sincronizado
      await markAsSynced(item.id);
    }

    // Limpiar items sincronizados
    await clearSyncedItems();

    console.log(`✅ ${measurements.length} mediciones sincronizadas`);
    return { success: true, synced: measurements.length };
  } catch (error) {
    console.error('❌ Error al sincronizar mediciones:', error);
    return { success: false, synced: 0, error: error.message };
  }
}

// Sincronizar comentarios pendientes
export async function syncComments(userCode) {
  if (!isInitialized) {
    console.warn('Firebase no inicializado');
    return { success: false, synced: 0 };
  }

  try {
    const pending = await getPendingSync();
    const comments = pending.filter(item => item.type === 'comment');

    if (comments.length === 0) {
      console.log('✅ No hay comentarios pendientes');
      return { success: true, synced: 0 };
    }

    console.log(`🔄 Sincronizando ${comments.length} comentarios...`);

    const comentariosRef = ref(database, `usuarios/${userCode}/comentarios`);

    for (const item of comments) {
      const newCommentRef = push(comentariosRef);
      await set(newCommentRef, {
        texto: item.data.texto,
        fechaISO: item.data.fechaISO,
        ts: item.data.ts
      });

      // Marcar como sincronizado
      await markAsSynced(item.id);
    }

    // Limpiar items sincronizados
    await clearSyncedItems();

    console.log(`✅ ${comments.length} comentarios sincronizados`);
    return { success: true, synced: comments.length };
  } catch (error) {
    console.error('❌ Error al sincronizar comentarios:', error);
    return { success: false, synced: 0, error: error.message };
  }
}

let isSyncing = false; // Variable de control

export async function syncAll(config) {
  // Prevenir sincronización simultánea
  if (isSyncing) {
    console.warn('⚠️ Sincronización ya en proceso');
    return { success: false, message: 'Sincronización en proceso' };
  }

  if (!navigator.onLine) {
    console.warn('⚠️ Sin conexión a internet');
    return { success: false, message: 'Sin conexión' };
  }

  if (!isInitialized) {
    initFirebase();
  }

  isSyncing = true; // Marcar como sincronizando

  try {
    // Sincronizar configuración
    await syncUserConfig(config);

    // Sincronizar mediciones
    const measurementsResult = await syncMeasurements(config.userCode);

    // Sincronizar comentarios
    const commentsResult = await syncComments(config.userCode);

    const totalSynced = measurementsResult.synced + commentsResult.synced;

    return {
      success: true,
      synced: totalSynced,
      message: totalSynced > 0 ? `${totalSynced} registros sincronizados` : 'Todo actualizado'
    };
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    return {
      success: false,
      message: 'Error al sincronizar',
      error: error.message
    };
  } finally {
    isSyncing = false; // Liberar cuando termine
  }
}

// Descargar datos desde Firebase (opcional)
export async function downloadFromFirebase(userCode) {
  if (!isInitialized) {
    console.warn('Firebase no inicializado');
    return null;
  }

  try {
    const userRef = ref(database, `usuarios/${userCode}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log('Usuario no encontrado en Firebase');
      return null;
    }
  } catch (error) {
    console.error('❌ Error al descargar datos:', error);
    return null;
  }

}

