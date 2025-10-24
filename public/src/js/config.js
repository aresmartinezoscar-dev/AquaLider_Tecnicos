// ConfiguraciÃ³n de Firebase - YA CON TUS DATOS
export const firebaseConfig = {
  apiKey: "AIzaSyBjrdC_rXBuqPlfsvJWit0jkNcNUCrAD_M",
  authDomain: "app-datos-acuoponia.firebaseapp.com",
  databaseURL: "https://app-datos-acuoponia-default-rtdb.firebaseio.com",
  projectId: "app-datos-acuoponia",
  storageBucket: "app-datos-acuoponia.firebasestorage.app",
  messagingSenderId: "506745515147",
  appId: "1:506745515147:web:c6672360bd01b2b454f88e"
};

// ConfiguraciÃ³n de la aplicaciÃ³n
export const appConfig = {
  DB_NAME: 'acuaponia_db',
  DB_VERSION: 2, // CAMBIAR DE 1 A 2 para actualizar esquema
  RETENTION_DAYS: 30,
  SYNC_INTERVAL: 60000,
  MAX_RETRIES: 3
};

// ConfiguraciÃ³n por defecto del usuario
export const defaultUserConfig = {
  userCode: '',
  deviceId: '',
  nombreSistema: '',
  unidadComida: 'g',
  umbralPhMin: 5.5,
  umbralPhMax: 8.0,
  umbralCondMin: 0.05,
  umbralCondMax: 3.0,
  umbralAmonioMin: 0,
  umbralAmonioMax: 0.5,
  umbralNitritoMin: 0,
  umbralNitritoMax: 0.2,
  umbralNitratoMin: 5,
  umbralNitratoMax: 150,
  minNivel: 10,
  maxNivel: 50,
  
  parametrosActivos: {
    ph: true,
    temp: false,
    nivel: false,
    conductividad: false,
    dureza: false,
    amonio: true,
    nitrito: true,
    nitrato: true,
    mortalidad: true,
    comida: true
  },
  
  modoOscuro: false,
  terminosAceptados: false,
  terminosAceptadosTs: null,
  
  alarmasComida: [
    { activa: false, hora: '7:45 AM' },
    { activa: false, hora: '10:45 AM' },
    { activa: false, hora: '1:45 PM' },
    { activa: false, hora: '3:45 PM' }
  ]
};
