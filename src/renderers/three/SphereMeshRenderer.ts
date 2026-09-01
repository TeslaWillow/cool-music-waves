// ./src/renderers/three/SphereMeshRenderer.ts

import * as THREE from "three";
import type { Sphere3DOptions } from "../../types/visualizer";

export class SphereMeshRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private sphere: THREE.Mesh;
  private geometry: THREE.IcosahedronGeometry;
  private originalPositions: Float32Array;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();

    const width = canvas.clientWidth || canvas.width || 300;
    const height = canvas.clientHeight || canvas.height || 150;

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 2.5);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: false,
    });

    // Forzamos el viewport correcto desde el inicio
    this.renderer.setSize(width, height, false);
    this.renderer.setViewport(0, 0, width, height);

    this.geometry = new THREE.IcosahedronGeometry(1, 12);
    this.originalPositions = new Float32Array(
      this.geometry.attributes.position.array,
    );

    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });

    this.sphere = new THREE.Mesh(this.geometry, material);
    this.sphere.position.set(0, 0, 0);
    this.scene.add(this.sphere);
  }

  public render(
    data: Uint8Array,
    width: number,
    height: number,
    options: Sphere3DOptions,
  ): void {
    if (!data || data.length === 0 || width === 0 || height === 0) return;

    const {
      color = "#00ffcc",
      wireframe = true,
      displacementFactor = 0.6,
      rotationSpeed = 0.003,
    } = options;

    // Sincronizar dimensiones y proyectar camara al centro
    if (
      this.renderer.domElement.width !== width ||
      this.renderer.domElement.height !== height
    ) {
      this.renderer.setSize(width, height, false);
      this.renderer.setViewport(0, 0, width, height);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    const material = this.sphere.material as THREE.MeshBasicMaterial;
    if (color) {
      material.color.set(color);
    }
    material.wireframe = wireframe;

    this.sphere.rotation.x += rotationSpeed;
    this.sphere.rotation.y += rotationSpeed * 1.5;

    const positionAttribute = this.geometry.attributes.position;
    const vertexPositions = positionAttribute.array as Float32Array;
    const vertexCount = positionAttribute.count;

    const startIndex = 2;
    const usableLength = Math.floor((data.length - startIndex) * 0.6);

    for (let i = 0; i < vertexCount; i++) {
      const dataIndex = startIndex + (i % usableLength);
      const amplitude = data[dataIndex] / 255;

      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      const ox = this.originalPositions[ix];
      const oy = this.originalPositions[iy];
      const oz = this.originalPositions[iz];

      const displacement = 1 + amplitude * displacementFactor;

      vertexPositions[ix] = ox * displacement;
      vertexPositions[iy] = oy * displacement;
      vertexPositions[iz] = oz * displacement;
    }

    positionAttribute.needsUpdate = true;
    this.geometry.computeVertexNormals();

    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    this.geometry.dispose();
    (this.sphere.material as THREE.Material).dispose();
    this.renderer.dispose();
  }
}
