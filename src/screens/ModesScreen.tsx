import React from 'react';
import TerminalText from '../components/TerminalText';
import { AudioManager } from '../game/systems/AudioManager';

interface ModesScreenProps {
  isTypingComplete: boolean;
  onStartGame: (mode: any) => void;
  onSetScreen: (screen: any) => void;
  setIsTypingComplete: (complete: boolean) => void;
}

const gameModes = [
  { mode: 'HARDCORE', title: 'HARDCORE', desc: 'NO INTEREST. 50% UNIT COST INCREASE. REDUCED CAPITAL.', color: '#ff3300' },
  { mode: 'SUDDEN_DEATH', title: 'SUDDEN DEATH', desc: 'CORE INTEGRITY SET TO 1. A SINGLE BREACH ENDS THE SESSION.', color: '#ffcc00' },
  { mode: 'ENDLESS', title: 'ENDLESS LOOP', desc: 'NO LEVEL CAP. VIRAL SIGNATURES GAIN EXPONENTIAL HP MULTIPLIERS.' },
  { mode: 'ECO_CHALLENGE', title: 'ECO CHALLENGE', desc: 'NO DELETION BOUNTIES. ALL INCOME FROM 10% INTEREST SYSTEM.' }
];

const ModesScreen: React.FC<ModesScreenProps> = ({
  isTypingComplete,
  onStartGame,
  onSetScreen,
  setIsTypingComplete
}) => {
  const am = AudioManager.getInstance();
  return (
    <div className="encyclopedia ui-layer">
      <div className="enc-header command-header">
        <span className="prompt static-prompt">&gt;</span>
        <TerminalText key="modes-title" text="RUN: LIST_PROTOCOLS.SH" speed={30} onComplete={() => setIsTypingComplete(true)} />
      </div>
      {isTypingComplete && (
        <div className="enc-content" style={{ pointerEvents: 'auto' }}>
          <div className="mode-grid">
            {gameModes.map(gm => (
              <button key={gm.mode} className="mode-card" onClick={() => { am.playUiClick(); onStartGame(gm.mode as any); }} style={{ borderColor: gm.color || 'var(--neon-cyan)' }}>
                <div className="mode-title">{gm.title}</div>
                <div className="mode-desc">{gm.desc}</div>
              </button>
            ))}
          </div>
          <button className="cyan-menu-btn back-btn" onClick={() => { am.playUiClick(); onSetScreen('MENU'); setIsTypingComplete(false); }} style={{ pointerEvents: 'auto' }}>RETURN TO ROOT</button>
        </div>
      )}
    </div>
  );
};

export default ModesScreen;
