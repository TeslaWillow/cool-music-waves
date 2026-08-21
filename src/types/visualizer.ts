export type VisualizerMode = "circular" | "bars" | "tunnel";

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

// Audio visualizer props
export interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  mode?: VisualizerMode;
  options?: CircularWaveOptions | BarsWaveOptions;
  className?: string;
}
