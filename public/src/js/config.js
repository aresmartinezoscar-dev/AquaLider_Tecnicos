// Configuración de Firebase - YA CON TUS DATOS
export const firebaseConfig = {
  apiKey: "AIzaSyBjrdC_rXBuqPlfsvJWit0jkNcNUCrAD_M",
  authDomain: "app-datos-acuoponia.firebaseapp.com",
  databaseURL: "https://app-datos-acuoponia-default-rtdb.firebaseio.com",
  projectId: "app-datos-acuoponia",
  storageBucket: "app-datos-acuoponia.firebasestorage.app",
  messagingSenderId: "506745515147",
  appId: "1:506745515147:web:c6672360bd01b2b454f88e"
};

// Configuración de la aplicación
export const appConfig = {
  DB_NAME: 'acuaponia_db',
  DB_VERSION: 1,
  RETENTION_DAYS: 30,
  SYNC_INTERVAL: 60000, // 1 minuto
  MAX_RETRIES: 3
};

// Configuración por defecto del usuario
export const defaultUserConfig = {
  userCode: '',
  deviceId: '',
  nombreSistema: '',
  unidadComida: 'g',
  umbralPhMin: 5.5,
  umbralPhMax: 8.0,
  umbralCondMin: 0,
  umbralCondMax: 600,
  umbralAmonioMin: 0,
  umbralAmonioMax: 1,
  umbralNitritoMin: 0,
  umbralNitritoMax: 1,
  umbralNitratoMin: 0,
  umbralNitratoMax: 160,
  minNivel: 10,
  maxNivel: 50,
  parametrosActivos: {
    ph: true,
    temp: false,           // Oculto por defecto
    nivel: false,          // Oculto por defecto
    conductividad: false,  // Oculto por defecto
    dureza: false,         // Oculto por defecto
    amonio: true,
    nitrito: true,
    nitrato: true,
    mortalidad: true,      // Nuevo parámetro obligatorio
    comida: true
  // alarmasComida: [
  //   { activa: false, hora: '7:45 AM' },
  //   { activa: false, hora: '10:45 AM' },
  //   { activa: false, hora: '1:45 PM' },
  //   { activa: false, hora: '3:45 PM' }
  // 
  },
  modoOscuro: false,
  terminosAceptados: false, // ASEGÚRATE QUE ESTÁ AQUÍ
  terminosAceptadosTs: null // AÑADIR ESTO

};


