import type { BaseVisualizerOptions } from "../../types/visualizer";

export interface TunnelWaveOptions extends BaseVisualizerOptions {
  tunnelColor?: [number, number, number];
  speed?: number;
}

export class TunnelWaveRenderer {
  private gl: WebGLRenderingContext; // The 2D rendering context for the canvas
  private program: WebGLProgram | null = null; // The WebGL program for the tunnel
  private texture: WebGLTexture | null = null; // The WebGL texture for the tunnel
  private timeLocation: WebGLUniformLocation | null = null; // The WebGL uniform location for the tunnel
  private startTime: number = Date.now(); // The start time of the tunnel

  private vsSource = `
    attribute vec2 a_position; // The WebGL attribute for the tunnel
    varying vec2 v_uv; // Varying for the UV coordinates
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  private fsSource = `
    precision mediump float; // Precision for the shader
    varying vec2 v_uv; // Varying for the UV coordinates
    uniform sampler2D u_audioTexture; // The WebGL texture for the tunnel
    uniform float u_time; // The WebGL uniform location for the tunnel
    uniform vec3 u_color; // The WebGL uniform location for the tunnel

    void main() {
      vec2 uv = v_uv - 0.5;
      
      // Polar coordinates
      float r = length(uv); // r = radius
      float angle = atan(uv.y, uv.x); //  θ = angle

      // Depth mapping and audio reading
      float z = 0.1 / (r + 0.05) + u_time * 0.5;
      float audioVal = texture2D(u_audioTexture, vec2(abs(angle) / 3.14159, 0.0)).r;

      // Distortion wave effect
      float wave = sin(z * 10.0 + audioVal * 5.0) * 0.5 + 0.5;
      vec3 finalColor = u_color * wave * (audioVal + 0.2) / (r * 3.0);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.initShaders();
    this.initTexture();
  }

  private initShaders(): void {
    const gl = this.gl;
    const vs = this.compileShader(gl.VERTEX_SHADER, this.vsSource);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, this.fsSource);

    if (!vs || !fs) return;

    this.program = gl.createProgram();
    if (!this.program) return;

    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    // Quad geometry setup
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    this.timeLocation = gl.getUniformLocation(this.program, "u_time");
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private initTexture(): void {
    const gl = this.gl;
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  public render(
    data: Uint8Array,
    width: number,
    height: number,
    options: TunnelWaveOptions,
  ): void {
    if (!this.program || !data || data.length === 0) return;

    const gl = this.gl;
    gl.viewport(0, 0, width, height);

    // Pasar array FFT a la textura de WebGL 1D/2D
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.LUMINANCE,
      data.length,
      1,
      0,
      gl.LUMINANCE,
      gl.UNSIGNED_BYTE,
      data,
    );

    gl.useProgram(this.program);

    const elapsedTime =
      (Date.now() - this.startTime) * 0.001 * (options.speed ?? 1.0);
    gl.uniform1f(this.timeLocation, elapsedTime);

    const colorLocation = gl.getUniformLocation(this.program, "u_color");
    const [r, g, b] = options.tunnelColor ?? [0.0, 1.0, 0.8];
    gl.uniform3f(colorLocation, r, g, b);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
