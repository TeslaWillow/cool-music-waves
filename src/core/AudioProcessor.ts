import type { BaseVisualizerOptions } from "../types/visualizer";

export class AudioProcessor {
  private audioContext: AudioContext | null = null; // A Web Audio API class that manages audio nodes and processing
  private analyserNode: AnalyserNode | null = null; // An AudioNode that analyzes and outputs audio data
  private sourceNode: MediaElementAudioSourceNode | null = null; // An AudioNode that represents an audio element
  private frequencyData: Uint8Array<ArrayBuffer> | null = null; // An array that stores the frequency data of the audio

  public initialize(
    audioElement: HTMLAudioElement, // The audio element to analyze
    options: BaseVisualizerOptions = {}, // Options for the audio processor
  ): boolean {
    if (!audioElement) return false;

    const {
      fftSize = 256, // The size of the FFT (Fast Fourier Transform), which is the number of frequency bins
      smoothingTimeConstant = 0.8, // The smoothing time constant, which is the time constant of the low-pass filter
      minDecibels = -90, // The lower the value, the more sensitive the analyser is to quiet sounds
      maxDecibels = -30, // The higher the value, the more sensitive the analyser is to loud sounds (dB)
    } = options;

    if (!this.audioContext) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.audioContext = new AudioCtx();
    }

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    if (!this.analyserNode) {
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = fftSize;
      this.analyserNode.smoothingTimeConstant = smoothingTimeConstant;
      this.analyserNode.minDecibels = minDecibels;
      this.analyserNode.maxDecibels = maxDecibels;
    }

    if (!this.sourceNode) {
      this.sourceNode =
        this.audioContext.createMediaElementSource(audioElement);
      this.sourceNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);
    }

    this.frequencyData = new Uint8Array(this.analyserNode.frequencyBinCount);
    return true;
  }

  public getFrequencyData(): Uint8Array<ArrayBuffer> | null {
    if (!this.analyserNode || !this.frequencyData) {
      return null;
    }

    this.analyserNode.getByteFrequencyData(this.frequencyData);
    return this.frequencyData;
  }

  public cleanup(): void {
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.frequencyData = null;
  }
}
