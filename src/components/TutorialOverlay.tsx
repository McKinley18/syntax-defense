import React, { useState, useEffect } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { EnemyType, VISUAL_REGISTRY } from '../VisualRegistry';

export interface ITutorialWaveManager {
    generateIntel(wave: number): void;
}

export enum TutorialStage {
    OFF,
    WELCOME,
    SELECT_TURRET,
    UPGRADE_BRIEFING,
    START_WAVE,
    VICTORY_BRIEF,
    UPGRADE_DETAIL,
    VIRAL_INTEL,
    KERNEL_VITALITY,
    SESSION_READY,
    COMPLETE
}

const VirusIcon = ({ type, color }: { type: EnemyType, color: string }) => {
    switch(type) {
        case EnemyType.GLIDER: return <svg viewBox="0 0 20 20" width="24" height="24"><path d="M10 2 L18 16 L10 13 L2 16 Z" fill={color} /></svg>;
        case EnemyType.STRIDER: return <svg viewBox="0 0 20 20" width="24" height="24"><path d="M10 2 L17 6 V14 L10 18 L3 14 V6 Z" fill={color} /></svg>;
        case EnemyType.BEHEMOTH: return <svg viewBox="0 0 20 20" width="24" height="24"><rect x="4" y="4" width="12" height="12" fill={color} transform="rotate(45 10 10)" /></svg>;
        case EnemyType.FRACTAL: return <svg viewBox="0 0 20 20" width="24" height="24"><path d="M4 10 H16 M10 4 V16 M6 6 L14 14 M14 6 L6 14" stroke={color} strokeWidth="2" /></svg>;
        case EnemyType.PHANTOM: return <svg viewBox="0 0 20 20" width="24" height="24"><circle cx="10" cy="10" r="7" stroke={color} strokeWidth="1" strokeDasharray="2,2" fill="none" /><circle cx="10" cy="10" r="2" fill={color} /></svg>;
        case EnemyType.WORM: return <svg viewBox="0 0 20 20" width="24" height="24"><rect x="4" y="2" width="12" height="16" rx="2" fill={color} /></svg>;
        default: return null;
    }
};

const KernelIcon = () => (
    <svg viewBox="0 0 40 40" width="32" height="32">
        <circle cx="20" cy="20" r="10" stroke="var(--neon-cyan)" fill="none" strokeWidth="2" />
        <circle cx="20" cy="20" r="4" fill="var(--neon-cyan)" />
        <ellipse cx="20" cy="20" rx="18" ry="6" stroke="var(--neon-cyan)" fill="none" strokeWidth="1" strokeOpacity="0.5" />
        <ellipse cx="20" cy="20" rx="6" ry="18" stroke="var(--neon-cyan)" fill="none" strokeWidth="1" strokeOpacity="0.5" />
    </svg>
);

export const TutorialOverlay: React.FC<{ waveManager?: ITutorialWaveManager }> = ({ waveManager }) => {
    const [stage, setStage] = useState<TutorialStage>(TutorialStage.OFF);
    const [isVisible, setIsVisible] = useState(false);
    const [isForceHidden, setIsForceHidden] = useState(false);

    const TUTORIAL_KEY = 'syndef_tutorial_v19'; // V19 Sophisticated Engine

    useEffect(() => {
        const checkInit = () => {
            const hasSeen = localStorage.getItem(TUTORIAL_KEY);
            const wave = StateManager.instance.currentWave;
            
            if (!hasSeen && wave === 0 && stage === TutorialStage.OFF) {
                setStage(TutorialStage.WELCOME);
                setIsVisible(true);
            }
        };
        
        checkInit();
        const itv = setInterval(checkInit, 500);
        return () => clearInterval(itv);
    }, [stage]);

    useEffect(() => {
        if (!isVisible) return;

        const monitor = setInterval(() => {
            const selected = StateManager.instance.selectedTurretType;
            const credits = StateManager.instance.credits;
            const wave = StateManager.instance.currentWave;

            if (stage === TutorialStage.SELECT_TURRET) {
                if (selected !== null && !isForceHidden) setIsForceHidden(true);
                if (credits < 500) {
                    setStage(TutorialStage.UPGRADE_BRIEFING);
                    setIsForceHidden(false);
                }
            }

            if (stage === TutorialStage.START_WAVE && StateManager.instance.currentState === AppState.GAME_WAVE) {
                setStage(TutorialStage.VICTORY_BRIEF);
                setIsForceHidden(true); 
            }

            if (stage === TutorialStage.VICTORY_BRIEF && wave === 1) {
                setIsForceHidden(false);
            }
        }, 200);
        return () => clearInterval(monitor);
    }, [stage, isVisible, isForceHidden]);

    if (!isVisible || isForceHidden) return null;

    const getStageData = () => {
        switch(stage) {
            case TutorialStage.WELCOME:
                return {
                    title: "CRITICAL_SYSTEM_ALERT",
                    body: "Operator, the Syntax Kernel is under viral assault. Intercept viral packets before they breach the core on the right.",
                    btn: "ACKNOWLEDGE",
                    next: TutorialStage.SELECT_TURRET,
                    pos: 'center',
                    icon: <KernelIcon />
                };
            case TutorialStage.SELECT_TURRET:
                return {
                    title: "PROTOCOL_ACQUISITION",
                    body: "Select the PULSE_NODE from your Protocol Deck (Center). Once selected, tap directly on a grid node to anchor it.",
                    btn: null, next: null, pos: 'top'
                };
            case TutorialStage.UPGRADE_BRIEFING:
                return {
                    title: "DEPLOYMENT_SUCCESS",
                    body: "Excellent. Your unit is now monitoring the data-path. Execute INITIATE_WAVE to test system integrity.",
                    btn: "PROCEED TO COMBAT",
                    next: TutorialStage.START_WAVE,
                    pos: 'center'
                };
            case TutorialStage.START_WAVE:
                return {
                    title: "COMBAT_INITIATION",
                    body: "Infrastructure operational. Click INITIATE_WAVE (Left) to begin defense testing.",
                    btn: null, next: null, pos: 'top'
                };
            case TutorialStage.VICTORY_BRIEF:
                return {
                    title: "THREAT_NEUTRALIZED",
                    body: "Viral packet intercepted. Mission success. Stay focused, Operator—we have much to cover before live combat.",
                    btn: "CONTINUE BRIEFING",
                    next: TutorialStage.UPGRADE_DETAIL,
                    pos: 'center'
                };
            case TutorialStage.UPGRADE_DETAIL:
                return {
                    title: "PROTOCOL_OVERCLOCKING",
                    body: "You can click on any placed unit to access the UPGRADE menu. Overclocking increases DMG and Range. Every unit has 3 Tiers of optimization.",
                    btn: "UNDERSTOOD",
                    next: TutorialStage.VIRAL_INTEL,
                    pos: 'center'
                };
            case TutorialStage.VIRAL_INTEL:
                return {
                    title: "VIRAL_INTELLIGENCE",
                    body: "There are 6 known viral strains. Each has unique speed and integrity profiles. Diversify your defenses accordingly.",
                    btn: "SYSTEMS_ACK",
                    next: TutorialStage.KERNEL_VITALITY,
                    pos: 'center',
                    icon: (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '8px 0' }}>
                            {Object.keys(VISUAL_REGISTRY).map(type => (
                                <VirusIcon key={type} type={Number(type) as EnemyType} color={`#${VISUAL_REGISTRY[Number(type) as EnemyType].color.toString(16).padStart(6, '0')}`} />
                            ))}
                        </div>
                    )
                };
            case TutorialStage.KERNEL_VITALITY:
                return {
                    title: "KERNEL_VITAL_SIGNS",
                    body: "The Kernel can only withstand 20 breaches. Monitor the Integrity bar and use REPAIR KERNEL if tokens permit.",
                    btn: "PROTOCOL_SYNC",
                    next: TutorialStage.SESSION_READY,
                    pos: 'center',
                    icon: <KernelIcon />
                };
            case TutorialStage.SESSION_READY:
                return {
                    title: "AUTHORIZATION_COMPLETE",
                    body: "Onboarding complete. The system is now initializing the SESSION_UNIQUE TOPOLOGY. Good luck, Operator.",
                    btn: "INITIALIZE LIVE COMBAT",
                    next: TutorialStage.COMPLETE,
                    pos: 'center'
                };
            default: return null;
        }
    };

    const data = getStageData();
    if (!data) return null;

    const handleNext = () => {
        if (stage === TutorialStage.SESSION_READY) {
            localStorage.setItem(TUTORIAL_KEY, 'true');
            if (waveManager) {
                // HARD TRANSITION TO WAVE 1
                StateManager.instance.currentWave = 1;
                waveManager.generateIntel(1);
                StateManager.instance.transitionTo(AppState.WAVE_COMPLETED);
            }
            setIsVisible(false);
        } else if (data.next !== null) {
            setStage(data.next);
        }
    };

    return (
        <div className="tutorial-ui-layer" style={{
            position: 'absolute', inset: 0, zIndex: 50000,
            display: 'flex', alignItems: data.pos === 'top' ? 'flex-start' : 'center', justifyContent: 'center',
            paddingTop: data.pos === 'top' ? '2rem' : '0',
            backgroundColor: data.pos === 'top' ? 'transparent' : 'rgba(0,0,0,0.7)',
            pointerEvents: 'none'
        }}>
            <div className="terminal-box" style={{
                width: '90%', maxWidth: '32rem', background: 'rgba(0, 10, 25, 0.98)',
                border: '0.15rem solid var(--neon-cyan)', padding: '1.5rem',
                boxShadow: '0 0 40px rgba(0, 255, 255, 0.3)',
                display: 'flex', flexDirection: 'column', gap: '1rem',
                pointerEvents: 'auto'
            }}>
                <div style={{ color: 'var(--neon-cyan)', fontSize: '1rem', fontWeight: 900, borderBottom: '1px solid rgba(0,255,255,0.2)', paddingBottom: '0.5rem', letterSpacing: '2px' }}>
                    {data.title}
                </div>
                {data.icon && <div style={{ display: 'flex', justifyContent: 'center' }}>{data.icon}</div>}
                <div style={{ color: '#fff', fontSize: '0.85rem', lineHeight: 1.5, fontFamily: 'monospace' }}>
                    {data.body}
                </div>
                {data.btn ? (
                    <button className="blue-button" onClick={handleNext} style={{ height: '2.8rem', fontSize: '0.9rem', marginTop: '0.5rem', background: 'var(--neon-cyan)', color: '#000' }}>
                        {data.btn}
                    </button>
                ) : (
                    <div style={{ color: 'var(--neon-cyan)', fontSize: '0.7rem', textAlign: 'center', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', animation: 'blink 1s infinite' }}>
                        Waiting for Operator action...
                    </div>
                )}
            </div>
        </div>
    );
};
