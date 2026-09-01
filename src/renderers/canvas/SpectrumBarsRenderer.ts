import { BaseRenderer } from "../base/BaseRenderer";
import type { SpectrumBarsOptions } from "../../types/visualizer";

export class SpectrumBarsRenderer extends BaseRenderer<SpectrumBarsOptions> {
  private smoothedHeights: number[] = [];
  private peakHeights: number[] = [];

  public render(
    data: Uint8Array,
    width: number,
    height: number,
    options: SpectrumBarsOptions = {},
  ): void {
    if (!data || data.length === 0) {
      return;
    }

    const {
      mirrored = true,
      glowIntensity = 0.8,
      barGap = 1,
      reflection = true,
      decayRate = 0.12,
      gradientStops = [
        { stop: 0.0, color: "#00d4ff" }, // Cyan base
        { stop: 0.25, color: "#00ff44" }, // Neon lime green
        { stop: 0.6, color: "#77ff00" }, // Bright yellow-green
        { stop: 0.78, color: "#ff9900" }, // Vibrant orange
        { stop: 0.9, color: "#ff0033" }, // Fiery red
        { stop: 1.0, color: "#550000" }, // Dark crimson fade
      ],
    } = options;

    this.clearCanvas(width, height);

    // Reserve bottom space for baseline reflection if enabled
    const reflectionHeight = reflection ? Math.floor(height * 0.12) : 0;
    const mainHeight = height - reflectionHeight;
    const baselineY = mainHeight;

    // Use lower-to-mid frequency range for punchy response
    const startIndex = 1;
    const rawUsable = Math.floor((data.length - startIndex) * 0.7);

    // Number of columns to draw across half-screen (if mirrored) or full-screen
    const totalBars = mirrored ? Math.floor(rawUsable / 2) * 2 : rawUsable;
    const halfCount = mirrored ? totalBars / 2 : totalBars;

    // Initialize or adjust internal height tracking buffers
    if (this.smoothedHeights.length !== totalBars) {
      this.smoothedHeights = new Array(totalBars).fill(0);
      this.peakHeights = new Array(totalBars).fill(0);
    }

    // Process raw frequency data into target bar heights
    const targetHeights = new Array(totalBars).fill(0);

    for (let i = 0; i < totalBars; i++) {
      let dataIndex: number;
      if (mirrored) {
        // Map center outward: index 0 (center) -> bass; edges -> highs
        const distFromCenter = Math.abs(i - halfCount);
        dataIndex = startIndex + Math.floor(distFromCenter);
      } else {
        dataIndex = startIndex + i;
      }

      if (dataIndex < data.length) {
        const value = data[dataIndex] / 255;
        // Apply slight non-linear power curve for dynamic range boost
        targetHeights[i] = Math.pow(value, 1.15) * (mainHeight * 0.92);
      }
    }

    // Apply smooth exponential decay
    for (let i = 0; i < totalBars; i++) {
      if (targetHeights[i] > this.smoothedHeights[i]) {
        // Fast attack
        this.smoothedHeights[i] += (targetHeights[i] - this.smoothedHeights[i]) * 0.45;
      } else {
        // Smooth release / decay
        this.smoothedHeights[i] -= (this.smoothedHeights[i] - targetHeights[i]) * decayRate;
      }

      // Track high peaks for flame trail spikes
      if (this.smoothedHeights[i] > this.peakHeights[i]) {
        this.peakHeights[i] = this.smoothedHeights[i];
      } else {
        this.peakHeights[i] = Math.max(0, this.peakHeights[i] - 1.8);
      }
    }

    // Calculate bar dimensions
    const computedBarWidth = Math.max(1, (width - totalBars * barGap) / totalBars);

    // Create main spectrum linear gradient (Bottom to Top of canvas)
    const spectrumGradient = this.ctx.createLinearGradient(0, baselineY, 0, 0);
    gradientStops.forEach(({ stop, color }) => {
      spectrumGradient.addColorStop(Math.min(1, Math.max(0, stop)), color);
    });

    // --- PASS 1: Render Vertical Flame Glow Trails ---
    if (glowIntensity > 0) {
      this.ctx.save();
      this.ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < totalBars; i++) {
        const x = i * (computedBarWidth + barGap);
        const barH = this.smoothedHeights[i];
        const peakH = this.peakHeights[i];

        if (barH > 5) {
          const flareH = Math.min(mainHeight - barH, (peakH - barH) * 2.5 + barH * 0.35 * glowIntensity);
          const flareGradient = this.ctx.createLinearGradient(0, baselineY - barH, 0, baselineY - barH - flareH);
          flareGradient.addColorStop(0, "rgba(255, 120, 0, 0.45)");
          flareGradient.addColorStop(0.5, "rgba(255, 40, 0, 0.25)");
          flareGradient.addColorStop(1, "rgba(255, 0, 0, 0)");

          this.ctx.fillStyle = flareGradient;
          this.ctx.fillRect(x - 0.5, baselineY - barH - flareH, computedBarWidth + 1, flareH);
        }
      }
      this.ctx.restore();
    }

    // --- PASS 2: Render Main Spectrum Bars ---
    this.ctx.fillStyle = spectrumGradient;
    for (let i = 0; i < totalBars; i++) {
      const x = i * (computedBarWidth + barGap);
      const barH = this.smoothedHeights[i];

      if (barH > 0) {
        this.ctx.fillRect(x, baselineY - barH, computedBarWidth, barH);
      }
    }

    // --- PASS 3: Render Bottom Baseline Reflection (Ground Aura) ---
    if (reflection && reflectionHeight > 0) {
      this.ctx.save();
      const reflectionGradient = this.ctx.createLinearGradient(0, baselineY, 0, height);
      reflectionGradient.addColorStop(0, "rgba(255, 100, 0, 0.35)");
      reflectionGradient.addColorStop(0.4, "rgba(0, 212, 255, 0.2)");
      reflectionGradient.addColorStop(1, "rgba(0, 0, 0, 0.95)");

      this.ctx.fillStyle = reflectionGradient;
      for (let i = 0; i < totalBars; i++) {
        const x = i * (computedBarWidth + barGap);
        const refH = this.smoothedHeights[i] * 0.22;
        if (refH > 0) {
          this.ctx.fillRect(x, baselineY, computedBarWidth, Math.min(reflectionHeight, refH));
        }
      }
      this.ctx.restore();
    }
  }
}
