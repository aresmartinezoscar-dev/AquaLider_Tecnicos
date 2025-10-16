import { getConfig } from './repo.js';
import { vibrate, playAlertSound } from './util.js';

let alarmIntervals = [];

// Inicializar sistema de alarmas
// Inicializar sistema de alarmas
export async function initAlarmSystem() {
  console.log('⏰ Iniciando sistema de alarmas...');
  
  // Limpiar alarmas anteriores
  alarmIntervals.forEach(interval => clearInterval(interval));
  alarmIntervals = [];

  const config = await getConfig();
  
  if (!config.alarmasComida) return;

  // Notificar al Service Worker
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'UPDATE_ALARMS'
    });
    console.log('📤 Alarmas enviadas al Service Worker');
  }

  // Verificar cada minuto si hay que activar alarmas (backup si SW falla)
  const checkInterval = setInterval(() => {
    checkAlarms(config);
  }, 60000);

  alarmIntervals.push(checkInterval);

  // Verificar inmediatamente
  checkAlarms(config);
  
  console.log('✅ Sistema de alarmas activo');
}

// Verificar si alguna alarma debe sonar
async function checkAlarms(config) {
  const ahora = new Date();
  const horaActual = `${ahora.getHours()}:${String(ahora.getMinutes()).padStart(2, '0')}`;

  config.alarmasComida.forEach((alarma, index) => {
    if (!alarma.activa) return;

    // Convertir hora de alarma a formato 24h
    const [hora, periodo] = alarma.hora.split(' ');
    const [h, m] = hora.split(':');
    let hora24 = parseInt(h);
    if (periodo === 'PM' && hora24 !== 12) hora24 += 12;
    if (periodo === 'AM' && hora24 === 12) hora24 = 0;
    
    const horaAlarma = `${hora24}:${m}`;

    if (horaActual === horaAlarma) {
      triggerAlarm(index + 1);
    }
  });
}

// Activar alarma
function triggerAlarm(numero) {
  console.log(`🔔 Alarma ${numero} activada!`);

  // Vibrar
  vibrate([200, 100, 200, 100, 200, 100, 200]);

  // Sonido
  playAlertSound();

  // Notificación
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification('🐟 Hora de alimentar', {
      body: `Alarma ${numero}: Es hora de alimentar a los peces`,
      icon: '/acuaponia-app/public/assets/icon-192.png',
      badge: '/acuaponia-app/public/assets/icon-192.png',
      vibrate: [200, 100, 200],
      tag: `alarma-${numero}`,
      requireInteraction: true, // No desaparece automáticamente
      actions: [
        { action: 'fed', title: '✅ Ya alimenté' },
        { action: 'snooze', title: '⏰ Recordar en 5 min' }
      ]
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  // Alerta visual
  showAlarmBanner(numero);
}

// Escuchar mensajes del Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PLAY_ALARM_SOUND') {
      playAlertSound();
      vibrate([300, 100, 300, 100, 300]);
    }
  });
}

// Mostrar banner de alarma
function showAlarmBanner(numero) {
  let banner = document.getElementById('alarm-banner');
  
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'alarm-banner';
    banner.style.cssText = `
      position: fixed;
      top: 50px;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #f59e0b, #ef4444);
      color: white;
      padding: 20px;
      text-align: center;
      font-weight: 700;
      font-size: 18px;
      z-index: 2000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: pulse 1s infinite;
    `;
    document.body.appendChild(banner);

    // Añadir animación CSS
    if (!document.getElementById('alarm-animation')) {
      const style = document.createElement('style');
      style.id = 'alarm-animation';
      style.textContent = `
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  banner.innerHTML = `
    🔔 ALARMA ${numero}: ¡Hora de alimentar a los peces! 🐟
    <button onclick="document.getElementById('alarm-banner').remove()" 
            style="margin-left: 20px; padding: 8px 16px; background: white; 
                   color: #ef4444; border: none; border-radius: 8px; 
                   font-weight: 600; cursor: pointer;">
      ✓ Entendido
    </button>
  `;
}

// Re-inicializar cuando cambie la config
export async function restartAlarmSystem() {
  await initAlarmSystem();
}
