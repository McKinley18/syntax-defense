import React, { useEffect, useState, useRef } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { AudioManager } from '../systems/AudioManager';

export const StudioSplash: React.FC = () => {
    const [phase, setPhase] = useState(0); 
    const hasTransitioned = useRef(false);

    useEffect(() => {
        // Subtle hardware hum on entry
        AudioManager.getInstance().resume().then(() => {
            AudioManager.getInstance().triggerTonedBlip(60, 2000, 0.15, 1.5, 'sine');
        });

        // ACT 1: MONOLITH Transformation
        const t1 = setTimeout(() => setPhase(1), 500);
        
        // ACT 2: PRESENTS Manifestation
        const t2 = setTimeout(() => setPhase(2), 3000); 
        
        // ACT 3: PURGE & TRANSITION (Clean handoff to Main Menu)
        const t3 = setTimeout(() => setPhase(3), 5500);

        const t4 = setTimeout(() => {
            if (!hasTransitioned.current) {
                hasTransitioned.current = true;
                StateManager.instance.recordIntroSeen(); // PERSIST JOURNEY
                StateManager.instance.transitionTo(AppState.MAIN_MENU);
            }
        }, 6200);

        return () => {
            [t1, t2, t3, t4].forEach(clearTimeout);
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
            overflow: 'hidden',
            position: 'relative',
            zIndex: 1000
        }}>
            {/* BRANDING BLOCK */}
            {phase < 3 && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transform: 'translateY(-3rem)',
                    animation: phase === 3 ? 'fade-out-blur 0.6s forwards' : 'none'
                }}>
                    <div className="pillars-bg">
                        <div className={`pillar p1 ${phase >= 1 ? 'straight' : ''}`}></div>
                        <div className={`pillar p2 ${phase >= 1 ? 'straight' : ''}`}></div>
                        <div className={`pillar p3 ${phase >= 1 ? 'straight' : ''}`}></div>
                        <div className={`pillar p4 ${phase >= 1 ? 'straight' : ''}`}></div>
                    </div>
                    <h1 className={`manifest-text ${phase >= 1 ? 'fade-in' : ''}`}>MONOLITH</h1>
                    
                    <div className={`presents-container ${phase >= 2 ? 'fade-in-approach' : ''}`}>
                        <h2 className="presents-text">PRESENTS</h2>
                    </div>
                </div>
            )}

            <style>{`
                .pillars-bg {
                    position: relative;
                    width: 140px;
                    height: 140px;
                    margin-bottom: 25px;
                }

                .pillar {
                    position: absolute;
                    width: 16px;
                    background: #00ffff;
                    box-shadow: 0 0 30px #00ffff;
                    border-radius: 1px;
                    transition: all 2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .pillar.p1 { left: 0; height: 140px; }
                .pillar.p2 { left: 12px; height: 140px; transform: skewX(20.5deg); transform-origin: top left; }
                .pillar.p3 { right: 12px; height: 140px; transform: skewX(-20.5deg); transform-origin: top right; }
                .pillar.p4 { right: 0; height: 140px; }

                .pillar.p1.straight { transform: scaleY(0.714); }
                .pillar.p2.straight { transform: skewX(0deg); left: 42px; }
                .pillar.p3.straight { transform: skewX(0deg); right: 42px; }
                .pillar.p4.straight { transform: scaleY(0.714); }

                .manifest-text {
                    font-size: 3.5rem; font-weight: 900; letter-spacing: 20px; color: #fff;
                    margin: 0; padding: 0; text-shadow: 0 0 20px rgba(255,255,255,0.4);
                    opacity: 0;
                }

                .manifest-text.fade-in {
                    animation: text-fade-in 1.5s forwards;
                }

                .presents-container {
                    opacity: 0;
                    margin-top: 1rem;
                }

                .presents-container.fade-in-approach {
                    animation: presents-reveal 2s cubic-bezier(0.2, 0, 0.2, 1) forwards;
                }

                .presents-text {
                    font-size: 2rem; font-weight: 300; letter-spacing: 30px; color: #fff;
                    margin: 0; padding: 0;
                }

                @keyframes text-fade-in {
                    from { opacity: 0; filter: blur(10px); }
                    to { opacity: 1; filter: blur(0); }
                }

                @keyframes presents-reveal {
                    from { transform: scale(0.5); opacity: 0; filter: blur(10px); }
                    to { transform: scale(1); opacity: 1; filter: blur(0); }
                }

                @keyframes fade-out-blur {
                    to { opacity: 0; filter: blur(20px); transform: translateY(-5rem) scale(1.1); }
                }
            `}</style>
        </div>
    );
};
