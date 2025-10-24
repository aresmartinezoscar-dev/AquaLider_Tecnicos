// Generar UUID v4
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Formatear fecha
export function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Formatear fecha y hora (formato compacto para gráficas)
export function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.toLocaleString('es-CO', { month: 'short' }).toUpperCase().slice(0, 3);
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}\n${hour}:${minute}`;
}

// Formatear fecha ISO (YYYY-MM-DD)
export function formatDateISO(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calcular tendencia
export function calculateTrend(currentValue, previousValue) {
  if (previousValue === null || previousValue === undefined) {
    return 'same';
  }
  if (currentValue > previousValue) return 'up';
  if (currentValue < previousValue) return 'down';
  return 'same';
}

// Obtener icono de tendencia
export function getTrendIcon(tendencia) {
  if (tendencia === 'up') {
    return '↑';
  } else if (tendencia === 'down') {
    return '↓';
  }
  return '→';
}

// Obtener color de tendencia
export function getTrendColor(tendencia) {
  if (tendencia === 'up') return '#ef4444'; // rojo
  if (tendencia === 'down') return '#3b82f6'; // azul
  return '#6b7280'; // gris
}

// Obtener nombre del parámetro
export function getParamName(tipo) {
  const names = {
    ph: 'pH',
    temp: 'Temperatura',
    nivel: 'Nivel de agua',
    conductividad: 'C. Eléctrica',
    dureza: 'Dureza',           // NUEVO
    amonio: 'Amonio (NAT)',
    nitrito: 'Nitrito (NO2)',
    nitrato: 'Nitrato (NO3)',
    mortalidad: 'Mortalidad',   // NUEVO
    comida: 'Comida'
  };
  return names[tipo] || tipo;
}

// Obtener unidad del parámetro
export function getParamUnit(tipo, config = {}) {
  const units = {
    ph: '',
    temp: '°C',
    nivel: 'cm',
    conductividad: 'S/m',
    dureza: 'ppm',           // NUEVO
    amonio: 'ppm',
    nitrito: 'ppm',
    nitrato: 'ppm',
    mortalidad: 'peces',     // NUEVO
    comida: config.unidadComida || 'g'
  };
  return units[tipo] || '';
}

// Validar que hay conexión a internet
export function isOnline() {
  return navigator.onLine;
}

// Vibrar dispositivo
export function vibrate(pattern = [80, 40, 80]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

// Reproducir sonido de alerta
export function playAlertSound() {
  try {
    // Audio simple generado (beep)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // Frecuencia en Hz
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn('No se pudo reproducir el sonido:', error);
  }
}

// Exportar datos a CSV
export function exportToCSV(data, filename) {
  if (data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      // Escapar valores que contengan comas
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Debounce para eventos frecuentes
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };

}


