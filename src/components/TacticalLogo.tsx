import React from 'react';

/**
 * TACTICAL LOGO v92.0: Authoritative Branding Module
 * DESIGN: Abreast-Rail Typography with Chromatic Aberration.
 */
export const TacticalLogo: React.FC = () => {
    return (
        <div className="logo-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            userSelect: 'none',
            padding: '2rem'
        }}>
            {/* BACKGROUND GLYPH: SYNCED RAILS */}
            <div className="logo-rails" style={{ position: 'absolute', inset: 0, opacity: 0.15, zIndex: -1 }}>
                <div className="rail rail-top" />
                <div className="rail rail-bottom" />
            </div>

            {/* PRIMARY TEXT: SYNTAX */}
            <div className="logo-text-main" style={{
                fontSize: '4.5rem',
                fontWeight: 900,
                letterSpacing: '0.8rem',
                color: '#fff',
                textTransform: 'uppercase',
                position: 'relative',
                lineHeight: 1
            }}>
                <span className="glitch-layer" data-text="SYNTAX">SYNTAX</span>
            </div>

            {/* SECONDARY TEXT: DEFENSE */}
            <div className="logo-text-sub" style={{
                fontSize: '1.8rem',
                fontWeight: 300,
                letterSpacing: '1.4rem',
                color: 'var(--neon-cyan)',
                textTransform: 'uppercase',
                marginTop: '0.5rem',
                marginLeft: '1.4rem', // Center alignment adjustment for kerning
                opacity: 0.8,
                borderTop: '1px solid rgba(0,255,255,0.3)',
                paddingTop: '0.4rem'
            }}>
                DEFENSE
            </div>

            <style>{`
                .logo-container {
                    animation: logo-entry 1.5s cubic-bezier(0.1, 0, 0.1, 1) forwards;
                }

                .logo-text-main {
                    text-shadow: 
                        2px 0 #ff3300, 
                        -2px 0 #00ffff;
                    animation: chromatic-jitter 4s infinite alternate-reverse;
                }

                .glitch-layer::before, .glitch-layer::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                }

                .glitch-layer::before {
                    left: 2px;
                    text-shadow: -2px 0 #ff00c1;
                    clip: rect(44px, 450px, 56px, 0);
                    animation: glitch-anim 5s infinite linear alternate-reverse;
                }

                .glitch-layer::after {
                    left: -2px;
                    text-shadow: -2px 0 #00fff9;
                    clip: rect(44px, 450px, 56px, 0);
                    animation: glitch-anim2 1s infinite linear alternate-reverse;
                }

                .logo-rails {
                    display: flex;
                    flex-direction: column;
                    gap: 40px;
                    align-items: center;
                    justify-content: center;
                }

                .rail {
                    width: 50vw;
                    height: 2px;
                    background: var(--neon-cyan);
                    box-shadow: 0 0 20px var(--neon-cyan);
                }

                .rail-top { animation: rail-slide-r 8s infinite ease-in-out; }
                .rail-bottom { animation: rail-slide-l 8s infinite ease-in-out; }

                @keyframes rail-slide-r {
                    0%, 100% { transform: translateX(-10%); }
                    50% { transform: translateX(10%); }
                }

                @keyframes rail-slide-l {
                    0%, 100% { transform: translateX(10%); }
                    50% { transform: translateX(-10%); }
                }

                @keyframes logo-entry {
                    from { opacity: 0; transform: scale(1.1) translateY(2rem); filter: blur(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
                }

                @keyframes chromatic-jitter {
                    0% { text-shadow: 1px 0 #ff3300, -1px 0 #00ffff; }
                    2% { text-shadow: 4px 0 #ff3300, -4px 0 #00ffff; }
                    4% { text-shadow: 1px 0 #ff3300, -1px 0 #00ffff; }
                    100% { text-shadow: 1px 0 #ff3300, -1px 0 #00ffff; }
                }

                @keyframes glitch-anim {
                    0% { clip: rect(10px, 9999px, 20px, 0); }
                    20% { clip: rect(40px, 9999px, 50px, 0); }
                    40% { clip: rect(10px, 9999px, 80px, 0); }
                    60% { clip: rect(90px, 9999px, 100px, 0); }
                    80% { clip: rect(20px, 9999px, 60px, 0); }
                    100% { clip: rect(40px, 9999px, 30px, 0); }
                }

                @keyframes glitch-anim2 {
                    0% { clip: rect(60px, 9999px, 70px, 0); }
                    50% { clip: rect(30px, 9999px, 40px, 0); }
                    100% { clip: rect(80px, 9999px, 90px, 0); }
                }
            `}</style>
        </div>
    );
};
