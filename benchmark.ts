#!/usr/bin/env bun
import { getDigiPin, getLatLngFromDigiPin } from './index.ts';

// Benchmark data - real coordinates across India
const testCoordinates = [
  { lat: 28.6139, lon: 77.2090, name: 'New Delhi' },
  { lat: 19.0760, lon: 72.8777, name: 'Mumbai' },
  { lat: 12.9716, lon: 77.5946, name: 'Bangalore' },
  { lat: 13.0827, lon: 80.2707, name: 'Chennai' },
  { lat: 22.5726, lon: 88.3639, name: 'Kolkata' },
  { lat: 17.3850, lon: 78.4867, name: 'Hyderabad' },
  { lat: 23.0225, lon: 72.5714, name: 'Ahmedabad' },
  { lat: 18.5204, lon: 73.8567, name: 'Pune' },
  { lat: 25.5941, lon: 85.1376, name: 'Patna' },
  { lat: 26.9124, lon: 75.7873, name: 'Jaipur' }
];

function benchmark() {
  console.log('🚀 DIGIPIN Performance Benchmark\n');

  // Encoding benchmark
  console.log('📍 Testing ENCODING performance...');
  const iterations = 100000;

  const startEncode = performance.now();
  for (let i = 0; i < iterations; i++) {
    const coord = testCoordinates[i % testCoordinates.length]!;
    getDigiPin(coord.lat, coord.lon);
  }
  const endEncode = performance.now();
  const encodeTime = endEncode - startEncode;

  // Decoding benchmark
  console.log('📍 Testing DECODING performance...');

  // Pre-generate DIGIPINs
  const digipins = testCoordinates.map(coord => getDigiPin(coord.lat, coord.lon));

  const startDecode = performance.now();
  for (let i = 0; i < iterations; i++) {
    const digipin = digipins[i % digipins.length]!;
    getLatLngFromDigiPin(digipin);
  }
  const endDecode = performance.now();
  const decodeTime = endDecode - startDecode;

  // Results
  console.log('\n📊 Results:');
  console.log(`Encoding: ${iterations} operations in ${encodeTime.toFixed(2)}ms`);
  console.log(`  - Average: ${(encodeTime / iterations * 1000).toFixed(3)}μs per operation`);
  console.log(`  - Throughput: ${Math.round(iterations / encodeTime * 1000)} ops/sec`);

  console.log(`\nDecoding: ${iterations} operations in ${decodeTime.toFixed(2)}ms`);
  console.log(`  - Average: ${(decodeTime / iterations * 1000).toFixed(3)}μs per operation`);
  console.log(`  - Throughput: ${Math.round(iterations / decodeTime * 1000)} ops/sec`);

  // Memory usage (if available)
  if ('memory' in performance) {
    const memInfo = (performance as any).memory;
    console.log(`\n💾 Memory Usage:`);
    console.log(`  - Used JS Heap: ${Math.round(memInfo.usedJSHeapSize / 1024 / 1024)}MB`);
    console.log(`  - Total JS Heap: ${Math.round(memInfo.totalJSHeapSize / 1024 / 1024)}MB`);
  }

  // Sample outputs
  console.log('\n🗺️  Sample DIGIPIN Codes:');
  testCoordinates.slice(0, 5).forEach(coord => {
    const digipin = getDigiPin(coord.lat, coord.lon);
    const decoded = getLatLngFromDigiPin(digipin);
    console.log(`  ${coord.name}: ${digipin} → (${decoded.latitude}, ${decoded.longitude})`);
  });
}

benchmark();
