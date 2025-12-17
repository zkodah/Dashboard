// Voy a utilizar chart.js para crear un dashboard interactivo
import Chart from 'chart.js/auto';
import 'chartjs-plugin-datalabels';
import { fetchData } from '../data/dataService.js';
import { errorLogger } from '../Error/errorLogger.js';

// Función para generar colores dinámicos
function generateColor(index) {
    const colors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)',
        'rgba(83, 102, 255, 0.7)',
        'rgba(255, 99, 255, 0.7)',
        'rgba(99, 255, 132, 0.7)'
    ];
    return colors[index % colors.length];
}

// Función para inicializar el dashboard
async function initDashboard() {
    try {
        console.log('Inicializando dashboard...');
        
        const data = await fetchData();
        const ctx = document.getElementById('myChart').getContext('2d');

        // Asignar colores a cada dataset
        data.datasets.forEach((dataset, index) => {
            dataset.backgroundColor = generateColor(index);
            dataset.borderColor = generateColor(index).replace('0.7', '1');
            dataset.borderWidth = 1;
        });

        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: data.datasets
            },
            options: { 
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            boxWidth: 20,
                            padding: 10
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    title: {
                        display: true,
                        text: 'Inventario de Frutas por País de Origen'
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Frutas'
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cantidad'
                        }
                    }
                }
            }
        });
        
        console.log('Dashboard inicializado correctamente');
        
    } catch (error) {
        errorLogger.log(error, 'initDashboard');
        console.error('Error al inicializar el dashboard:', error);
        
        // Mostrar mensaje de error en el canvas
        const canvas = document.getElementById('myChart');
        const ctx = canvas.getContext('2d');
        ctx.font = '20px Arial';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.fillText('Error al cargar el gráfico', canvas.width / 2, canvas.height / 2);
        ctx.font = '14px Arial';
        ctx.fillText(error.message, canvas.width / 2, canvas.height / 2 + 30);
    }
}

// Inicializar el dashboard cuando el documento esté listo
document.addEventListener('DOMContentLoaded', initDashboard);
