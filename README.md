# 🎵 cool-music-waves

**cool-music-waves** is a modern and flexible React + TypeScript audio visualization library designed to create stunning real-time visualizers powered by Canvas 2D, WebGL, and Three.js.

Transform any HTML `<audio>` element into an interactive, reactive visual experience with multiple rendering modes—ranging from circular waves and spectrum bars to WebGL tunnels and 3D spheres.

---

## 🚀 Features

- 🎨 **6 Visualization Modes:**
  - `circular`: Dynamic circular bar waves expanding to the rhythm of the audio.
  - `bars`: Classic frequency equalizer bars customizable with color gradients.
  - `spectrumBars`: Flame-style spectrum bars with mirroring, bottom reflection, and smooth decay effects.
  - `waveform`: Real-time line wave / oscilloscope audio waveform.
  - `tunnel`: WebGL-accelerated 3D reactive tunnel.
  - `sphere3d`: Deformable 3D mesh sphere built on Three.js.
- 📐 **Fully Responsive:** Automatically adjusts canvas dimensions to match the parent container via `ResizeObserver`.
- ⚡ **Web Audio API:** High-performance real-time audio frequency analysis using Fast Fourier Transform (FFT).
- 🟦 **TypeScript First:** Complete type definitions and auto-completion for all renderer options.
- 🛠 **Modular:** Includes the `useAudioAnalyzer` custom hook and `AudioProcessor` class for building custom visualizers.

---

## 📦 Installation

Install the library in your project via npm, yarn, or pnpm:

```bash
npm install cool-music-waves three
```

> **Note:** `three` is a peer dependency required if you use the `sphere3d` rendering mode.

---

## 💻 Quick Start

Connect an HTML `<audio>` element ref to the `<AudioVisualizer />` component:

```tsx
import React, { useRef, useState, useEffect } from 'react';
import { AudioVisualizer } from 'cool-music-waves';

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      setAudioElement(audioRef.current);
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '400px', background: '#0a0a0a' }}>
      <audio ref={audioRef} controls src="/song.mp3" />
      
      <AudioVisualizer
        audioElement={audioElement}
        mode="circular"
        options={{
          barColor: '#00ffcc',
          fftSize: 128
        }}
      />
    </div>
  );
}
```

---

## 🎛 Visualization Modes & Examples

### 1. `circular` (Circular Waves)
Renders spectrum bars arranged in a circle expanding outwards from a central radius.

```tsx
<AudioVisualizer
  audioElement={audioElement}
  mode="circular"
  options={{
    barColor: '#ff007f',
    centerRadius: 60,
    maxBarHeight: 120,
    barWidth: 4,
    fftSize: 128,
  }}
/>
```

### 2. `bars` (Classic Spectrum Bars)
Classic frequency bar chart visualization supporting custom multi-color gradients.

```tsx
<AudioVisualizer
  audioElement={audioElement}
  mode="bars"
  options={{
    barColor: '#00e5ff',
    barGap: 3,
    barWidth: 6,
    gradientColors: ['#00e5ff', '#7000ff', '#ff007f'],
    fftSize: 256,
  }}
/>
```

### 3. `spectrumBars` (Advanced Flame Spectrum)
Ideal for rich equalizer displays. Features center mirroring, lower reflection, and peak decay smoothing.

```tsx
<AudioVisualizer
  audioElement={audioElement}
  mode="spectrumBars"
  options={{
    mirrored: true,
    reflection: true,
    glowIntensity: 15,
    decayRate: 0.9,
    gradientStops: [
      { stop: 0, color: '#00ffcc' },
      { stop: 0.5, color: '#ffcc00' },
      { stop: 1, color: '#ff0055' },
    ],
  }}
/>
```

### 4. `waveform` (Oscilloscope Line Waveform)
Renders a real-time line waveform (oscilloscope) with customizable stroke color, glow, scale, and optional bottom reflection.

```tsx
<AudioVisualizer
  audioElement={audioElement}
  mode="waveform"
  options={{
    strokeColor: '#ffffff',
    lineWidth: 2,
    glow: true,
    glowColor: '#00ffcc',
    glowBlur: 12,
    amplitudeScale: 1.2,
    reflection: true,
    reflectionOpacity: 0.3,
  }}
/>
```

### 5. `tunnel` (WebGL 3D Tunnel)
Renders a 3D audio-reactive tunnel utilizing hardware-accelerated WebGL.

```tsx
<AudioVisualizer
  audioElement={audioElement}
  mode="tunnel"
  options={{
    fftSize: 256,
  }}
/>
```

### 6. `sphere3d` (Three.js 3D Sphere)
Generates a 3D mesh sphere that dynamically deforms its geometry vertices according to audio frequencies.

```tsx
<AudioVisualizer
  audioElement={audioElement}
  mode="sphere3d"
  options={{
    color: '#00ffaa',
    wireframe: true,
    displacementFactor: 1.5,
    rotationSpeed: 0.005,
    radius: 2,
    detail: 32,
  }}
/>
```

---

## 📖 API Reference

### Component `<AudioVisualizer />`

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `audioElement` | `HTMLAudioElement \| null` | **Required** | Reference to the target HTML `<audio>` element. |
| `mode` | `VisualizerMode` | `'circular'` | Render mode (`'circular'`, `'bars'`, `'spectrumBars'`, `'waveform'`, `'tunnel'`, `'sphere3d'`). |
| `options` | `BaseVisualizerOptions` | `{}` | Configuration object tailored to the chosen mode. |
| `className` | `string` | `''` | Optional CSS class name for the wrapper element. |

---

### Base Options (`BaseVisualizerOptions`)
Applicable to all visualizer modes:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `fftSize` | `number` | `256` | FFT window size (must be a power of 2: 32, 64, 128, 256, 512, etc.). |
| `smoothingTimeConstant` | `number` | `0.8` | Smoothing time constant for the analyzer (`0.0` to `1.0`). |
| `minDecibels` | `number` | `-90` | Minimum decibels range for the audio analyzer. |
| `maxDecibels` | `number` | `-30` | Maximum decibels range for the audio analyzer. |

---

### Mode-Specific Options

#### 🔘 `CircularWaveOptions` (`mode="circular"`)
- `barColor` (`string`): Primary color of the bars (e.g., `#00ffcc`).
- `centerRadius` (`number`): Inner circle radius in pixels.
- `maxBarHeight` (`number`): Maximum height bars can extend.
- `barWidth` (`number`): Width of individual bars.

#### 📊 `BarsWaveOptions` (`mode="bars"`)
- `barColor` (`string`): Solid color of the bars.
- `barGap` (`number`): Gap between bars in pixels.
- `barWidth` (`number`): Width of individual bars.
- `gradientColors` (`string[]`): Array of colors for a vertical linear gradient.

#### 🔥 `SpectrumBarsOptions` (`mode="spectrumBars"`)
- `mirrored` (`boolean`): Symmetrically mirrors the spectrum outwards from the center.
- `reflection` (`boolean`): Renders a subtle downward floor reflection.
- `glowIntensity` (`number`): Glow intensity around the bars.
- `decayRate` (`number`): Peak height decay rate for smooth transitions.
- `gradientStops` (`Array<{ stop: number; color: string }>`): Custom color gradient stops.

#### 〰️ `WaveformOptions` (`mode="waveform"`)
- `strokeColor` (`string`): Color of the oscilloscope waveform line (`'#ffffff'`).
- `lineWidth` (`number`): Width/thickness of the line in pixels (`2`).
- `glow` (`boolean`): Enables shadow glow effect (`true`).
- `glowColor` (`string`): Color of the glow effect.
- `glowBlur` (`number`): Blur radius for glow (`10`).
- `amplitudeScale` (`number`): Height multiplier scale factor (`1.0`).
- `reflection` (`boolean`): Enables downward mirrored reflection wave (`false`).
- `reflectionOpacity` (`number`): Opacity for bottom reflection (`0.25`).

#### 🌐 `Sphere3DOptions` (`mode="sphere3d"`)
- `color` (`string`): Color of the 3D material.
- `wireframe` (`boolean`): Whether to render in wireframe mode.
- `displacementFactor` (`number`): Vertex displacement sensitivity based on audio volume.
- `rotationSpeed` (`number`): Continuous rotation speed around axes.
- `radius` (`number`): Base radius of the sphere.
- `detail` (`number`): Geometry subdivision/detail level.

---

## 🛠 Advanced Usage: `useAudioAnalyzer` Hook

To build custom visualizers or integrate Web Audio API frequency data into your own render engine:

```tsx
import { useEffect } from 'react';
import { useAudioAnalyzer } from 'cool-music-waves';

function CustomVisualizer({ audioElement }: { audioElement: HTMLAudioElement | null }) {
  const { getAudioData } = useAudioAnalyzer(audioElement, { fftSize: 128 });

  useEffect(() => {
    let animationId: number;

    const draw = () => {
      const frequencyData = getAudioData(); // Returns Uint8Array | null
      if (frequencyData) {
        // Custom rendering logic for Canvas / WebGL / Three.js
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [getAudioData]);

  return <canvas id="custom-canvas" />;
}
```

---

## 🛠 Local Development

To run or contribute to the library locally:

```bash
# Install dependencies
npm install

# Start local development demo server
npm run dev

# Build production bundle
npm run build
```

---

## 📄 License

MIT © 2026
