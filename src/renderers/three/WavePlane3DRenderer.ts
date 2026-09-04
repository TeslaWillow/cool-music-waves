import * as THREE from "three";
import type { WavePlane3DOptions } from "../../types/visualizer";

export class WavePlane3DRenderer {
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private mainPlane: THREE.Mesh;
  private reflectionPlane: THREE.Mesh;
  private geometry: THREE.PlaneGeometry;
  private reflectionGeometry: THREE.PlaneGeometry;

  private gridSegmentsX = 48;
  private gridSegmentsY = 48;
  private historyMatrix: Float32Array[];

  // Mouse interaction & zoom state
  private targetMouseX = 0;
  private targetMouseY = 0;
  private currentMouseX = 0;
  private currentMouseY = 0;
  private zoomOffset = 0;

  // Debug HUD DOM Element
  private debugElement: HTMLDivElement | null = null;

  private handlePointerMove = (e: PointerEvent | MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      this.targetMouseX = Math.max(-1, Math.min(1, x));
      this.targetMouseY = Math.max(-1, Math.min(1, y));
    }
  };

  private handleWheel = (e: WheelEvent): void => {
    e.preventDefault();
    this.zoomOffset += e.deltaY * 0.005;
    this.zoomOffset = Math.max(-4.5, Math.min(30, this.zoomOffset));
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();

    const width = canvas.clientWidth || canvas.width || 300;
    const height = canvas.clientHeight || canvas.height || 150;

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 5.5);
    this.camera.lookAt(0, 0.2, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: false,
    });

    this.renderer.setSize(width, height, false);
    this.renderer.setViewport(0, 0, width, height);

    // Initial plane geometry (width=6, height=6)
    this.geometry = new THREE.PlaneGeometry(
      6,
      6,
      this.gridSegmentsX,
      this.gridSegmentsY,
    );
    this.reflectionGeometry = new THREE.PlaneGeometry(
      6,
      6,
      this.gridSegmentsX,
      this.gridSegmentsY,
    );

    const mainMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });

    const reflectionMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });

    this.mainPlane = new THREE.Mesh(this.geometry, mainMaterial);
    this.mainPlane.rotation.x = -Math.PI / 3;
    this.scene.add(this.mainPlane);

    this.reflectionPlane = new THREE.Mesh(
      this.reflectionGeometry,
      reflectionMaterial,
    );
    this.reflectionPlane.rotation.x = -Math.PI / 3;
    this.reflectionPlane.position.y = -1.2;
    this.scene.add(this.reflectionPlane);

    // Initialize history matrix for terrain wave propagation
    const rows = this.gridSegmentsY + 1;
    const cols = this.gridSegmentsX + 1;
    this.historyMatrix = Array.from(
      { length: rows },
      () => new Float32Array(cols),
    );

    // Listen to mouse pointer movement and mouse wheel zoom
    window.addEventListener("pointermove", this.handlePointerMove);
    this.canvas.addEventListener("wheel", this.handleWheel, {
      passive: false,
    });
  }

  public render(
    data: Uint8Array,
    width: number,
    height: number,
    options: WavePlane3DOptions,
  ): void {
    if (!data || data.length === 0 || width === 0 || height === 0) return;

    const {
      color = "#00ffcc",
      wireframe = true,
      amplitudeHeight = 1.4,
      reflection = false,
      reflectionOpacity = 0.25,
      rotationX = -Math.PI / 3,
      enableMouseControl = false,
      mouseSensitivity = 1.0,
      cameraPosition = [0, 0, 4],
      debugMode = false,
    } = options;

    // Sync viewport and camera aspect ratio
    if (
      this.renderer.domElement.width !== width ||
      this.renderer.domElement.height !== height
    ) {
      this.renderer.setSize(width, height, false);
      this.renderer.setViewport(0, 0, width, height);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    // Camera positioning based on cameraPosition option, mouse control, and wheel zoom
    const [baseX, baseY, baseZ] = cameraPosition;
    let finalX = baseX;
    let finalY = baseY;
    let finalZ = baseZ;

    if (enableMouseControl) {
      this.currentMouseX += (this.targetMouseX - this.currentMouseX) * 0.05;
      this.currentMouseY += (this.targetMouseY - this.currentMouseY) * 0.05;

      finalX += this.currentMouseX * 3.5 * mouseSensitivity;
      finalY += this.currentMouseY * 2.5 * mouseSensitivity;
    }

    // Apply scroll zoom multiplier along depth vector
    const currentDist =
      Math.sqrt(finalX * finalX + finalY * finalY + finalZ * finalZ) || 1;
    const newDist = Math.max(1.0, currentDist + this.zoomOffset);
    const zoomScale = newDist / currentDist;

    finalX *= zoomScale;
    finalY *= zoomScale;
    finalZ *= zoomScale;

    this.camera.position.set(finalX, finalY, finalZ);
    this.camera.lookAt(this.mainPlane.position);

    // Render debug HUD overlay showing exact camera coordinates if debugMode is enabled
    if (debugMode) {
      if (!this.debugElement && this.canvas.parentElement) {
        this.debugElement = document.createElement("div");
        this.debugElement.style.position = "absolute";
        this.debugElement.style.top = "10px";
        this.debugElement.style.left = "10px";
        this.debugElement.style.background = "rgba(0, 0, 0, 0.85)";
        this.debugElement.style.color = "#00ffcc";
        this.debugElement.style.fontFamily = "monospace";
        this.debugElement.style.fontSize = "12px";
        this.debugElement.style.padding = "6px 12px";
        this.debugElement.style.borderRadius = "4px";
        this.debugElement.style.border = "1px solid #00ffcc";
        this.debugElement.style.pointerEvents = "none";
        this.debugElement.style.zIndex = "99";
        this.canvas.parentElement.appendChild(this.debugElement);
      }
      if (this.debugElement) {
        this.debugElement.style.display = "block";
        this.debugElement.innerHTML = `🎥 <strong>Camera Position:</strong> [${finalX.toFixed(2)}, ${finalY.toFixed(2)}, ${finalZ.toFixed(2)}]`;
      }
    } else if (this.debugElement) {
      this.debugElement.style.display = "none";
    }

    // Update materials
    const mainMat = this.mainPlane.material as THREE.MeshBasicMaterial;
    mainMat.color.set(color);
    mainMat.wireframe = wireframe;

    const refMat = this.reflectionPlane.material as THREE.MeshBasicMaterial;
    refMat.color.set(color);
    refMat.wireframe = wireframe;
    refMat.opacity = reflectionOpacity;
    this.reflectionPlane.visible = reflection;

    this.mainPlane.rotation.x = rotationX;
    this.reflectionPlane.rotation.x = rotationX;

    const rows = this.gridSegmentsY + 1;
    const cols = this.gridSegmentsX + 1;

    // Shift history rows towards the back (propagation along Y)
    for (let r = rows - 1; r > 0; r--) {
      this.historyMatrix[r].set(this.historyMatrix[r - 1]);
    }

    // Map current audio data into front row (row 0) symmetrically or linearly
    const startIndex = 2;
    const usableLength = Math.floor((data.length - startIndex) * 0.75);

    for (let c = 0; c < cols; c++) {
      const sampleIdx =
        startIndex + Math.floor((c / (cols - 1)) * usableLength);
      const val = (data[sampleIdx] / 255) * amplitudeHeight;
      this.historyMatrix[0][c] = val;
    }

    // Apply history matrix to mesh vertex displacement (Z axis of plane)
    const posAttr = this.geometry.attributes.position;
    const refPosAttr = this.reflectionGeometry.attributes.position;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const index = r * cols + c;
        const h = this.historyMatrix[r][c];

        posAttr.setZ(index, h);
        refPosAttr.setZ(index, -h * 0.6);
      }
    }

    posAttr.needsUpdate = true;
    refPosAttr.needsUpdate = true;

    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    window.removeEventListener("pointermove", this.handlePointerMove);
    this.canvas.removeEventListener("wheel", this.handleWheel);

    if (this.debugElement && this.debugElement.parentElement) {
      this.debugElement.parentElement.removeChild(this.debugElement);
      this.debugElement = null;
    }

    this.geometry.dispose();
    this.reflectionGeometry.dispose();
    (this.mainPlane.material as THREE.Material).dispose();
    (this.reflectionPlane.material as THREE.Material).dispose();
    this.renderer.dispose();
  }
}
