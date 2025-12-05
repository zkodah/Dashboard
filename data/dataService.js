// dataService.js
import Papa from 'papaparse';

export async function fetchData() {
    const response = await fetch('./data/data.csv'); // Ajuste de la ruta
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    let data = parsed.data;

    // Normalizar las claves de los objetos
    data = data.map(item => {
        const normalizedItem = {};
        Object.keys(item).forEach(key => {
            const normalizedKey = key.trim().replace('# ', ''); // Eliminar caracteres adicionales
            normalizedItem[normalizedKey] = item[key];
        });
        return normalizedItem;
    });

    console.log('Primeros datos procesados (normalizados):', data.slice(0, 5)); // Depuración

    // Procesar datos para stacked bar chart
    const frutas = [...new Set(data.map(item => item.Nombre).filter(nombre => nombre))];
    const paises = [...new Set(data.map(item => item.Origen).filter(pais => pais))];

    const datasets = paises.map(pais => {
        const dataPorPais = frutas.map(fruta => {
            return data.filter(item => item.Nombre === fruta && item.Origen === pais)
                       .reduce((sum, item) => sum + (parseInt(item.Cantidad) || 0), 0);
        });
        return {
            label: pais,
            data: dataPorPais
        };
    });

    return {
        labels: frutas,
        datasets: datasets
    };
}