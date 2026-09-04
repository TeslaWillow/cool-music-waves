import { BaseRenderer } from "../base/BaseRenderer";
import type { WaveformOptions } from "../../types/visualizer";

export class WaveformRenderer extends BaseRenderer<WaveformOptions> {
  public render(
    data: Uint8Array,
    width: number,
    height: number,
    options: WaveformOptions,
  ): void {
    if (!data || data.length === 0) {
      return;
    }

    const {
      strokeColor = "#00ffcc",
      lineWidth = 2,
      glow = true,
      glowColor,
      glowBlur = 10,
      amplitudeScale = 0.5,
      reflection = false,
      reflectionOpacity = 0.25,
    } = options;

    this.clearCanvas(width, height);

    const sliceWidth = width / (data.length - 1);
    const centerY = height / 2;

    // Save context state for drawing main wave
    this.ctx.save();
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineJoin = "round";
    this.ctx.lineCap = "round";

    if (glow) {
      this.ctx.shadowColor = glowColor || strokeColor;
      this.ctx.shadowBlur = glowBlur;
    }

    // Draw main waveform
    this.ctx.beginPath();
    let x = 0;

    for (let i = 0; i < data.length; i++) {
      // Time-domain values range from 0 to 255 (128 is center/silence)
      const v = (data[i] - 128) / 128.0;
      const y = centerY + v * (height / 2) * amplitudeScale;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.ctx.stroke();
    this.ctx.restore();

    // Draw bottom reflection if enabled
    if (reflection) {
      this.ctx.save();
      this.ctx.globalAlpha = reflectionOpacity;
      this.ctx.lineWidth = lineWidth;
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineJoin = "round";
      this.ctx.lineCap = "round";

      if (glow) {
        this.ctx.shadowColor = glowColor || strokeColor;
        this.ctx.shadowBlur = glowBlur * 0.5;
      }

      this.ctx.beginPath();
      x = 0;

      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128.0;
        // Mirror wave vertically below the main wave
        const mirroredOffset = v * (height / 4) * amplitudeScale;
        const yReflection = centerY + height * 0.25 + mirroredOffset;

        if (i === 0) {
          this.ctx.moveTo(x, yReflection);
        } else {
          this.ctx.lineTo(x, yReflection);
        }

        x += sliceWidth;
      }

      this.ctx.stroke();
      this.ctx.restore();
    }
  }
}
