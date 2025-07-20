// DIGIPIN functions - inline implementation for browser compatibility
// Based on the main index.ts module

// Pre-compute character lookup map for O(1) character finding
const CHAR_TO_POSITION = new Map();
const DIGIPIN_GRID_CHARS = [
  ['F', 'C', '9', '8'],
  ['J', '3', '2', '7'],
  ['K', '4', '5', '6'],
  ['L', 'M', 'P', 'T']
];

// Initialize character lookup map
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    CHAR_TO_POSITION.set(DIGIPIN_GRID_CHARS[r][c], { row: r, col: c });
  }
}

const BOUNDS = {
  minLat: 2.5,
  maxLat: 38.5,
  minLon: 63.5,
  maxLon: 99.5,
  latRange: 36.0,  // Pre-computed: maxLat - minLat
  lonRange: 36.0   // Pre-computed: maxLon - minLon
};

const DIGIPIN_LENGTH = 10;

/**
 * Encodes latitude and longitude into a DIGIPIN
 * @param {number} lat - Latitude (2.5 to 38.5)
 * @param {number} lon - Longitude (63.5 to 99.5)
 * @returns {string} 10-digit DIGIPIN with hyphens
 */
function getDigiPin(lat, lon) {
  // Input validation
  if (lat < BOUNDS.minLat || lat > BOUNDS.maxLat) {
    throw new Error(`Latitude ${lat} out of range [${BOUNDS.minLat}, ${BOUNDS.maxLat}]`);
  }
  if (lon < BOUNDS.minLon || lon > BOUNDS.maxLon) {
    throw new Error(`Longitude ${lon} out of range [${BOUNDS.minLon}, ${BOUNDS.maxLon}]`);
  }

  let minLat = BOUNDS.minLat;
  let maxLat = BOUNDS.maxLat;
  let minLon = BOUNDS.minLon;
  let maxLon = BOUNDS.maxLon;

  let result = '';

  for (let level = 0; level < DIGIPIN_LENGTH; level++) {
    const latRange = maxLat - minLat;
    const lonRange = maxLon - minLon;
    const latDiv = latRange * 0.25;
    const lonDiv = lonRange * 0.25;

    const latOffset = lat - minLat;
    const lonOffset = lon - minLon;

    let row = Math.floor(latOffset / latDiv);
    row = row > 3 ? 3 : row;
    row = 3 - row; // Reverse row logic
    row = row < 0 ? 0 : row;

    let col = Math.floor(lonOffset / lonDiv);
    col = col > 3 ? 3 : col;
    col = col < 0 ? 0 : col;

    result += DIGIPIN_GRID_CHARS[row][col];

    // Add hyphen after 3rd and 6th characters
    if (level === 2 || level === 5) {
      result += '-';
    }

    // Update bounds for next level
    const newMinLat = minLat + latDiv * (3 - row);
    maxLat = newMinLat + latDiv;
    minLat = newMinLat;

    const newMinLon = minLon + lonDiv * col;
    maxLon = newMinLon + lonDiv;
    minLon = newMinLon;
  }

  return result;
}

/**
 * Decodes a DIGIPIN back to its central coordinates
 * @param {string} digiPin - DIGIPIN string (with or without hyphens)
 * @returns {Object} Object with latitude and longitude as numbers
 */
function getLatLngFromDigiPin(digiPin) {
  // Remove hyphens and validate length
  let pin = digiPin.replace(/-/g, '');

  if (pin.length !== DIGIPIN_LENGTH) {
    throw new Error(`Invalid DIGIPIN length: ${pin.length}, expected ${DIGIPIN_LENGTH}`);
  }

  let minLat = BOUNDS.minLat;
  let maxLat = BOUNDS.maxLat;
  let minLon = BOUNDS.minLon;
  let maxLon = BOUNDS.maxLon;

  for (let i = 0; i < DIGIPIN_LENGTH; i++) {
    const char = pin[i];
    const position = CHAR_TO_POSITION.get(char);

    if (!position) {
      throw new Error(`Invalid character '${char}' at position ${i} in DIGIPIN`);
    }

    const { row, col } = position;

    const latRange = maxLat - minLat;
    const lonRange = maxLon - minLon;
    const latDiv = latRange * 0.25;
    const lonDiv = lonRange * 0.25;

    const newMinLat = maxLat - latDiv * row - latDiv;
    const newMaxLat = maxLat - latDiv * row;
    const newMinLon = minLon + lonDiv * col;
    const newMaxLon = newMinLon + lonDiv;

    minLat = newMinLat;
    maxLat = newMaxLat;
    minLon = newMinLon;
    maxLon = newMaxLon;
  }

  const centerLat = (minLat + maxLat) * 0.5;
  const centerLon = (minLon + maxLon) * 0.5;

  return {
    latitude: Math.round(centerLat * 1000000) / 1000000,
    longitude: Math.round(centerLon * 1000000) / 1000000
  };
}

// DIGIPIN Grid Configuration
const DIGIPIN_GRID = [
  ['F', 'C', '9', '8'],
  ['J', '3', '2', '7'],
  ['K', '4', '5', '6'],
  ['L', 'M', 'P', 'T']
];

// India bounds for DIGIPIN system
const INDIA_BOUNDS = {
  minLat: 2.5,
  maxLat: 38.5,
  minLon: 63.5,
  maxLon: 99.5
};

// Grid size information for different zoom levels
const GRID_LEVELS = [
  { level: 1, chars: 1, size: '~1000 km', description: 'Regions' },
  { level: 2, chars: 2, size: '~250 km', description: 'Large States' },
  { level: 3, chars: 3, size: '~62.5 km', description: 'Districts' },
  { level: 4, chars: 4, size: '~15.6 km', description: 'Cities/Towns' },
  { level: 5, chars: 5, size: '~3.9 km', description: 'Neighborhoods' },
  { level: 6, chars: 6, size: '~1 km', description: 'Local areas' },
  { level: 7, chars: 7, size: '~250 m', description: 'City blocks' },
  { level: 8, chars: 8, size: '~60 m', description: 'Building complex' },
  { level: 9, chars: 9, size: '~15 m', description: 'Individual buildings' },
  { level: 10, chars: 10, size: '~4 m', description: 'Final precision' }
];

class DigipinVisualizer {
  constructor() {
    this.map = null;
    this.gridLayer = null;
    this.currentGridLevel = 1;
    this.gridVisible = true;
    this.hoveredCell = null;
    this.tooltip = null;

    this.initializeMap();
    this.setupEventListeners();
    this.updateInfoPanel();
  }

  initializeMap() {
    // Initialize map centered on India
    this.map = L.map('map', {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      maxBounds: [
        [INDIA_BOUNDS.minLat - 2, INDIA_BOUNDS.minLon - 2],
        [INDIA_BOUNDS.maxLat + 2, INDIA_BOUNDS.maxLon + 2]
      ]
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <a href="https://www.indiapost.gov.in/vas/Pages/digipin.aspx" target="_blank">DIGIPIN by India Post</a>',
      maxZoom: 18,
      minZoom: 3
    }).addTo(this.map);

    // Initialize grid layer
    this.initializeGridLayer();

    // Setup map event listeners
    this.map.on('zoomend', () => {
      this.updateGridLevel();
      this.updateGrid();
    });

    this.map.on('moveend', () => {
      this.updateGrid();
    });
  }

  initializeGridLayer() {
    this.gridLayer = L.layerGroup().addTo(this.map);
    this.updateGrid();
  }

  updateGridLevel() {
    const zoom = this.map.getZoom();

    // Map zoom levels to DIGIPIN levels
    // Lower zoom = broader view = fewer characters
    let newLevel;
    if (zoom <= 3) newLevel = 1;
    else if (zoom <= 4) newLevel = 2;
    else if (zoom <= 6) newLevel = 3;
    else if (zoom <= 8) newLevel = 4;
    else if (zoom <= 10) newLevel = 5;
    else if (zoom <= 12) newLevel = 6;
    else if (zoom <= 14) newLevel = 7;
    else if (zoom <= 16) newLevel = 8;
    else if (zoom <= 17) newLevel = 9;
    else newLevel = 10;

    if (newLevel !== this.currentGridLevel) {
      this.currentGridLevel = newLevel;
      this.updateInfoPanel();
    }
  }

  updateGrid() {
    if (!this.gridVisible) return;

    // Clear existing grid
    this.gridLayer.clearLayers();

    const bounds = this.map.getBounds();
    const level = this.currentGridLevel;

    // Calculate grid resolution based on current zoom and view
    const gridCells = this.calculateGridCells(bounds, level);

    gridCells.forEach(cell => {
      this.createGridCell(cell);
    });
  }

  calculateGridCells(bounds, level) {
    const cells = [];
    const zoom = this.map.getZoom();

    // Limit number of cells based on zoom to prevent performance issues
    let maxCells = 64; // 8x8 grid max
    if (zoom <= 5) maxCells = 16; // 4x4 grid for low zoom
    else if (zoom <= 8) maxCells = 36; // 6x6 grid for medium zoom

    // Calculate the number of divisions per axis based on desired cells
    const divisionsPerAxis = Math.sqrt(maxCells);

    const latStep = (bounds.getNorth() - bounds.getSouth()) / divisionsPerAxis;
    const lonStep = (bounds.getEast() - bounds.getWest()) / divisionsPerAxis;

    for (let i = 0; i < divisionsPerAxis; i++) {
      for (let j = 0; j < divisionsPerAxis; j++) {
        const south = bounds.getSouth() + (i * latStep);
        const north = bounds.getSouth() + ((i + 1) * latStep);
        const west = bounds.getWest() + (j * lonStep);
        const east = bounds.getWest() + ((j + 1) * lonStep);

        // Check if cell intersects with India bounds
        if (this.intersectsIndiaBounds(south, north, west, east)) {
          const centerLat = (south + north) / 2;
          const centerLon = (west + east) / 2;

          cells.push({
            bounds: [[south, west], [north, east]],
            center: [centerLat, centerLon],
            level: level
          });
        }
      }
    }

    return cells;
  }

  intersectsIndiaBounds(south, north, west, east) {
    return !(east < INDIA_BOUNDS.minLon ||
      west > INDIA_BOUNDS.maxLon ||
      north < INDIA_BOUNDS.minLat ||
      south > INDIA_BOUNDS.maxLat);
  }

  createGridCell(cell) {
    const rectangle = L.rectangle(cell.bounds, {
      color: '#ff0000',
      weight: 2,
      opacity: 0.8,
      fillColor: '#007bff',
      fillOpacity: 0.1,
      className: 'digipin-grid-cell'
    });

    rectangle.on('mouseover', (e) => {
      this.handleCellHover(e, cell);
    });

    rectangle.on('mouseout', () => {
      this.handleCellLeave();
    });

    rectangle.on('click', (e) => {
      this.handleCellClick(e, cell);
    });

    rectangle.addTo(this.gridLayer);
  }

  handleCellHover(e, cell) {
    // Highlight the cell
    e.target.setStyle({
      fillOpacity: 0.3,
      weight: 3
    });

    // Calculate DIGIPIN for the cell center
    const [lat, lon] = cell.center;

    try {
      if (this.isInIndiaBounds(lat, lon)) {
        const fullDigipin = getDigiPin(lat, lon);
        const levelDigipin = fullDigipin.replace(/-/g, '').substring(0, this.currentGridLevel);

        // Format with hyphens for display
        const formattedDigipin = this.formatDigipinForDisplay(levelDigipin);

        this.updateHoverInfo(formattedDigipin, lat, lon);

        // Show tooltip
        this.showTooltip(e.latlng, formattedDigipin);
      }
    } catch (error) {
      console.warn('Error calculating DIGIPIN:', error);
      this.updateHoverInfo('Out of bounds', lat, lon);
    }
  }

  handleCellLeave() {
    // Reset cell style
    this.gridLayer.eachLayer(layer => {
      if (layer.setStyle) {
        layer.setStyle({
          fillOpacity: 0.1,
          weight: 2
        });
      }
    });

    this.updateHoverInfo('Hover over a grid', '--', '--');
    this.hideTooltip();
  }

  handleCellClick(e, cell) {
    const [lat, lon] = cell.center;
    console.log('Clicked cell:', { lat, lon, level: this.currentGridLevel });

    // Zoom in if not at max level
    if (this.currentGridLevel < 10 && this.map.getZoom() < 18) {
      this.map.setView([lat, lon], this.map.getZoom() + 2);
    }
  }

  showTooltip(latlng, digipin) {
    this.hideTooltip();

    this.tooltip = L.tooltip({
      permanent: false,
      direction: 'top',
      offset: [0, -10],
      className: 'leaflet-tooltip-digipin'
    })
      .setLatLng(latlng)
      .setContent(digipin)
      .addTo(this.map);
  }

  hideTooltip() {
    if (this.tooltip) {
      this.map.removeLayer(this.tooltip);
      this.tooltip = null;
    }
  }

  formatDigipinForDisplay(digipin) {
    if (digipin.length <= 3) {
      return digipin;
    }

    let formatted = digipin.substring(0, 3);
    if (digipin.length > 3) {
      formatted += '-' + digipin.substring(3, 6);
    }
    if (digipin.length > 6) {
      formatted += '-' + digipin.substring(6);
    }

    return formatted;
  }

  isInIndiaBounds(lat, lon) {
    return lat >= INDIA_BOUNDS.minLat && lat <= INDIA_BOUNDS.maxLat &&
      lon >= INDIA_BOUNDS.minLon && lon <= INDIA_BOUNDS.maxLon;
  }

  updateHoverInfo(digipin, lat, lon) {
    document.getElementById('digipin-display').textContent = digipin;

    if (lat !== '--' && lon !== '--') {
      document.getElementById('coord-display').textContent =
        `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    } else {
      document.getElementById('coord-display').textContent = lat + ', ' + lon;
    }
  }

  updateInfoPanel() {
    const gridInfo = GRID_LEVELS[this.currentGridLevel - 1];

    document.getElementById('zoom-level').textContent = this.map.getZoom();
    document.getElementById('digipin-chars').textContent = gridInfo.chars;
    document.getElementById('grid-size').textContent = gridInfo.size;
  }

  setupEventListeners() {
    // Reset view button
    document.getElementById('reset-view').addEventListener('click', () => {
      this.map.setView([20.5937, 78.9629], 5);
    });

    // Toggle grid button
    document.getElementById('toggle-grid').addEventListener('click', () => {
      this.gridVisible = !this.gridVisible;
      if (this.gridVisible) {
        this.updateGrid();
        document.getElementById('toggle-grid').textContent = '🔲 Toggle Grid';
      } else {
        this.gridLayer.clearLayers();
        document.getElementById('toggle-grid').textContent = '✅ Toggle Grid';
      }
    });

    // Info modal
    const modal = document.getElementById('info-modal');
    const infoBtn = document.getElementById('info-toggle');
    const closeBtn = document.querySelector('.close');

    infoBtn.addEventListener('click', () => {
      modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });

    // Update info panel on zoom
    this.map.on('zoom', () => {
      setTimeout(() => this.updateInfoPanel(), 100);
    });
  }

  // Public API methods
  toggleGrid() {
    document.getElementById('toggle-grid').click();
  }

  resetView() {
    document.getElementById('reset-view').click();
  }

  getDigipinAt(lat, lon) {
    try {
      if (this.isInIndiaBounds(lat, lon)) {
        return getDigiPin(lat, lon);
      }
      return null;
    } catch (error) {
      console.error('Error getting DIGIPIN:', error);
      return null;
    }
  }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.digipinVisualizer = new DigipinVisualizer();

  // Add some helpful console methods for developers
  console.log('🇮🇳 DIGIPIN Visualizer loaded!');
  console.log('Available methods:');
  console.log('- window.digipinVisualizer.getDigipinAt(lat, lon)');
  console.log('- window.digipinVisualizer.toggleGrid()');
  console.log('- window.digipinVisualizer.resetView()');

  // Example usage
  console.log('Example: Try window.digipinVisualizer.getDigipinAt(28.6139, 77.2090) for New Delhi');
});
