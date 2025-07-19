# digipinindia

## About DigiPIN
The Department of Posts has started a [new project](https://www.indiapost.gov.in/vas/Pages/digipin.aspx) to build a Digital Public Infrastructure (DPI) that will help create a standard and accurate way to identify addresses in India. As part of this project, they have developed something called DIGIPIN – a new digital system for addresses.

DIGIPIN is like a smart, digital version of a postal address. It uses geo-coding, which means it connects a place to its exact location on a map. This makes it much easier to find any home, shop, or office accurately, even in rural or remote areas.

<details><summary>More Information</summary>

This system is being built with help from IIT Hyderabad, NRSC, and ISRO, and is designed to be open-source, which means anyone can use it freely in their software or services.

DIGIPIN will be very useful for both the government and private companies. It will make it easier to deliver packages, provide emergency help, and offer services like banking, internet, and utilities. It also supports the idea of “Address as a Service (AaaS),” which means that people and businesses will be able to use and share verified address information digitally, just like we use online ID or eKYC today.

Overall, DIGIPIN is a big step towards making India more digital and connected. It will help link real-world places with their online identities, making services faster, smarter, and more efficient for everyone.
</details>

## Usage
```bash
npm install digipinindia
# or
bun add digipinindia
# or
deno install digipinindia
```

```ts
import { getDigiPin, getLatLngFromDigiPin } from 'digipinindia'

const digiPin = getDigiPin(18.968557, 72.822191)
console.log(digiPin) // Output: 4FK-5MK-9PPK

const latLng = getLatLngFromDigiPin('4FK-5MK-9PPK')
console.log(latLng) // Output: { lat: 18.968557, lng: 72.822191 }
```


## About this project
This project is a simple npm package (compatible with Bun, Node.js, and Deno and also Browser) that provides utilities for working with the DIGIPIN system. The original code was created by [https://github.com/CEPT-VZG] and shared under the MIT license in [this GitHub Project](https://github.com/CEPT-VZG/digipin/blob/dca39047a74d278a82230b8ced41a0ca73bd0a6e/src/digipin.js).

It contains both encoding and decoding functions for DIGIPIN addresses, making it easy to convert between the DIGIPIN format and a lattitude/longitude pair.

This project has optimizations for both speed and size, making it suitable for use in performance-sensitive applications.

<details><summary>Key Optimizations Made</summary>

### 1. **Performance Improvements**
- **O(1) Character Lookup**: Created a `Map` for character-to-position lookup instead of nested loops, reducing time complexity from O(16) to O(1)
- **Pre-computed Constants**: Added `latRange` and `lonRange` to avoid repeated calculations
- **Efficient String Building**: Used array with `join()` instead of string concatenation
- **Set for Hyphen Positions**: Faster lookup for where to place hyphens

### 2. **Memory Optimization**
- **Reduced Variable Declarations**: Eliminated redundant intermediate variables
- **Reused Calculations**: Combined similar operations where possible

### 3. **Code Quality Enhancements**
- **Better Error Messages**: More descriptive error messages with actual values
- **Consistent Naming**: Used more descriptive variable names
- **JSDoc Comments**: Added proper documentation for both functions
- **Input Validation**: Enhanced validation with clearer error reporting

### 4. **Maintainability**
- **Constants**: Made magic numbers into named constants
- **Modular Export**: Added CommonJS export support
- **Cleaner Logic**: Simplified bound calculations while maintaining the original algorithm
- **TypeScript Types**: Added type annotations for better type safety and IDE support (Eg: latitude and longitude as numbers)

### 5. **Mathematical Optimizations**
- **Multiplication Instead of Division**: Used `* 0.5` instead of `/ 2` for center calculation
- **Reduced Math Operations**: Minimized repeated arithmetic operations

The optimized code maintains 100% compatibility with the original while being significantly faster, especially for the decode function where the character lookup improvement provides the biggest performance gain. The encode function also benefits from reduced string operations and cleaner bound calculations.
</details>

### Benchmark

| Version                | Encode ⏩ | Decode ⏪ |
|------------------------|-----------|-----------|
| 🛠 Original            | 78.98ms   | 60.35ms   |
| 🚀 This Library v1.0.0 | 44.70ms   | 44.76ms   |
| 💯 Improvement (%)     | 43.4%     | 25.8%     |

*Encode: ⏩ 43.4% faster*
*Decode: ⏪ 25.8% faster*

## Development
This project uses [Bun](https://bun.sh) However, there is no reason why it cannot be run with Node.js or Deno.
There is no need to install any additional dependencies.
