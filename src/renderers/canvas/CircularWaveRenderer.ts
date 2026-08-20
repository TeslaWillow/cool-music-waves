// ./src/renderers/canvas/CircularWaveRenderer.ts

import { BaseRenderer } from "../base/BaseRenderer";
import type { CircularWaveOptions } from "../../types/visualizer";

export class CircularWaveRenderer extends BaseRenderer<CircularWaveOptions> {
  public render(
    data: Uint8Array,
    width: number,
    height: number,
    options: CircularWaveOptions,
  ): void {
    if (!data || data.length === 0) {
      return;
    }

    const {
      barColor = "#00ffcc",
      centerRadius = 60,
      maxBarHeight = 80,
      barWidth = 3,
    } = options;

    this.clearCanvas(width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    const startIndex = 2;
    // Tomamos la mitad del rango utilizable para duplicarlo de forma simétrica
    const halfLength = Math.floor((data.length - startIndex) * 0.4);
    const angleStep = Math.PI / halfLength;

    this.ctx.fillStyle = barColor;

    for (let i = 0; i < halfLength; i++) {
      const dataIndex = startIndex + i;
      const amplitude = data[dataIndex] / 255;
      const barHeight = amplitude * maxBarHeight;

      // Right side (from -90° to +90°)
      const angleRight = i * angleStep - Math.PI / 2;
      // Left side (from -90° to -270°)
      const angleLeft = -Math.PI / 2 - i * angleStep;

      this.drawRadialBar(
        centerX,
        centerY,
        angleRight,
        centerRadius,
        barHeight,
        barWidth,
        barColor,
      );
      this.drawRadialBar(
        centerX,
        centerY,
        angleLeft,
        centerRadius,
        barHeight,
        barWidth,
        barColor,
      );
    }

    // Círculo central
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
    this.ctx.strokeStyle = barColor;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  private drawRadialBar(
    centerX: number,
    centerY: number,
    angle: number,
    radius: number,
    barHeight: number,
    barWidth: number,
    color: string,
  ): void {
    if (barHeight <= 0) return;

    const xStart = centerX + Math.cos(angle) * radius;
    const yStart = centerY + Math.sin(angle) * radius;
    const xEnd = centerX + Math.cos(angle) * (radius + barHeight);
    const yEnd = centerY + Math.sin(angle) * (radius + barHeight);

    this.ctx.beginPath();
    this.ctx.moveTo(xStart, yStart);
    this.ctx.lineTo(xEnd, yEnd);
    this.ctx.lineWidth = barWidth;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }
}
