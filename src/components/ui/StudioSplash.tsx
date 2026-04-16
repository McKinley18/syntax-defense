import React, { useEffect, useState, useRef } from 'react';
import { StateManager, AppState } from '../../core/StateManager';

export const StudioSplash: React.FC = () => {
    const [phase, setPhase] = useState(0); 
    const hasTransitioned = useRef(false);

    useEffect(() => {
        // Law: Studio Cinematic Timeline Refined
        // Phase 1: Start Transformation + Text Fade-in (0.5s)
        const t1 = setTimeout(() => setPhase(1), 500);
        
        // Phase 2: Hold (After transformation ends at 2.5s)
        const t2 = setTimeout(() => setPhase(2), 2500); 
        
        // Phase 3: Fade out Monolith & Logo (After 2s hold)
        const t3 = setTimeout(() => setPhase(3), 4500);

        // Phase 4: PRESENTS approach starts (Immediately after fade out starts)
        const t4 = setTimeout(() => setPhase(4), 4600);

        // Phase 5: Transition to Main Menu (2s hold after approach ends at 7.1s)
        const t5 = setTimeout(() => {
            if (!hasTransitioned.current) {
                hasTransitioned.current = true;
                StateManager.instance.transitionTo(AppState.MAIN_MENU);
            }
        }, 9000);

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
            overflow: 'hidden',
            position: 'relative',
            zIndex: 1000
        }}>
            {/* ACT 1: LOGO TRANSFORMATION & MONOLITH FADE-IN */}
            {phase < 4 && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    animation: phase === 3 ? 'fade-out-blur 0.6s forwards' : 'none'
                }}>
                    <div className="pillars-bg">
                        <div className={`pillar p1 ${phase >= 1 ? 'straight' : ''}`}></div>
                        <div className={`pillar p2 ${phase >= 1 ? 'straight' : ''}`}></div>
                        <div className={`pillar p3 ${phase >= 1 ? 'straight' : ''}`}></div>
                        <div className={`pillar p4 ${phase >= 1 ? 'straight' : ''}`}></div>
                    </div>
                    <h1 className={`manifest-text ${phase >= 1 ? 'fade-in' : ''}`}>MONOLITH</h1>
                </div>
            )}

            {/* ACT 2: PRESENTS APPROACH */}
            {phase === 4 && (
                <div className="approach-anim" style={{
                    animation: 'grow-approach 2.5s cubic-bezier(0.2, 0, 0.2, 1) forwards, fade-out-blur 0.6s 5s forwards'
                }}>
                    <h2 className="presents-text">PRESENTS</h2>
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

                /* Initial State: Skewed 'M' */
                .pillar.p1 { left: 0; height: 140px; }
                .pillar.p2 { left: 12px; height: 140px; transform: skewX(20.5deg); transform-origin: top left; }
                .pillar.p3 { right: 12px; height: 140px; transform: skewX(-20.5deg); transform-origin: top right; }
                .pillar.p4 { right: 0; height: 140px; }

                /* Target State: Straightened Monument */
                .pillar.p1.straight { transform: scaleY(0.714); }
                .pillar.p2.straight { transform: skewX(0deg); left: 42px; }
                .pillar.p3.straight { transform: skewX(0deg); right: 42px; }
                .pillar.p4.straight { transform: scaleY(0.714); }

                .manifest-text {
                    font-size: 4rem; font-weight: 900; letter-spacing: 25px; color: #fff;
                    margin: 0; padding: 0; text-shadow: 0 0 20px rgba(255,255,255,0.4);
                    opacity: 0;
                }

                .manifest-text.fade-in {
                    animation: text-fade-in 2s forwards;
                }

                .approach-anim {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    animation: grow-approach 2.5s cubic-bezier(0.2, 0, 0.2, 1) forwards;
                }

                .presents-text {
                    font-size: 3.5rem; font-weight: 300; letter-spacing: 35px; color: #fff;
                    margin: 0; padding: 0;
                }

                @keyframes text-fade-in {
                    from { opacity: 0; filter: blur(10px); }
                    to { opacity: 1; filter: blur(0); }
                }

                @keyframes grow-approach {
                    from { transform: scale(0.1); filter: blur(30px); opacity: 0; }
                    to { transform: scale(1); filter: blur(0); opacity: 1; }
                }

                @keyframes fade-out-blur {
                    to { opacity: 0; filter: blur(20px); transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
};
