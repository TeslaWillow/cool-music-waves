import { BaseRenderer } from "../base/BaseRenderer";
import type { BarsWaveOptions } from "../../types/visualizer";

export interface ExtendedBarsWaveOptions extends BarsWaveOptions {
  enableCaps?: boolean;
  capColor?: string;
  capHeight?: number;
  gravity?: number;
}

export class BarsWaveRenderer extends BaseRenderer<ExtendedBarsWaveOptions> {
  private capHeights: number[] = [];
  private capDropVelocities: number[] = [];

  public render(
    data: Uint8Array,
    width: number,
    height: number,
    options: ExtendedBarsWaveOptions,
  ): void {
    if (!data || data.length === 0) {
      return;
    }

    const {
      barColor = "#00ffcc",
      capColor = "#ffffff",
      barGap = 3,
      barWidth,
      enableCaps = true,
      capHeight = 2,
      gravity = 0.4,
    } = options;

    this.clearCanvas(width, height);

    const startIndex = 2;
    const usableLength = Math.floor((data.length - startIndex) * 0.7);
    const computedBarWidth = barWidth ?? width / usableLength - barGap;
    const padding = 15;
    const availableHeight = height - padding;

    // Inicializamos o reajustamos los buffers de físicas si cambia el número de barras
    if (this.capHeights.length !== usableLength) {
      this.capHeights = new Array(usableLength).fill(0);
      this.capDropVelocities = new Array(usableLength).fill(0);
    }

    let x = 0;

    for (let i = 0; i < usableLength; i++) {
      const dataIndex = startIndex + i;
      const currentBarHeight = (data[dataIndex] / 255) * availableHeight;

      // Render de la barra principal
      this.ctx.fillStyle = barColor;
      this.ctx.fillRect(
        x,
        height - currentBarHeight,
        computedBarWidth,
        currentBarHeight,
      );

      // Físicas del Cap (Gravedad)
      if (enableCaps) {
        if (currentBarHeight > this.capHeights[i]) {
          // Si la barra sube, empuja el cap inmediatamente
          this.capHeights[i] = currentBarHeight;
          this.capDropVelocities[i] = 0;
        } else {
          // Si la barra baja, aplicamos aceleración por gravedad al cap
          this.capDropVelocities[i] += gravity;
          this.capHeights[i] -= this.capDropVelocities[i];

          if (this.capHeights[i] < 0) {
            this.capHeights[i] = 0;
            this.capDropVelocities[i] = 0;
          }
        }

        // Render del Cap
        this.ctx.fillStyle = capColor;
        this.ctx.fillRect(
          x,
          height - this.capHeights[i] - capHeight,
          computedBarWidth,
          capHeight,
        );
      }

      x += computedBarWidth + barGap;

      if (x >= width) {
        break;
      }
    }
  }
}
