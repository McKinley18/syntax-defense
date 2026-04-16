import React, { useEffect, useState } from 'react';
import { StateManager, AppState } from '../core/StateManager';

export const PowerOn: React.FC = () => {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        console.log("[PowerOn] Animation Started");
        // ACT 0: CRT BOOT SEQUENCE
        // Phase 1: High-intensity ignition point (0.3s)
        const t1 = setTimeout(() => { console.log("[PowerOn] Phase 1"); setPhase(1); }, 300);
        // Phase 2: Rapid horizontal beam manifest (0.2s)
        const t2 = setTimeout(() => { console.log("[PowerOn] Phase 2"); setPhase(2); }, 600);
        // Phase 3: CRT "Snow" / Static burst during vertical expansion (0.4s)
        const t3 = setTimeout(() => { console.log("[PowerOn] Phase 3"); setPhase(3); }, 800);
        // Phase 4: Full manifest with subtle fade-in of background (0.2s)
        const t4 = setTimeout(() => { console.log("[PowerOn] Phase 4"); setPhase(4); }, 1200);
        
        const t5 = setTimeout(() => {
            console.log("[PowerOn] Transitioning to SYSTEM_CHECK");
            StateManager.instance.transitionTo(AppState.SYSTEM_CHECK);
        }, 1800);

        return () => {
            [t1, t2, t3, t4, t5].forEach(clearTimeout);
        };
    }, []);

    return (
        <div style={{
            backgroundColor: '#000',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 2000
        }}>
            {/* Phase 1: Ignition Point */}
            {phase === 1 && (
                <div style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    boxShadow: '0 0 30px 10px #fff',
                    filter: 'blur(1px)'
                }} />
            )}

            {/* Phase 2: Horizontal Beam */}
            {phase === 2 && (
                <div style={{
                    width: '100vw',
                    height: '2px',
                    backgroundColor: '#fff',
                    boxShadow: '0 0 15px 2px #fff',
                    position: 'absolute',
                    left: 0,
                    animation: 'beam-manifest 0.2s ease-out forwards, beam-flicker 0.05s infinite'
                }} />
            )}

            {/* Phase 3: Static Burst / Vertical Expansion */}
            {phase === 3 && (
                <div className="crt-static" style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#0a0a0a',
                    animation: 'v-expand 0.25s ease-out forwards',
                    position: 'relative'
                }}>
                    <div className="static-overlay" />
                </div>
            )}

            {/* Phase 4: Final Screen Ready */}
            {phase === 4 && (
                <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#050505',
                    boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
                }} />
            )}

            <style>{`
                @keyframes beam-manifest {
                    from { transform: scaleX(0); opacity: 0; }
                    to { transform: scaleX(1); opacity: 1; }
                }
                @keyframes beam-flicker {
                    0% { opacity: 0.8; transform: scaleY(0.9); }
                    100% { opacity: 1; transform: scaleY(1.1); }
                }
                @keyframes v-expand {
                    from { transform: scaleY(0.01); opacity: 0.5; }
                    to { transform: scaleY(1); opacity: 1; }
                }
                .crt-static {
                    background: repeating-linear-gradient(
                        0deg,
                        rgba(255,255,255,0.05),
                        rgba(255,255,255,0.05) 1px,
                        transparent 1px,
                        transparent 2px
                    );
                }
                .static-overlay {
                    position: absolute;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                    opacity: 0.1;
                    animation: noise-anim 0.2s infinite;
                }
                @keyframes noise-anim {
                    0% { transform: translate(0,0); }
                    10% { transform: translate(-5%,-5%); }
                    20% { transform: translate(-10%,5%); }
                    30% { transform: translate(5%,-10%); }
                    40% { transform: translate(-5%,15%); }
                    50% { transform: translate(-10%,5%); }
                    60% { transform: translate(15%,0); }
                    70% { transform: translate(0,10%); }
                    80% { transform: translate(-15%,0); }
                    90% { transform: translate(10%,5%); }
                    100% { transform: translate(5%,0); }
                }
            `}</style>
        </div>
    );
};
