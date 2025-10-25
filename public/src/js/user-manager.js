// Gestión de múltiples usuarios en el dispositivo

const USERS_STORAGE_KEY = 'acualider_users_list';

// Obtener lista de usuarios del dispositivo
export function getUsersList() {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error al leer lista de usuarios:', error);
    return [];
  }
}

// Guardar lista de usuarios
function saveUsersList(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Añadir usuario a la lista
export function addUserToList(userCode, nombreSistema) {
  const users = getUsersList();
  
  // Verificar si ya existe
  const exists = users.find(u => u.userCode === userCode);
  if (exists) {
    // Actualizar nombre si cambió
    exists.nombreSistema = nombreSistema;
    exists.lastAccess = Date.now();
  } else {
    // Añadir nuevo
    users.push({
      userCode,
      nombreSistema: nombreSistema || userCode,
      addedAt: Date.now(),
      lastAccess: Date.now()
    });
  }
  
  // Ordenar por último acceso
  users.sort((a, b) => b.lastAccess - a.lastAccess);
  
  saveUsersList(users);
  console.log('✅ Usuario añadido a la lista:', userCode);
}

// Actualizar último acceso
export function updateLastAccess(userCode) {
  const users = getUsersList();
  const user = users.find(u => u.userCode === userCode);
  
  if (user) {
    user.lastAccess = Date.now();
    saveUsersList(users);
  }
}

// Eliminar usuario de la lista
export function removeUserFromList(userCode) {
  const users = getUsersList();
  const filtered = users.filter(u => u.userCode !== userCode);
  saveUsersList(filtered);
  console.log('🗑️ Usuario eliminado de la lista:', userCode);
}

// Obtener usuario actual
export function getCurrentUser() {
  return {
    userCode: localStorage.getItem('current_user_code'),
    nombreSistema: localStorage.getItem('current_user_name')
  };
}

// Establecer usuario actual
export function setCurrentUser(userCode, nombreSistema) {
  localStorage.setItem('current_user_code', userCode);
  localStorage.setItem('current_user_name', nombreSistema || '');
  updateLastAccess(userCode);
}
