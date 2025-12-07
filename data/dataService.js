// dataService.js
import Papa from 'papaparse';
import { errorLogger } from '../Error/errorLogger.js';

export async function fetchData() {
    try {
        const response = await fetch('./data/data.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        
        if (parsed.errors.length > 0) {
            errorLogger.log(new Error('Errores al parsear CSV'), 'CSV Parsing');
            console.warn('Errores de parseo:', parsed.errors);
        }
        
        let data = parsed.data;

        // Normalizar las claves de los objetos
        data = data.map(item => {
            const normalizedItem = {};
            Object.keys(item).forEach(key => {
                const normalizedKey = key.trim().replace('# ', '');
                normalizedItem[normalizedKey] = item[key];
            });
            return normalizedItem;
        });

        console.log('Primeros datos procesados (normalizados):', data.slice(0, 5));

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
            datasets: datasets,
            rawData: data
        };
    } catch (error) {
        errorLogger.log(error, 'fetchData');
        throw error;
    }
}

export async function fetchDataForChoropleth() {
    try {
        const response = await fetch('./data/data.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        let data = parsed.data;

        // Normalizar las claves
        data = data.map(item => {
            const normalizedItem = {};
            Object.keys(item).forEach(key => {
                const normalizedKey = key.trim().replace('# ', '');
                normalizedItem[normalizedKey] = item[key];
            });
            return normalizedItem;
        });

        // Agrupar cantidades por país de origen
        const countryData = {};
        data.forEach(item => {
            if (item.Origen && item.Cantidad) {
                const pais = item.Origen.trim();
                const cantidad = parseInt(item.Cantidad) || 0;
                countryData[pais] = (countryData[pais] || 0) + cantidad;
            }
        });

        console.log('Datos por país:', countryData);

        return countryData;
    } catch (error) {
        errorLogger.log(error, 'fetchDataForChoropleth');
        throw error;
    }
}