import React from 'react';

interface MainMenuProps {
  isDistorted: boolean;
  hasSave: boolean;
  rank: string;
  currentXP: number;
  nextRankXP: number;
  onStartGame: (mode: any) => void;
  onSetScreen: (screen: any) => void;
  onOpenArchive: (tab?: any) => void;
  onLoadGame: () => void;
  hoveredNode: string | null;
  setHoveredNode: (node: string | null) => void;
  uptime: number;
  entropy: number;
  menuGlitchActive: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({
  isDistorted,
  hasSave,
  rank,
  currentXP,
  nextRankXP,
  onStartGame,
  onSetScreen,
  onOpenArchive,
  onLoadGame,
  hoveredNode,
  setHoveredNode,
  uptime,
  entropy,
  menuGlitchActive
}) => {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const menuItems = [
    { label: 'INITIALIZE STANDARD', id: 'INIT', log: 'EXE: LOAD_GAME_ENV.BIN', action: () => onStartGame('STANDARD'), primary: true, status: 'READY', size: '14.2kb', ext: 'EXE' },
    { label: 'ADVANCED PROTOCOLS', id: 'MODES', log: 'ACCESS: DATA_MODES.CFG', action: () => onSetScreen('MODES'), status: 'SECURE', size: '08.5kb', ext: 'CFG' },
    { label: 'RESTORE SESSION', id: 'RESTORE', log: 'BYPASS: SECURE_SAVE.DAT', action: onLoadGame, disabled: !hasSave, status: hasSave ? 'LINKED' : 'VOID', size: '32.1kb', ext: 'DAT' },
    { label: 'SYSTEM INFO', id: 'INFO', log: 'EXTRACT: SYSTEM_LOGS.DB', action: () => onOpenArchive('LORE'), status: 'ARCHIVED', size: '128kb', ext: 'DB' },
    { label: 'SYSTEM SETTINGS', id: 'SETTINGS', log: 'OVERWRITE: USER_PREFS.CFG', action: () => onSetScreen('SETTINGS'), status: 'ACTIVE', size: '04.2kb', ext: 'CFG' }
  ];

  return (
    <div className="main-menu ui-layer">
      <div className="full-screen-scan"></div>
      {/* 1. BREADCRUMBS */}
      <div className="menu-breadcrumbs">ARCHITECT@SYNTAX_CORE:~/ROOT$</div>

      {/* 2. DIAGNOSTICS */}
      <div className="menu-diagnostics">
        <div className="diag-line">UPTIME: {formatTime(uptime)}</div>
        <div className="diag-line">ENTROPY: {entropy.toFixed(3)}%</div>
        <div className="diag-line">PACKET_LOSS: 0.00%</div>
      </div>

      <div className="menu-content-centered terminal-shift-down">
        {isDistorted ? (
          <h1 className="system-error-msg" style={{ fontSize: '3rem', margin: '0 0 20px 0' }}>SYSTEM ERROR</h1>
        ) : (
          <h1 
            className={`menu-title-static ${menuGlitchActive ? 'glitch-active' : ''}`}
            data-glitch-text="CORE INTEGRITY COMPROMISED"
          >
            {menuGlitchActive ? 'SYNT@X D3FENSE' : 'SYNTAX DEFENSE'}
          </h1>
        )}

        <div className={`terminal-menu-window ${menuGlitchActive ? 'glitch-active' : ''}`}>
          <div className="terminal-window-header">
            <span className="window-title">SYSTEM_EXECUTABLES_V2.7</span>
            <div className="window-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
          </div>
          <div className="terminal-window-content">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`terminal-list-item ${item.primary ? 'primary-item' : ''} ${menuGlitchActive && Math.random() > 0.7 ? 'glitch-active' : ''}`}
                disabled={item.disabled}
                onClick={item.action}
                onMouseEnter={() => setHoveredNode(item.log)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <span className="selection-indicator"></span>
                <span className="selection-pointer">{">>"}</span>
                <span className="item-meta">{item.size}</span>
                <div className="item-label-group">
                  <span className="item-label">
                    {menuGlitchActive && Math.random() > 0.8 ? item.label.replace(/[AEIOU]/g, '$') : item.label}
                    <span style={{ color: '#444', marginLeft: '5px', fontSize: '0.65rem' }}>.{item.ext}</span>
                  </span>
                  <span className="item-dots"></span>
                  <span className={`item-status status-${item.status.toLowerCase()}`}>[{item.status}]</span>
                </div>
              </button>
            ))}
            <div className="terminal-input-line">
              <span className="prompt">&gt;</span>
              <span className="terminal-cursor" style={{ marginLeft: '-5px', marginRight: '5px' }}></span>
              <span className="active-log">{hoveredNode || 'AWAITING_INPUT...'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
