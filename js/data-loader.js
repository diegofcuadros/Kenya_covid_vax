/**
 * data-loader.js
 * Utilities for loading and processing data for the Kenya COVID-19 Vaccination Coverage website
 */

// Global data objects
let countyData = {};
let clusterData = {};
let developmentIndexData = {};
let environmentalData = {};

/**
 * Load all required data files
 * @returns {Promise} Promise that resolves when all data is loaded
 */
async function loadAllData() {
    try {
        // Load county data including vaccination rates
        const vaccinationData = await loadJSON('data/vaccination-rates.json');
        
        // Load GeoJSON for Kenya counties
        const countiesGeoJSON = await loadJSON('data/kenya-counties.geojson');
        
        // Load cluster assignments
        const clusterData = await loadJSON('data/clusters.json');
        
        // Load Development Index data
        const developmentData = await loadJSON('data/development-index.json');
        
        // Process and merge the data
        processCountyData(vaccinationData, countiesGeoJSON, clusterData, developmentData);
        
        // Return true when all data is loaded and processed
        return true;
    } catch (error) {
        console.error('Error loading data:', error);
        return false;
    }
}

/**
 * Load a JSON file
 * @param {string} url - URL of the JSON file to load
 * @returns {Promise} Promise that resolves with the JSON data
 */
async function loadJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error loading ${url}:`, error);
        throw error;
    }
}

/**
 * Process and merge county data from different sources
 * @param {Object} vaccinationData - Vaccination rate data by county
 * @param {Object} countiesGeoJSON - GeoJSON data for Kenya counties
 * @param {Object} clusterData - Cluster assignments by county
 * @param {Object} developmentData - Development Index data by county
 */
function processCountyData(vaccinationData, countiesGeoJSON, clusterData, developmentData) {
    // Store the raw data
    countyData = vaccinationData;
    
    // Add data to GeoJSON features
    countiesGeoJSON.features.forEach(feature => {
        const countyId = feature.properties.county_id;
        
        if (vaccinationData[countyId]) {
            // Add vaccination data
            feature.properties.vaccination_rate = vaccinationData[countyId].vaccination_rate;
            feature.properties.vaccination_rate_category = getVaccinationRateCategory(vaccinationData[countyId].vaccination_rate);
            
            // Add development index data
            if (developmentData[countyId]) {
                feature.properties.development_index = developmentData[countyId].development_index;
                feature.properties.development_index_category = getDevelopmentIndexCategory(developmentData[countyId].development_index);
                feature.properties.bank_access = developmentData[countyId].bank_access;
                feature.properties.sleeping_rooms_per_person = developmentData[countyId].sleeping_rooms_per_person;
                feature.properties.child_ratio = developmentData[countyId].child_ratio;
                feature.properties.child_immunization = developmentData[countyId].child_immunization;
            }
            
            // Add cluster data
            if (clusterData[countyId]) {
                feature.properties.cluster = clusterData[countyId].cluster;
                feature.properties.cluster_category = clusterData[countyId].cluster.toString();
                feature.properties.cluster_name = getClusterName(clusterData[countyId].cluster);
            }
            
            // Add environmental data
            feature.properties.no2_level = vaccinationData[countyId].no2_level;
            feature.properties.precipitation = vaccinationData[countyId].precipitation;
            feature.properties.altitude = vaccinationData[countyId].altitude;
        }
    });
    
    // Store processed GeoJSON
    return countiesGeoJSON;
}

/**
 * Get category for vaccination rate
 * @param {number} rate - Vaccination rate percentage
 * @returns {string} Category string for the rate
 */
function getVaccinationRateCategory(rate) {
    if (rate < 5) return '0-5';
    if (rate < 10) return '5-10';
    if (rate < 15) return '10-15';
    if (rate < 20) return '15-20';
    if (rate < 25) return '20-25';
    if (rate < 30) return '25-30';
    if (rate < 35) return '30-35';
    if (rate < 40) return '35-40';
    if (rate < 45) return '40-45';
    if (rate < 50) return '45-50';
    return '50+';
}

/**
 * Get category for Development Index
 * @param {number} index - Development Index value (0-100)
 * @returns {string} Category string for the index
 */
function getDevelopmentIndexCategory(index) {
    if (index < 10) return 'very-low';
    if (index < 20) return 'low';
    if (index < 30) return 'low-med';
    if (index < 40) return 'medium';
    if (index < 50) return 'med-high';
    if (index < 60) return 'high';
    if (index < 80) return 'very-high';
    return 'highest';
}

/**
 * Get human-readable name for cluster number
 * @param {number} cluster - Cluster ID (0-6)
 * @returns {string} Human-readable cluster name
 */
function getClusterName(cluster) {
    switch(parseInt(cluster)) {
        case 0: return 'Urban Mixed';
        case 1: return 'Rural Dev';
        case 2: return 'Rural Trans';
        case 3: return 'Peri-urban';
        case 4: return 'Semi-urban';
        case 5: return 'Rural Remote';
        case 6: return 'Urban High-Dev';
        default: return 'Unknown';
    }
}

/**
 * Filter counties by vaccination rate threshold
 * @param {number} minRate - Minimum vaccination rate threshold
 * @returns {Array} Array of county IDs that meet the threshold
 */
function filterCountiesByVaccinationRate(minRate) {
    const filteredIds = [];
    
    for (const countyId in countyData) {
        if (countyData[countyId].vaccination_rate >= minRate) {
            filteredIds.push(countyId);
        }
    }
    
    return filteredIds;
}

/**
 * Filter counties by Development Index threshold
 * @param {number} minIndex - Minimum Development Index threshold
 * @returns {Array} Array of county IDs that meet the threshold
 */
function filterCountiesByDevelopmentIndex(minIndex) {
    const filteredIds = [];
    
    for (const countyId in countyData) {
        if (countyData[countyId].development_index >= minIndex) {
            filteredIds.push(countyId);
        }
    }
    
    return filteredIds;
}

/**
 * Filter counties by cluster type
 * @param {number} clusterType - Cluster ID to filter by
 * @returns {Array} Array of county IDs in the specified cluster
 */
function filterCountiesByCluster(clusterType) {
    const filteredIds = [];
    
    for (const countyId in countyData) {
        if (countyData[countyId].cluster === clusterType) {
            filteredIds.push(countyId);
        }
    }
    
    return filteredIds;
}

/**
 * Calculate summary statistics for a set of counties
 * @param {Array} countyIds - Array of county IDs to include
 * @returns {Object} Object containing summary statistics
 */
function calculateCountyStats(countyIds) {
    // Initialize stats object
    const stats = {
        count: countyIds.length,
        averageVaccinationRate: 0,
        averageDevelopmentIndex: 0,
        clusterCounts: {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0},
        dominantCluster: null,
        highestVaccinationRate: 0,
        lowestVaccinationRate: 100,
        highestVaccinationCounty: null,
        lowestVaccinationCounty: null
    };
    
    // Return empty stats if no counties
    if (countyIds.length === 0) {
        return stats;
    }
    
    // Calculate totals and extremes
    let totalVaccinationRate = 0;
    let totalDevelopmentIndex = 0;
    
    countyIds.forEach(id => {
        const county = countyData[id];
        if (!county) return;
        
        // Add to totals
        totalVaccinationRate += county.vaccination_rate;
        totalDevelopmentIndex += county.development_index;
        
        // Update cluster counts
        if (county.cluster !== undefined) {
            stats.clusterCounts[county.cluster]++;
        }
        
        // Track highest and lowest vaccination rates
        if (county.vaccination_rate > stats.highestVaccinationRate) {
            stats.highestVaccinationRate = county.vaccination_rate;
            stats.highestVaccinationCounty = id;
        }
        
        if (county.vaccination_rate < stats.lowestVaccinationRate) {
            stats.lowestVaccinationRate = county.vaccination_rate;
            stats.lowestVaccinationCounty = id;
        }
    });
    
    // Calculate averages
    stats.averageVaccinationRate = totalVaccinationRate / countyIds.length;
    stats.averageDevelopmentIndex = totalDevelopmentIndex / countyIds.length;
    
    // Find dominant cluster
    let maxCount = 0;
    Object.keys(stats.clusterCounts).forEach(cluster => {
        if (stats.clusterCounts[cluster] > maxCount) {
            maxCount = stats.clusterCounts[cluster];
            stats.dominantCluster = parseInt(cluster);
        }
    });
    
    return stats;
}

/**
 * Get counties sorted by a specific metric
 * @param {string} metric - Metric to sort by (e.g., 'vaccination_rate', 'development_index')
 * @param {boolean} ascending - Sort in ascending order if true, descending if false
 * @param {number} limit - Maximum number of counties to return (0 for all)
 * @returns {Array} Array of county IDs sorted by the metric
 */
function getCountiesSortedBy(metric, ascending = false, limit = 0) {
    // Create array of county IDs
    const countyIds = Object.keys(countyData);
    
    // Sort by the specified metric
    countyIds.sort((a, b) => {
        const valueA = countyData[a][metric] || 0;
        const valueB = countyData[b][metric] || 0;
        
        return ascending ? valueA - valueB : valueB - valueA;
    });
    
    // Apply limit if specified
    if (limit > 0 && limit < countyIds.length) {
        return countyIds.slice(0, limit);
    }
    
    return countyIds;
}

// Export functions for use in other scripts
// Note: In a module-based setup, you would use proper ES6 exports instead
window.dataLoader = {
    loadAllData,
    loadJSON,
    processCountyData,
    getVaccinationRateCategory,
    getDevelopmentIndexCategory,
    getClusterName,
    filterCountiesByVaccinationRate,
    filterCountiesByDevelopmentIndex,
    filterCountiesByCluster,
    calculateCountyStats,
    getCountiesSortedBy
};
