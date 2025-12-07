import Chart from 'chart.js/auto';
import { ChoroplethController, GeoFeature, ColorScale, ProjectionScale } from 'chartjs-chart-geo';
import { fetchDataForChoropleth } from '../data/dataService.js';
import { errorLogger } from '../Error/errorLogger.js';

// Registrar el controlador de Choropleth
Chart.register(ChoroplethController, GeoFeature, ColorScale, ProjectionScale);

// Mapeo de nombres de países del CSV a nombres ISO
const countryNameMapping = {
    'Chile': 'Chile',
    'Ecuador': 'Ecuador',
    'Brasil': 'Brazil',
    'Argentina': 'Argentina',
    'España': 'Spain',
    'Nueva Zelanda': 'New Zealand',
    'India': 'India',
    'México': 'Mexico',
    'Perú': 'Peru',
    'Costa Rica': 'Costa Rica',
    'Canadá': 'Canada',
    'Estados Unidos': 'United States of America',
    'Colombia': 'Colombia',
    'Venezuela': 'Venezuela',
    'Uruguay': 'Uruguay',
    'Paraguay': 'Paraguay',
    'Bolivia': 'Bolivia',
    'Panamá': 'Panama',
    'Nicaragua': 'Nicaragua',
    'Honduras': 'Honduras',
    'Guatemala': 'Guatemala',
    'El Salvador': 'El Salvador',
    'Bélgica': 'Belgium',
    'Francia': 'France',
    'Alemania': 'Germany',
    'Italia': 'Italy',
    'Portugal': 'Portugal',
    'Grecia': 'Greece',
    'Marruecos': 'Morocco',
    'Egipto': 'Egypt',
    'Sudáfrica': 'South Africa',
    'Australia': 'Australia',
    'Japón': 'Japan',
    'China': 'China',
    'Corea del Sur': 'South Korea',
    'Tailandia': 'Thailand',
    'Vietnam': 'Vietnam',
    'Filipinas': 'Philippines',
    'Indonesia': 'Indonesia',
    'Malasia': 'Malaysia',
    'Singapur': 'Singapore',
    'Hong Kong': 'Hong Kong',
    'Taiwán': 'Taiwan',
    'Israel': 'Israel',
    'Jordania': 'Jordan',
    'Líbano': 'Lebanon',
    'Emiratos Árabes Unidos': 'United Arab Emirates',
    'Qatar': 'Qatar',
    'Kuwait': 'Kuwait',
    'Baréin': 'Bahrain',
    'Omán': 'Oman',
    'Yemen': 'Yemen',
    'Irak': 'Iraq',
    'Irán': 'Iran',
    'Siria': 'Syria',
    'Turquía': 'Turkey'
};

async function initChoropleth() {
    try {
        console.log('Inicializando gráfico Choropleth...');
        
        // Obtener datos agrupados por país
        const countryData = await fetchDataForChoropleth();
        
        // Cargar datos geográficos (TopoJSON)
        const worldResponse = await fetch('https://unpkg.com/world-atlas@2/countries-50m.json');
        if (!worldResponse.ok) {
            throw new Error('No se pudo cargar el mapa mundial');
        }
        const world = await worldResponse.json();
        
        // Convertir TopoJSON a GeoJSON
        const countries = topojson.feature(world, world.objects.countries).features;
        
        console.log('Países disponibles en el mapa:', countries.length);
        
        // Preparar datos para el gráfico
        const chartData = countries.map(country => {
            const countryName = country.properties.name;
            let value = 0;
            
            for (const [csvCountry, quantity] of Object.entries(countryData)) {
                const mappedName = countryNameMapping[csvCountry];
                if (mappedName === countryName || csvCountry === countryName) {
                    value = quantity;
                    break;
                }
            }
            
            return {
                feature: country,
                value: value
            };
        });
        
        console.log('Datos preparados para el mapa:', chartData.filter(d => d.value > 0).length, 'países con datos');
        
        const canvas = document.getElementById('choroplethChart');
        const ctx = canvas.getContext('2d');
        
        // Establecer tamaño fijo del canvas
        canvas.style.height = '400px';
        canvas.style.width = '100%';
        
        const chart = new Chart(ctx, {
            type: 'choropleth',
            data: {
                labels: countries.map(d => d.properties.name),
                datasets: [{
                    label: 'Cantidad de Frutas por País de Origen',
                    data: chartData,
                    backgroundColor: (context) => {
                        const value = context.raw?.value || 0;
                        if (value === 0) return 'rgba(200, 200, 200, 0.3)';
                        const alpha = Math.min(value / 500, 1);
                        return `rgba(54, 162, 235, ${alpha})`;
                    },
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                    borderWidth: 0.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.raw.feature.properties.name;
                                const value = context.raw.value || 0;
                                return `${label}: ${value} unidades`;
                            }
                        }
                    }
                },
                scales: {
                    projection: {
                        axis: 'x',
                        projection: 'equalEarth'
                    }
                },
                layout: {
                    padding: 10
                }
            }
        });
        
        console.log('Gráfico Choropleth inicializado correctamente');
        
    } catch (error) {
        errorLogger.log(error, 'initChoropleth');
        console.error('Error al inicializar el gráfico Choropleth:', error);
        
        const canvas = document.getElementById('choroplethChart');
        const ctx = canvas.getContext('2d');
        ctx.font = '20px Arial';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.fillText('Error al cargar el mapa', canvas.width / 2, canvas.height / 2);
        ctx.font = '14px Arial';
        ctx.fillText(error.message, canvas.width / 2, canvas.height / 2 + 30);
    }
}

document.addEventListener('DOMContentLoaded', initChoropleth);