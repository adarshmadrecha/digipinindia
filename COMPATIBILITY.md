# JavaScript Compatibility Test

This file demonstrates how the package works in both TypeScript and JavaScript projects.

## TypeScript Project
```typescript
import { getDigiPin, getLatLngFromDigiPin } from 'digipinindia';

// Full type safety and IntelliSense
const pin: string = getDigiPin(18.968557, 72.822191);
const coords: { latitude: number; longitude: number } = getLatLngFromDigiPin(pin);

console.log(pin);    // 4FK-5MK-9PPK
console.log(coords); // { latitude: 18.968557, longitude: 72.822191 }
```

## JavaScript Project
```javascript
import { getDigiPin, getLatLngFromDigiPin } from 'digipinindia';

// Works perfectly without TypeScript
const pin = getDigiPin(18.968557, 72.822191);
const coords = getLatLngFromDigiPin(pin);

console.log(pin);    // 4FK-5MK-9PPK
console.log(coords); // { latitude: 18.968557, longitude: 72.822191 }
```

## Node.js with require() (if using CommonJS)
Note: This package only supports ESM imports. For CommonJS projects, you'll need to:

1. Use dynamic imports:
```javascript
(async () => {
  const { getDigiPin } = await import('digipinindia');
  console.log(getDigiPin(18.968557, 72.822191));
})();
```

2. Or configure your project to use ESM by adding `"type": "module"` to package.json

## Features
- ✅ Works in TypeScript projects with full type safety
- ✅ Works in JavaScript projects (ES modules)
- ✅ Tree-shakeable ESM exports
- ✅ Source maps included for debugging
- ✅ TypeScript declarations for editor support
- ✅ Zero runtime dependencies
