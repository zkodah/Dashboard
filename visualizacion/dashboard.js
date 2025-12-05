// Voy a utilizar chart.js para crear un dashboard interactivo
import Chart from 'chart.js/auto';
import 'chartjs-plugin-datalabels';
import { fetchData } from '../data/dataService.js';

// Función para inicializar el dashboard
async function initDashboard() {
    const data = await fetchData();
    const ctx = document.getElementById('myChart').getContext('2d');

    // Generar colores dinámicos para las categorías
    const colors = [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)'
    ];

    const datasets = data.datasets.map((dataset, index) => {
        return {
            label: dataset.label,
            data: dataset.data,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length].replace('0.6', '1'),
            borderWidth: 1
        };
    });

    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels, // Frutas en el eje X
            datasets: datasets // Categorías apiladas
        },
        options: { 
            plugins: {
                datalabels: {
                    color: '#36A2EB',
                    anchor: 'end',
                    align: 'top',
                    font: {
                        weight: 'bold'
                    }
                }
            },
            responsive: true,
            scales: {
                x: {
                    stacked: true, // Barras apiladas en el eje X
                    title: {
                        display: true,
                        text: 'Frutas'
                    }
                },
                y: {
                    stacked: true, // Barras apiladas en el eje Y
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cantidad'
                    }
                }
            }
        }
    });
}

// Inicializar el dashboard cuando el documento esté listo
document.addEventListener('DOMContentLoaded', initDashboard);
