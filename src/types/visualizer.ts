export type VisualizerMode =
  | "circular"
  | "bars"
  | "spectrumBars"
  | "tunnel"
  | "sphere3d"
  | "waveform"
  | "wavePlane3d";

// Base type options
export interface BaseVisualizerOptions {
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
}

// Circular graph type options
export interface CircularWaveOptions extends BaseVisualizerOptions {
  barColor?: string;
  centerRadius?: number;
  maxBarHeight?: number;
  barWidth?: number;
}

// Bars graph type options
export interface BarsWaveOptions extends BaseVisualizerOptions {
  barColor?: string;
  barGap?: number;
  barWidth?: number;
  gradientColors?: string[];
}

// Spectrum / Flame Bars options
export interface SpectrumBarsOptions extends BaseVisualizerOptions {
  mirrored?: boolean;
  glowIntensity?: number;
  barGap?: number;
  gradientStops?: Array<{ stop: number; color: string }>;
  reflection?: boolean;
  decayRate?: number;
}

// Oscilloscope / Waveform options
export interface WaveformOptions extends BaseVisualizerOptions {
  strokeColor?: string;
  lineWidth?: number;
  glow?: boolean;
  glowColor?: string;
  glowBlur?: number;
  amplitudeScale?: number;
  reflection?: boolean;
  reflectionOpacity?: number;
}

// 3D Sphere graph type options
export interface Sphere3DOptions extends BaseVisualizerOptions {
  color?: string;
  wireframe?: boolean;
  displacementFactor?: number;
  rotationSpeed?: number;
  radius?: number;
  detail?: number;
}

// 3D Wave Plane graph type options
export interface WavePlane3DOptions extends BaseVisualizerOptions {
  color?: string;
  wireframe?: boolean;
  gridSegmentsX?: number;
  gridSegmentsY?: number;
  amplitudeHeight?: number;
  speed?: number;
  reflection?: boolean;
  reflectionOpacity?: number;
  rotationX?: number;
  enableMouseControl?: boolean;
  mouseSensitivity?: number;
  cameraPosition?: [number, number, number];
  debugMode?: boolean;
}

// Audio visualizer props
export interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  mode?: VisualizerMode;
  options?:
    | CircularWaveOptions
    | BarsWaveOptions
    | SpectrumBarsOptions
    | WaveformOptions
    | Sphere3DOptions
    | WavePlane3DOptions;
  className?: string;
}


