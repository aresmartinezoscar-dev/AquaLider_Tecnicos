import { formatDateTime, getParamName, getParamUnit } from './util.js';

let currentChart = null;

// Crear o actualizar gráfica
export function renderChart(canvasId, measurements, tipo, config = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error('Canvas no encontrado:', canvasId);
    return;
  }

  const ctx = canvas.getContext('2d');

  // Destruir gráfica anterior si existe
  if (currentChart) {
    currentChart.destroy();
  }

  // Preparar datos
  const sortedData = measurements
    .filter(m => m.tipo === tipo)
    .sort((a, b) => a.ts - b.ts)
    .slice(-20); // Últimos 20 registros

  if (sortedData.length === 0) {
    // Mostrar mensaje de "sin datos"
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center';
    ctx.fillText('No hay datos disponibles', canvas.width / 2, canvas.height / 2);
    return;
  }

  const labels = sortedData.map(m => formatDateTime(m.ts));
  const values = sortedData.map(m => m.valor);

  // Determinar color según tipo
const colorMap = {
    ph: '#8b5cf6',           // Púrpura
    temp: '#f59e0b',         // Naranja
    nivel: '#06b6d4',        // Cian
    conductividad: '#10b981', // Verde
    dureza: '#a855f7',       // Violeta - NUEVO
    amonio: '#ef4444',       // Rojo
    nitrito: '#f97316',      // Naranja oscuro
    nitrato: '#22c55e',      // Verde claro
    mortalidad: '#374151',   // Gris oscuro - NUEVO
    comida: '#ec4899'        // Rosa
  };

  const color = colorMap[tipo] || '#06b6d4';

  // Crear gráfica
  currentChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `${getParamName(tipo)} (${getParamUnit(tipo, config)})`,
        data: values,
        borderColor: color,
        backgroundColor: color + '20', // Transparencia
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.5,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: {
            size: 14
          },
          bodyFont: {
            size: 13
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: false
          },
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            font: {
              size: 9
            },
            autoSkip: true,
            maxTicksLimit: 6
          }
        },
        y: {
          display: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            font: {
              size: 12
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });

  console.log(`📊 Gráfica renderizada para ${tipo} con ${sortedData.length} puntos`);
}

// Destruir gráfica actual
export function destroyChart() {
  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }
}

// Obtener gráfica actual
export function getCurrentChart() {
  return currentChart;

}


