import type { BaseVisualizerOptions } from "../../types/visualizer";

export abstract class BaseRenderer<T extends BaseVisualizerOptions> {
  protected ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx; // The 2D rendering context for the canvas
  }

  public abstract render(
    data: Uint8Array, // Array that stores the frequency data of the audio
    width: number, // The width of the canvas
    height: number, // The height of the canvas
    options: T, // Options for the renderer
  ): void;

  protected clearCanvas(width: number, height: number): void {
    this.ctx.clearRect(0, 0, width, height);
  }
}
