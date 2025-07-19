# DigiPIN India

## About DigiPIN
The Department of Posts has started a [new project](https://www.indiapost.gov.in/vas/Pages/digipin.aspx) to build a Digital Public Infrastructure (DPI) that will help create a standard and accurate way to identify addresses in India. As part of this project, they have developed something called DIGIPIN – a new digital system for addresses.

DIGIPIN is like a smart, digital version of a postal address. It uses geo-coding, which means it connects a place to its exact location on a map. This makes it much easier to find any home, shop, or office accurately, even in rural or remote areas.

<details><summary>More Information</summary>

This system is being built with help from IIT Hyderabad, NRSC, and ISRO, and is designed to be open-source, which means anyone can use it freely in their software or services.

DIGIPIN will be very useful for both the government and private companies. It will make it easier to deliver packages, provide emergency help, and offer services like banking, internet, and utilities. It also supports the idea of “Address as a Service (AaaS),” which means that people and businesses will be able to use and share verified address information digitally, just like we use online ID or eKYC today.

Overall, DIGIPIN is a big step towards making India more digital and connected. It will help link real-world places with their online identities, making services faster, smarter, and more efficient for everyone.

*DIGIPIN represents a major step toward India's digital infrastructure, providing the foundation for accurate, privacy-respecting, and universally accessible addressing for the digital age.*

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

const latLng = getLatLngFromDigiPin('4FK-5MK-9PPK') // Hyphens are optional
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

## How it Works
This is India's National Addressing Grid

DIGIPIN (Digital Postal Index Number) is India's revolutionary digital addressing system that assigns a unique 10-character alphanumeric code to every 4m x 4m area across the entire country. Think of it as giving every small plot of land in India its own digital "postal code."

**Example:** The DIGIPIN for Dak Bhawan (postal headquarters) is `39J-49L-L8T4`

DIGIPIN provides:
- **Precise Location**: Accurate to within 4 meters
- **Universal Coverage**: Works everywhere in India, including remote areas and sea
- **Permanent Addressing**: Doesn't change when roads are renamed or buildings demolished
- **Privacy-Friendly**: Contains no personal information
- **Offline Capability**: Works without internet connection


### The Grid System

<img width="1752" height="1081" alt="Image" src="https://github.com/user-attachments/assets/69adb651-49ea-4cb3-b91e-0fc9430e6a5e" />

Imagine India covered by an invisible grid, like graph paper:

1. **Coverage Area**: DIGIPIN covers all of India plus maritime zones
   - From 63.5° to 99.5° East longitude
   - From 2.5° to 38.5° North latitude

2. **Grid Size**: Each final grid cell is approximately 4m x 4m (about the size of a small room)

3. **Hierarchical Structure**: The system works like Russian nesting dolls - big areas contain smaller areas

### The 10-Level Hierarchy

DIGIPIN uses a **10-level zoom system**, like zooming into a map:

| Level | Grid Size | Real-World Equivalent |
|-------|-----------|----------------------|
| 1 | 1000 km | Entire regions |
| 2 | 250 km | Large states |
| 3 | 62.5 km | Districts |
| 4 | 15.6 km | Cities/Towns |
| 5 | 3.9 km | Neighborhoods |
| 6 | 1 km | Local areas |
| 7 | 250 m | City blocks |
| 8 | 60 m | Building complexes |
| 9 | 15 m | Individual buildings |
| 10 | 3.8 m | **Final precision** |


### The Character System

**The 16 Symbols**
DIGIPIN uses 16 carefully chosen characters: `2, 3, 4, 5, 6, 7, 8, 9, C, F, J, K, L, M, P, T`

**Why these characters?**
- Easy to read and pronounce
- No confusion between similar-looking letters (no O/0, I/1)
- Internationally recognizable
- Clear in both handwriting and digital text

### The Smart Labeling Pattern

At each level, the area is divided into a 4×4 grid (16 sections), labeled in a **spiral pattern**:

```
F  C  9  8
J  3  2  7
K  4  5  6
L  M  P  T
```

**Smart Design Features:**
- **Directional Logic**: Adjacent codes represent nearby locations
- **Spiral Pattern**: Numbers flow in a logical sequence
- **Predictable**: Once you understand the pattern, you can estimate directions

---

### How DIGIPIN is Generated

Let's trace how **Dak Bhawan** gets its DIGIPIN `39J-49L-L8T4`:

1. **Level 1**: India is divided into 16 large regions → Location falls in region `3`
2. **Level 2**: Region 3 is divided into 16 sub-regions → Location falls in sub-region `9`
3. **Level 3**: Continue dividing → Location falls in `J`
4. **Level 4**: Continue dividing → Location falls in `4`
5. **Level 5**: Continue dividing → Location falls in `9`
6. **Level 6**: Continue dividing → Location falls in `L`
7. **Level 7**: Continue dividing → Location falls in `L`
8. **Level 8**: Continue dividing → Location falls in `8`
9. **Level 9**: Continue dividing → Location falls in `T`
10. **Level 10**: Final precision → Location falls in `4`

**Result**: `39J-49L-L8T4` (hyphens added for readability)

### Key Properties

- **Reversible**: You can extract latitude/longitude from any DIGIPIN
- **Scalable**: Can provide less precise locations with fewer digits
- **Consistent**: Same method applies everywhere in India
- **Future-Proof**: Won't change even if roads or buildings change


### Code Structure
Every DIGIPIN has exactly **10 characters**:
- Format: `XXX-XXX-XXXX` (hyphens optional)
- Each position represents a specific zoom level
- Left to right = general to specific location

### Reading DIGIPIN Codes
- **First 3 characters**: Broad regional area
- **Next 3 characters**: Local district/city area
- **Last 4 characters**: Precise neighborhood and building location

### Proximity Understanding
- Similar starting characters = nearby locations
- Identical first 6 characters = within the same 1km area
- Identical first 9 characters = within the same 15m area

