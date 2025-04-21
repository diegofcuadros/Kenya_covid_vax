// Set up Mapbox access token
// This approach works with Netlify environment variables
mapboxgl.accessToken = 'pk.eyJ1IjoieW91ci1tYXBib3gtdXNlcm5hbWUiLCJhIjoieW91ci1tYXBib3gtdG9rZW4ifQ.your-mapbox-signature';

// Global variables
let map;
let hoveredCountyId = null;
let activeLayer = 'vaccination';
let countyData = {};
let tooltip = document.getElementById('map-tooltip');

// Initialize map when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadCountyData();
    setupEventListeners();
});

// Initialize the Mapbox map
function initializeMap() {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11', // Light theme
        center: [37.8, 0.5], // Center on Kenya
        zoom: 5.5,
        minZoom: 5,
        maxZoom: 12,
        maxBounds: [
            [32.5, -5], // Southwest coordinates
            [42.5, 5.5]  // Northeast coordinates
        ]
    });

    // Add zoom and rotation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add fullscreen control
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Check if dark mode is enabled and apply the appropriate map style
    if (document.body.classList.contains('dark-theme')) {
        map.setStyle('mapbox://styles/mapbox/dark-v11');
    }

    // Map load event
    map.on('load', function() {
        // Wait for map style to load completely
        setupMapLayers();
    });
}

// Setup map layers and sources
function setupMapLayers() {
    // Add source for Kenya counties
    map.addSource('kenya-counties', {
        type: 'geojson',
        data: 'data/kenya-counties.geojson',
        generateId: true
    });

    // Add vaccination rate layer
    map.addLayer({
        id: 'vaccination-layer',
        type: 'fill',
        source: 'kenya-counties',
        layout: {},
        paint: {
            'fill-color': [
                'match',
                ['get', 'vaccination_rate_category'],
                '0-5', '#67001f',
                '5-10', '#b2182b',
                '10-15', '#d6604d',
                '15-20', '#f4a582',
                '20-25', '#fddbc7',
                '25-30', '#f7f7f7',
                '30-35', '#d1e5f0',
                '35-40', '#92c5de',
                '40-45', '#4393c3',
                '45-50', '#2166ac',
                '50+', '#053061',
                '#ccc' // default color
            ],
            'fill-opacity': [
                'case',
                ['boolean', ['==', ['get', 'county_id'], hoveredCountyId], false],
                1,
                0.8
            ]
        }
    });

    // Add county outline layer
    map.addLayer({
        id: 'county-outline',
        type: 'line',
        source: 'kenya-counties',
        layout: {},
        paint: {
            'line-color': [
                'case',
                ['boolean', ['==', ['get', 'county_id'], hoveredCountyId], false],
                '#ffffff',
                'rgba(255, 255, 255, 0.5)'
            ],
            'line-width': [
                'case',
                ['boolean', ['==', ['get', 'county_id'], hoveredCountyId], false],
                2,
                0.5
            ]
        }
    });

    // Add development index layer (hidden by default)
    map.addLayer({
        id: 'development-layer',
        type: 'fill',
        source: 'kenya-counties',
        layout: {
            'visibility': 'none'
        },
        paint: {
            'fill-color': [
                'match',
                ['get', 'development_index_category'],
                'very-low', '#a50026',
                'low', '#d73027',
                'low-med', '#f46d43',
                'medium', '#fdae61',
                'med-high', '#fee090',
                'high', '#e0f3f8',
                'very-high', '#abd9e9',
                'highest', '#74add1',
                '#ccc' // default color
            ],
            'fill-opacity': [
                'case',
                ['boolean', ['==', ['get', 'county_id'], hoveredCountyId], false],
                1,
                0.8
            ]
        }
    });

    // Add cluster layer (hidden by default)
    map.addLayer({
        id: 'cluster-layer',
        type: 'fill',
        source: 'kenya-counties',
        layout: {
            'visibility': 'none'
        },
        paint: {
            'fill-color': [
                'match',
                ['get', 'cluster_category'],
                '0', '#7fc97f', // Urban Mixed
                '1', '#beaed4', // Rural Dev
                '2', '#fdc086', // Rural Trans
                '3', '#ffff99', // Peri-urban
                '4', '#386cb0', // Semi-urban
                '5', '#f0027f', // Rural Remote
                '6', '#bf5b17', // Urban High-Dev
                '#ccc' // default color
            ],
            'fill-opacity': [
                'case',
                ['boolean', ['==', ['get', 'county_id'], hoveredCountyId], false],
                1,
                0.8
            ]
        }
    });

    // Add county name labels
    map.addLayer({
        id: 'county-labels',
        type: 'symbol',
        source: 'kenya-counties',
        layout: {
            'text-field': ['get', 'county_name'],
            'text-size': 12,
            'text-anchor': 'center',
            'text-allow-overlap': false,
            'text-ignore-placement': false,
            'text-optional': true,
            'symbol-z-order': 'source'
        },
        paint: {
            'text-color': [
                'case',
                ['boolean', ['==', ['get', 'county_id'], hoveredCountyId], false],
                '#ffffff',
                'rgba(0, 0, 0, 0.7)'
            ],
            'text-halo-color': 'rgba(255, 255, 255, 0.8)',
            'text-halo-width': 1
        }
    });

    // Add hover effects for counties
    map.on('mousemove', 'vaccination-layer', onMouseMove);
    map.on('mouseleave', 'vaccination-layer', onMouseLeave);
    map.on('click', 'vaccination-layer', onCountyClick);

    // Add hover effects for other layers
    map.on('mousemove', 'development-layer', onMouseMove);
    map.on('mouseleave', 'development-layer', onMouseLeave);
    map.on('click', 'development-layer', onCountyClick);

    map.on('mousemove', 'cluster-layer', onMouseMove);
    map.on('mouseleave', 'cluster-layer', onMouseLeave);
    map.on('click', 'cluster-layer', onCountyClick);

    // Change cursor to pointer when hovering over counties
    map.on('mouseenter', 'vaccination-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'vaccination-layer', () => {
        map.getCanvas().style.cursor = '';
    });

    // Do the same for other layers
    map.on('mouseenter', 'development-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'development-layer', () => {
        map.getCanvas().style.cursor = '';
    });

    map.on('mouseenter', 'cluster-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'cluster-layer', () => {
        map.getCanvas().style.cursor = '';
    });
}

// Load county data
function loadCountyData() {
    fetch('data/vaccination-rates.json')
        .then(response => response.json())
        .then(data => {
            countyData = data;
            return fetch('data/kenya-counties.geojson');
        })
        .then(response => response.json())
        .then(geojson => {
            // Merge the county data with the GeoJSON data
            geojson.features.forEach(feature => {
                const countyId = feature.properties.county_id;
                if (countyData[countyId]) {
                    // Add vaccination rate data
                    feature.properties.vaccination_rate = countyData[countyId].vaccination_rate;
                    feature.properties.vaccination_rate_category = getVaccinationRateCategory(countyData[countyId].vaccination_rate);
                    
                    // Add development index data
                    feature.properties.development_index = countyData[countyId].development_index;
                    feature.properties.development_index_category = getDevelopmentIndexCategory(countyData[countyId].development_index);
                    
                    // Add cluster data
                    feature.properties.cluster = countyData[countyId].cluster;
                    feature.properties.cluster_category = countyData[countyId].cluster.toString();
                    feature.properties.cluster_name = getClusterName(countyData[countyId].cluster);
                }
            });
            
            // Update the map source with the merged data
            if (map.getSource('kenya-counties')) {
                map.getSource('kenya-counties').setData(geojson);
            }
        })
        .catch(error => {
            console.error('Error loading county data:', error);
        });
}

// Helper functions for categorizing data
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

// Event handlers
function onMouseMove(e) {
    if (e.features.length > 0) {
        if (hoveredCountyId !== null) {
            // Reset the previously hovered county
            map.setFeatureState(
                { source: 'kenya-counties', id: hoveredCountyId },
                { hover: false }
            );
        }
        
        // Get the county ID
        hoveredCountyId = e.features[0].id;
        
        // Set the hover state for the current county
        map.setFeatureState(
            { source: 'kenya-counties', id: hoveredCountyId },
            { hover: true }
        );
        
        // Show tooltip with county data
        const feature = e.features[0];
        const countyName = feature.properties.county_name;
        const countyId = feature.properties.county_id;
        
        let tooltipHTML = '';
        
        if (activeLayer === 'vaccination') {
            const vaccinationRate = feature.properties.vaccination_rate.toFixed(2);
            tooltipHTML = `
                <div class="tooltip-title">${countyName} County</div>
                <div class="tooltip-value">${vaccinationRate}%</div>
                <div class="tooltip-info">COVID-19 Vaccination Rate</div>
            `;
        } else if (activeLayer === 'development') {
            const developmentIndex = feature.properties.development_index.toFixed(2);
            tooltipHTML = `
                <div class="tooltip-title">${countyName} County</div>
                <div class="tooltip-value">${developmentIndex}</div>
                <div class="tooltip-info">Development Index (0-100)</div>
            `;
        } else if (activeLayer === 'clusters') {
            const clusterName = feature.properties.cluster_name;
            tooltipHTML = `
                <div class="tooltip-title">${countyName} County</div>
                <div class="tooltip-value">${clusterName}</div>
                <div class="tooltip-info">Cluster Classification</div>
            `;
        }
        
        // Position and show the tooltip
        tooltip.innerHTML = tooltipHTML;
        tooltip.style.left = `${e.point.x}px`;
        tooltip.style.top = `${e.point.y - 60}px`;
        tooltip.style.opacity = 1;
    }
}

function onMouseLeave() {
    if (hoveredCountyId !== null) {
        // Reset the hover state
        map.setFeatureState(
            { source: 'kenya-counties', id: hoveredCountyId },
            { hover: false }
        );
        hoveredCountyId = null;
    }
    
    // Hide the tooltip
    tooltip.style.opacity = 0;
}

function onCountyClick(e) {
    // Get the clicked county data
    const feature = e.features[0];
    const countyName = feature.properties.county_name;
    const countyId = feature.properties.county_id;
    const vaccinationRate = feature.properties.vaccination_rate.toFixed(2);
    const developmentIndex = feature.properties.development_index.toFixed(2);
    const clusterName = feature.properties.cluster_name;
    
    // Create popup content based on active layer
    let popupContent = `
        <div class="popup-header">
            <div class="popup-title">${countyName} County</div>
            <div class="popup-subtitle">ID: ${countyId}</div>
        </div>
        <div class="popup-content">
            <div class="popup-stat">
                <span class="popup-stat-label">Vaccination Rate:</span>
                <span class="popup-stat-value">${vaccinationRate}%</span>
            </div>
            <div class="popup-stat">
                <span class="popup-stat-label">Development Index:</span>
                <span class="popup-stat-value">${developmentIndex}</span>
            </div>
            <div class="popup-stat">
                <span class="popup-stat-label">Cluster Type:</span>
                <span class="popup-stat-value">${clusterName}</span>
            </div>
        </div>
        <div class="popup-footer">
            Click "Story Map" to explore in detail
        </div>
    `;
    
    // Create and display a popup
    new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: '300px'
    })
    .setLngLat(e.lngLat)
    .setHTML(popupContent)
    .addTo(map);
}

// Setup event listeners for UI controls
function setupEventListeners() {
    // Map layer toggle buttons
    const controlButtons = document.querySelectorAll('.control-btn');
    
    controlButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            controlButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get the layer to display
            const layer = button.getAttribute('data-layer');
            
            // Update active layer
            activeLayer = layer;
            
            // Hide all layers
            map.setLayoutProperty('vaccination-layer', 'visibility', 'none');
            map.setLayoutProperty('development-layer', 'visibility', 'none');
            map.setLayoutProperty('cluster-layer', 'visibility', 'none');
            
            // Show the selected layer
            if (layer === 'vaccination') {
                map.setLayoutProperty('vaccination-layer', 'visibility', 'visible');
            } else if (layer === 'development') {
                map.setLayoutProperty('development-layer', 'visibility', 'visible');
            } else if (layer === 'clusters') {
                map.setLayoutProperty('cluster-layer', 'visibility', 'visible');
            }
            
            // Update legend based on active layer
            updateLegend(layer);
        });
    });
    
    // Enter Story button
    const enterButton = document.querySelector('.enter-button');
    if (enterButton) {
        enterButton.addEventListener('click', () => {
            window.location.href = 'story.html';
        });
    }
    
    // Theme toggle button
    const themeToggle = document.querySelector('.toggle-theme');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            
            // Update map style based on theme
            if (document.body.classList.contains('dark-theme')) {
                map.setStyle('mapbox://styles/mapbox/dark-v11');
            } else {
                map.setStyle('mapbox://styles/mapbox/light-v11');
            }
            
            // Re-add layers after style change
            map.once('style.load', () => {
                setupMapLayers();
                
                // Show the active layer
                if (activeLayer === 'vaccination') {
                    map.setLayoutProperty('vaccination-layer', 'visibility', 'visible');
                    map.setLayoutProperty('development-layer', 'visibility', 'none');
                    map.setLayoutProperty('cluster-layer', 'visibility', 'none');
                } else if (activeLayer === 'development') {
                    map.setLayoutProperty('vaccination-layer', 'visibility', 'none');
                    map.setLayoutProperty('development-layer', 'visibility', 'visible');
                    map.setLayoutProperty('cluster-layer', 'visibility', 'none');
                } else if (activeLayer === 'clusters') {
                    map.setLayoutProperty('vaccination-layer', 'visibility', 'none');
                    map.setLayoutProperty('development-layer', 'visibility', 'none');
                    map.setLayoutProperty('cluster-layer', 'visibility', 'visible');
                }
            });
        });
    }
}

// Update legend based on active layer
function updateLegend(layer) {
    const legendElement = document.querySelector('.map-legend');
    
    if (!legendElement) return;
    
    let legendHTML = '';
    
    if (layer === 'vaccination') {
        legendHTML = `
            <h4>Vaccination Coverage (%)</h4>
            <div class="legend-gradient">
                <span class="color-step" style="background-color: #67001f;"></span>
                <span class="color-step" style="background-color: #b2182b;"></span>
                <span class="color-step" style="background-color: #d6604d;"></span>
                <span class="color-step" style="background-color: #f4a582;"></span>
                <span class="color-step" style="background-color: #fddbc7;"></span>
                <span class="color-step" style="background-color: #f7f7f7;"></span>
                <span class="color-step" style="background-color: #d1e5f0;"></span>
                <span class="color-step" style="background-color: #92c5de;"></span>
                <span class="color-step" style="background-color: #4393c3;"></span>
                <span class="color-step" style="background-color: #2166ac;"></span>
                <span class="color-step" style="background-color: #053061;"></span>
            </div>
            <div class="legend-labels">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
            </div>
        `;
    } else if (layer === 'development') {
        legendHTML = `
            <h4>Development Index</h4>
            <div class="legend-gradient">
                <span class="color-step" style="background-color: #a50026;"></span>
                <span class="color-step" style="background-color: #d73027;"></span>
                <span class="color-step" style="background-color: #f46d43;"></span>
                <span class="color-step" style="background-color: #fdae61;"></span>
                <span class="color-step" style="background-color: #fee090;"></span>
                <span class="color-step" style="background-color: #e0f3f8;"></span>
                <span class="color-step" style="background-color: #abd9e9;"></span>
                <span class="color-step" style="background-color: #74add1;"></span>
            </div>
            <div class="legend-labels">
                <span>0</span>
                <span>50</span>
                <span>100</span>
            </div>
        `;
    } else if (layer === 'clusters') {
        legendHTML = `
            <h4>Cluster Types</h4>
            <div class="legend-items">
                <div class="legend-item">
                    <span class="legend-color" style="background-color: #7fc97f;"></span>
                    <span>Urban Mixed</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background-color: #beaed4;"></span>
                    <span>Rural Dev</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background-color: #fdc086;"></span>
                    <span>Rural Trans</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background-color: #ffff99;"></span>
                    <span>Peri-urban</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background-color: #386cb0;"></span>
                    <span>Semi-urban</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background-color: #f0027f;"></span>
                    <span>Rural Remote</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background-color: #bf5b17;"></span>
                    <span>Urban High-Dev</span>
                </div>
            </div>
        `;
    }
    
    legendElement.innerHTML = legendHTML;
}
