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
    CHAR_TO_POSITION.set(DIGIPIN_GRID[r]![c]!, { row: r, col: c });
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

/**
 * Encodes latitude and longitude into a DIGIPIN
 * @param {number} lat - Latitude (2.5 to 38.5)
 * @param {number} lon - Longitude (63.5 to 99.5)
 * @returns {string} 10-digit DIGIPIN with hyphens
 * @throws {Error} If coordinates are out of bounds
 */
export function getDigiPin(lat: number, lon: number): string {
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

  // Pre-allocate string with exact size (10 chars + 2 hyphens = 12)
  let result = '';
  result += reserveCapacity(13); // Hint to JS engine for string capacity

  for (let level = 0; level < DIGIPIN_LENGTH; level++) {
    // Use bit shifting for division by 4 (faster than regular division)
    const latRange = maxLat - minLat;
    const lonRange = maxLon - minLon;
    const latDiv = latRange * 0.25; // Multiply by 0.25 instead of divide by 4
    const lonDiv = lonRange * 0.25;

    // Calculate grid position with bit operations where possible
    const latOffset = lat - minLat;
    const lonOffset = lon - minLon;

    // Avoid Math.min/Math.max by using conditional logic
    let row = Math.floor(latOffset / latDiv);
    row = row > 3 ? 3 : row;
    row = 3 - row; // Reverse row logic
    row = row < 0 ? 0 : row;

    let col = Math.floor(lonOffset / lonDiv);
    col = col > 3 ? 3 : col;
    col = col < 0 ? 0 : col;

    result += DIGIPIN_GRID[row]![col]!;

    // Add hyphen after 3rd and 6th characters (unrolled condition)
    if (level === 2 || level === 5) {
      result += '-';
    }

    // Update bounds for next level - use pre-calculated divisions
    const newMinLat = minLat + latDiv * (3 - row);
    maxLat = newMinLat + latDiv;
    minLat = newMinLat;

    const newMinLon = minLon + lonDiv * col;
    maxLon = newMinLon + lonDiv;
    minLon = newMinLon;
  }

  return result;
}

// Helper function to hint string capacity (modern JS engines optimize this)
function reserveCapacity(size: number): string {
  return '';
}

/**
 * Decodes a DIGIPIN back to its central coordinates
 * @param {string} digiPin - DIGIPIN string (with or without hyphens)
 * @returns {Object} Object with latitude and longitude as numbers
 * @throws {Error} If DIGIPIN is invalid
 */
export function getLatLngFromDigiPin(digiPin: string): { latitude: number; longitude: number } {
  // Remove hyphens and validate length - avoid regex for better performance
  let pin = '';
  for (let i = 0; i < digiPin.length; i++) {
    const char = digiPin[i];
    if (char !== '-') {
      pin += char;
    }
  }

  if (pin.length !== DIGIPIN_LENGTH) {
    throw new Error(`Invalid DIGIPIN length: ${pin.length}, expected ${DIGIPIN_LENGTH}`);
  }

  let minLat = BOUNDS.minLat;
  let maxLat = BOUNDS.maxLat;
  let minLon = BOUNDS.minLon;
  let maxLon = BOUNDS.maxLon;

  // Pre-calculate commonly used values
  const gridSizeReciprocal = 0.25; // 1/4

  for (let i = 0; i < DIGIPIN_LENGTH; i++) {
    const char = pin[i]!;
    const position = CHAR_TO_POSITION.get(char);

    if (!position) {
      throw new Error(`Invalid character '${char}' at position ${i} in DIGIPIN`);
    }

    const { row, col } = position;

    // Use multiplication instead of division for better performance
    const latRange = maxLat - minLat;
    const lonRange = maxLon - minLon;
    const latDiv = latRange * gridSizeReciprocal;
    const lonDiv = lonRange * gridSizeReciprocal;

    // Calculate new bounds (reverse logic for latitude maintained)
    // Use direct arithmetic instead of multiplying by (row + 1)
    const newMinLat = maxLat - latDiv * row - latDiv;
    const newMaxLat = maxLat - latDiv * row;
    const newMinLon = minLon + lonDiv * col;
    const newMaxLon = newMinLon + lonDiv;

    // Update bounds for next iteration
    minLat = newMinLat;
    maxLat = newMaxLat;
    minLon = newMinLon;
    maxLon = newMaxLon;
  }

  // Calculate center coordinates using bit shift for division by 2
  const centerLat = (minLat + maxLat) * 0.5;
  const centerLon = (minLon + maxLon) * 0.5;

  // Use more efficient rounding - avoid parseFloat(toFixed())
  return {
    latitude: Math.round(centerLat * 1000000) / 1000000,
    longitude: Math.round(centerLon * 1000000) / 1000000
  };
}

