import { BaseRenderer } from "../base/BaseRenderer";
import type { BarsWaveOptions } from "../../types/visualizer";

export class BarsWaveRenderer extends BaseRenderer<BarsWaveOptions> {
  public render(
    data: Uint8Array,
    width: number,
    height: number,
    options: BarsWaveOptions,
  ): void {
    if (!data || data.length === 0) return;

    const { barColor = "#00ffcc", barGap = 2, barWidth } = options;

    this.clearCanvas(width, height);

    // Omit the first 2-3 bins to eliminate 0Hz sub-bass saturation
    // Use 70% of the array because the upper bins are almost always inaudible silence
    const startIndex = 2;
    const usableLength = Math.floor((data.length - startIndex) * 0.7);

    const computedBarWidth = barWidth ?? width / usableLength - barGap;
    const padding = 5; // Prevents the tallest bar from touching the top edge
    const availableHeight = height - padding;

    let x = 0;

    for (let i = startIndex; i < startIndex + usableLength; i++) {
      const barHeight = (data[i] / 255) * availableHeight;

      this.ctx.fillStyle = barColor;
      this.ctx.fillRect(x, height - barHeight, computedBarWidth, barHeight);

      x += computedBarWidth + barGap;

      if (x >= width) {
        break;
      }
    }
  }
}
