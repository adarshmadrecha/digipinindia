/**
 * DIGIPIN Encoder and Decoder Library
 * Developed by India Post, Department of Posts
 * Released under an open-source license for public use
 *
 * This module contains two main functions:
 *  - getDigiPin(lat, lon): Encodes latitude & longitude into a 10-digit alphanumeric DIGIPIN
 *  - getLatLngFromDigiPin(digiPin): Decodes a DIGIPIN back into its central latitude & longitude
 */

// Pre-compute character lookup map for O(1) character finding
const CHAR_TO_POSITION = new Map();
const DIGIPIN_GRID = [
  ['F', 'C', '9', '8'],
  ['J', '3', '2', '7'],
  ['K', '4', '5', '6'],
  ['L', 'M', 'P', 'T']
];

// Initialize character lookup map
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    CHAR_TO_POSITION.set(DIGIPIN_GRID[r][c], { row: r, col: c });
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
const GRID_SIZE = 4;
const HYPHEN_POSITIONS = new Set([3, 6]); // Positions where hyphens are added

/**
 * Encodes latitude and longitude into a DIGIPIN
 * @param {number} lat - Latitude (2.5 to 38.5)
 * @param {number} lon - Longitude (63.5 to 99.5)
 * @returns {string} 10-digit DIGIPIN with hyphens
 * @throws {Error} If coordinates are out of bounds
 */
export function getDigiPin(lat, lon) {
  // Input validation with early return
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

  const result = [];

  for (let level = 0; level < DIGIPIN_LENGTH; level++) {
    const latDiv = (maxLat - minLat) / GRID_SIZE;
    const lonDiv = (maxLon - minLon) / GRID_SIZE;

    // Calculate grid position (reversed row logic maintained)
    const row = Math.min(3, Math.max(0, 3 - Math.floor((lat - minLat) / latDiv)));
    const col = Math.min(3, Math.max(0, Math.floor((lon - minLon) / lonDiv)));

    result.push(DIGIPIN_GRID[row][col]);

    // Add hyphen after 3rd and 6th characters
    if (HYPHEN_POSITIONS.has(level + 1)) {
      result.push('-');
    }

    // Update bounds for next level (reverse logic for row maintained)
    const newMinLat = minLat + latDiv * (3 - row);
    maxLat = newMinLat + latDiv;
    minLat = newMinLat;

    const newMinLon = minLon + lonDiv * col;
    maxLon = newMinLon + lonDiv;
    minLon = newMinLon;
  }

  return result.join('');
}

/**
 * Decodes a DIGIPIN back to its central coordinates
 * @param {string} digiPin - DIGIPIN string (with or without hyphens)
 * @returns {Object} Object with latitude and longitude as strings (6 decimal places)
 * @throws {Error} If DIGIPIN is invalid
 */
export function getLatLngFromDigiPin(digiPin) {
  // Remove hyphens and validate length
  const pin = digiPin.replace(/-/g, '');
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
    const latDiv = (maxLat - minLat) / GRID_SIZE;
    const lonDiv = (maxLon - minLon) / GRID_SIZE;

    // Calculate new bounds (reverse logic for latitude maintained)
    const newMinLat = maxLat - latDiv * (row + 1);
    const newMaxLat = maxLat - latDiv * row;
    const newMinLon = minLon + lonDiv * col;
    const newMaxLon = minLon + lonDiv * (col + 1);

    // Update bounds for next iteration
    minLat = newMinLat;
    maxLat = newMaxLat;
    minLon = newMinLon;
    maxLon = newMaxLon;
  }

  // Calculate center coordinates
  const centerLat = (minLat + maxLat) * 0.5;
  const centerLon = (minLon + maxLon) * 0.5;

  return {
    latitude: centerLat.toFixed(6),
    longitude: centerLon.toFixed(6)
  };
}

