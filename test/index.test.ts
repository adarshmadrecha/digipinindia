import { describe, it, expect } from 'bun:test'
import { getDigiPin, getLatLngFromDigiPin } from '../index.ts'

describe('DigiPin India', () => {
  describe('getDigiPin', () => {
    it('should encode latitude and longitude to DigiPin correctly', () => {
      const digiPin = getDigiPin(18.968557, 72.822191)
      expect(digiPin).toBe('4FK-5MK-9PPK')
    })

    it('should throw error for latitude out of bounds', () => {
      expect(() => getDigiPin(40, 72.822191)).toThrow('Latitude 40 out of range [2.5, 38.5]')
      expect(() => getDigiPin(1, 72.822191)).toThrow('Latitude 1 out of range [2.5, 38.5]')
    })

    it('should throw error for longitude out of bounds', () => {
      expect(() => getDigiPin(18.968557, 100)).toThrow('Longitude 100 out of range [63.5, 99.5]')
      expect(() => getDigiPin(18.968557, 60)).toThrow('Longitude 60 out of range [63.5, 99.5]')
    })

    it('should handle edge cases within bounds', () => {
      const minBounds = getDigiPin(2.5, 63.5)
      expect(typeof minBounds).toBe('string')
      expect(minBounds).toMatch(/^[FCJKLMPT2-9]+-[FCJKLMPT2-9]+-[FCJKLMPT2-9]+$/)

      const maxBounds = getDigiPin(38.5, 99.5)
      expect(typeof maxBounds).toBe('string')
      expect(maxBounds).toMatch(/^[FCJKLMPT2-9]+-[FCJKLMPT2-9]+-[FCJKLMPT2-9]+$/)
    })
  })

  describe('getLatLngFromDigiPin', () => {
    it('should decode DigiPin to latitude and longitude correctly', () => {
      const latLng = getLatLngFromDigiPin('4FK-5MK-9PPK')
      expect(latLng).toEqual({
        latitude: 18.968557,
        longitude: 72.822191
      })
    })

    it('should decode DigiPin without hyphens', () => {
      const latLng = getLatLngFromDigiPin('4FK5MK9PPK')
      expect(latLng).toEqual({
        latitude: 18.968557,
        longitude: 72.822191
      })
    })

    it('should throw error for invalid DigiPin length', () => {
      expect(() => getLatLngFromDigiPin('4FK-5MK')).toThrow('Invalid DIGIPIN length: 6, expected 10')
      expect(() => getLatLngFromDigiPin('4FK-5MK-9PPK-XXX')).toThrow('Invalid DIGIPIN length: 13, expected 10')
    })

    it('should throw error for invalid characters', () => {
      expect(() => getLatLngFromDigiPin('XFK-5MK-9PPK')).toThrow("Invalid character 'X' at position 0 in DIGIPIN")
      expect(() => getLatLngFromDigiPin('4FK-ZMK-9PPK')).toThrow("Invalid character 'Z' at position 3 in DIGIPIN")
    })
  })

  describe('Round-trip conversion', () => {
    it('should maintain accuracy in round-trip conversions', () => {
      const testCases = [
        { lat: 18.968557, lon: 72.822191 },
        { lat: 28.6139, lon: 77.2090 }, // New Delhi
        { lat: 12.9716, lon: 77.5946 }, // Bangalore
        { lat: 22.5726, lon: 88.3639 }, // Kolkata
      ]

      testCases.forEach(({ lat, lon }) => {
        const digiPin = getDigiPin(lat, lon)
        const decoded = getLatLngFromDigiPin(digiPin)

        // Check that the decoded coordinates are close to the original
        // (within the precision limits of the DigiPin system)
        expect(Math.abs(decoded.latitude - lat)).toBeLessThan(0.01)
        expect(Math.abs(decoded.longitude - lon)).toBeLessThan(0.01)
      })
    })
  })
})