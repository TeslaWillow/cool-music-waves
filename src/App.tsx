// ./src/App.tsx

import { useRef, useEffect, useState } from 'react';
import { AudioVisualizer } from './components/AudioVisualizer';
import type { VisualizerMode } from './types/visualizer';

const audioMP3 = "/mp3/Custody, Just Isac, MADZI, SFRNG - No Way Back [NCS Release].mp3";

export function App() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
    const [mode, setMode] = useState<VisualizerMode>('circular');

    useEffect(() => {
        if (audioRef.current) {
            setAudioElement(audioRef.current);
        }
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
            <h2>Audio Visualizer Component Test</h2>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                <audio ref={audioRef} controls src={audioMP3} />

                <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as VisualizerMode)}
                    style={{
                        padding: '8px 16px',
                        background: '#00ffcc',
                        color: '#000',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        outline: 'none'
                    }}
                >
                    <option value="bars">Bars (Classic)</option>
                    <option value="spectrumBars">Spectrum Bars (Flame)</option>
                    <option value="circular">Circular</option>
                    <option value="waveform">Waveform (Oscilloscope)</option>
                    <option value="tunnel">Tunnel</option>
                    <option value="sphere3d">Sphere 3D</option>
                    <option value="wavePlane3d">3D Wave Plane (Terrain)</option>
                </select>
            </div>

            <div style={{
                width: '100%',
                maxWidth: '800px',
                height: '400px',
                border: '1px solid #333',
                borderRadius: '8px',
                overflow: 'hidden'
            }}>
                <AudioVisualizer
                    audioElement={audioElement}
                    mode={mode}
                    options={{ barColor: '#00ffcc', fftSize: 128 }}
                />
            </div>
        </div>
    );
}

export default App;