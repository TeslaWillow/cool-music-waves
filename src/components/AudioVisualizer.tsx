// ./src/components/AudioVisualizer.tsx

import React, { useRef, useEffect } from 'react';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { BarsWaveRenderer } from '../renderers/canvas/BarsWaveRenderer';
import { CircularWaveRenderer } from '../renderers/canvas/CircularWaveRenderer';
import { TunnelWaveRenderer } from '../renderers/webgl/TunnelWaveRenderer';
import type { AudioVisualizerProps } from '../types/visualizer';
import type { BaseRenderer } from '../renderers/base/BaseRenderer';

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
    audioElement,
    mode = 'circular',
    options = {},
    className = ''
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rendererRef = useRef<BaseRenderer<typeof options> | TunnelWaveRenderer | null>(null);
    const animationFrameId = useRef<number | null>(null);

    const { getAudioData } = useAudioAnalyzer(audioElement, options);

    // ResizeObserver to adapt the canvas to the size of the parent div
    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                canvas.width = width;
                canvas.height = height;
            }
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, [mode]);

    // Render loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        switch (mode) {
            case 'tunnel': {
                const gl = canvas.getContext('webgl') || (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
                if (!gl) return;
                rendererRef.current = new TunnelWaveRenderer(gl);
                break;
            }
            case 'bars': {
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                rendererRef.current = new BarsWaveRenderer(ctx);
                break;
            }
            case 'circular': {
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                rendererRef.current = new CircularWaveRenderer(ctx);
                break;
            }
            default:
                throw new Error(`Unsupported visualizer mode: ${mode}`);
        }

        const renderLoop = () => {
            const data = getAudioData();

            if (data && rendererRef.current) {
                rendererRef.current.render(data, canvas.width, canvas.height, options);
            }

            animationFrameId.current = requestAnimationFrame(renderLoop);
        };

        renderLoop();

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [getAudioData, mode, options]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{ width: '100%', height: '100%', position: 'relative' }}>
            <canvas
                key={mode === 'tunnel' ? 'webgl' : '2d'}
                ref={canvasRef}
                style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>
    );
};