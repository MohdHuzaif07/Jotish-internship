# High-Performance Employee Insights Dashboard

A technical demonstration of a 4-screen React application built for the **Jotish Internship Assignment**. This project focuses on "Engineering Depth," implementing hardware APIs and performance optimizations without external UI or utility libraries.

## 🚀 Core Features

- **Screen 1: Persistent Authentication**: Secure login with `localStorage` persistence and basic email validation.
- **Screen 2: High-Performance Grid**: A custom virtualized list handling 1,000+ records at 60fps.
- **Screen 3: Identity Verification**: Hardware integration using the **MediaDevices API** and **HTML5 Canvas** for programmatic image merging.
- **Screen 4: Data Insights**: Custom **SVG-based** data visualization and geospatial office status mapping.

---

## 🛠️ Technical Deep Dive

### 1. Custom List Virtualization (Engineering Depth)
Instead of rendering all 1,000 employees (which would cause significant DOM lag), I implemented a custom virtualization engine.
- **The Math**: 
  - Calculated the `startIndex` and `endIndex` based on the `scrollTop` offset and a fixed `rowHeight` (60px).
  - Used `visibleData = MOCK_DATA.slice(startIndex, endIndex)` to render only 10-12 rows at a time.
  - Applied a `translateY` transform to the container to position the visible window correctly within a high-spacer `div`.
- **Outcome**: Reduced DOM nodes by **98%**, ensuring smooth scrolling even on low-end hardware.

### 2. Programmatic Image Merging
To fulfill the "Audit Image" requirement:
- Captured a raw video frame using `canvas.drawImage()`.
- Implemented a drawing layer where mouse/touch coordinates are mapped to a secondary canvas.
- **The Merge**: Used a background canvas to composite the Photo (JPEG) and Signature (PNG) into a single unified DataURL.

### 3. SVG Salary Distribution
Constructed a bar chart using raw `<svg>`, `<rect>`, and `<g>` tags. 
- Implemented dynamic scaling: `(value / max_value) * chart_height`.
- Added CSS-based transitions for the "grow" effect on hover without using heavy charting libraries like Chart.js.

---

## 🐛 Documented Intentional Bug
**Type:** Stale Closure in `useEffect`.
**Location:** `App.jsx` (System Heartbeat / Count Interval)

**Description:**
I have purposefully implemented a `setInterval` inside a `useEffect` that logs a state variable (`count`). The dependency array is empty `[]`. 

**Why it’s a bug:**
This creates a **Stale Closure**. The effect captures the initial value of `count` (0) when the component mounts. Even if the state is updated elsewhere in the app, the interval will continue to log `0` because it was never "re-synchronized" with the updated state. This demonstrates an understanding of how React handles scope and the importance of the dependency array.