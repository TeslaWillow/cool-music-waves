export type VisualizerMode = "circular" | "bars" | "spectrumBars" | "tunnel" | "sphere3d" | "waveform";

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

// Audio visualizer props
export interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  mode?: VisualizerMode;
  options?: CircularWaveOptions | BarsWaveOptions | SpectrumBarsOptions | WaveformOptions | Sphere3DOptions;
  className?: string;
}

