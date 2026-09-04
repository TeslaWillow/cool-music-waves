import { useEffect, useRef } from "react";
import { AudioProcessor } from "../core/AudioProcessor";
import type { BaseVisualizerOptions } from "../types/visualizer";

export function useAudioAnalyzer(
  audioElement: HTMLAudioElement | null,
  options: BaseVisualizerOptions = {},
) {
  const processorRef = useRef<AudioProcessor>(new AudioProcessor());
  const isInitializedRef = useRef<boolean>(false);

  const { fftSize, smoothingTimeConstant, minDecibels, maxDecibels } = options;

  useEffect(() => {
    if (!audioElement) return;

    const processor = processorRef.current;

    const initProcessor = () => {
      if (isInitializedRef.current) return;

      const success = processor.initialize(audioElement, {
        fftSize,
        smoothingTimeConstant,
        minDecibels,
        maxDecibels,
      });
      if (success) {
        isInitializedRef.current = true;
      }
    };

    // Browsers require user interaction to play audio with Web Audio API
    audioElement.addEventListener("play", initProcessor);

    return () => {
      audioElement.removeEventListener("play", initProcessor);
      processor.cleanup();
      isInitializedRef.current = false;
    };
  }, [audioElement, fftSize, smoothingTimeConstant, minDecibels, maxDecibels]);

  const getAudioData = (
    dataType: "frequency" | "timeDomain" = "frequency",
  ): Uint8Array | null => {
    if (dataType === "timeDomain") {
      return processorRef.current.getTimeDomainData();
    }
    return processorRef.current.getFrequencyData();
  };

  return { getAudioData };
}
