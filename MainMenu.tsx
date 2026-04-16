import React, { useState, useEffect, useRef } from 'react';
import { AudioManager } from '../game/systems/AudioManager';

interface MainMenuProps {
  hasSave: boolean;
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

interface VitalChar {
  char: string;
  originalChar: string;
  glitched: boolean;
}

interface VitalLine {
  id: number;
  chars: VitalChar[];
}

const MainMenu: React.FC<MainMenuProps> = ({
  hasSave,
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
  const [vitals, setVitals] = useState<VitalLine[]>([]);
  const idRef = useRef(0);
  const lastTextRef = useRef("");

  // 1. PERSISTENT TERMINAL FEED (Scrolling)
  useEffect(() => {
    const lines = [
      "MEM_PTR: 0x8F2", "SYSCALL_OK", "DATA_SYNC: 100%", "PACKET_FLUX: 0.02", 
      "GUEST_LINK: EST", "TRACERT_HOP: 4", "BUFFER_SYNC: OK", "SOCKET_INIT",
      "DAEMON_RESP", "IO_PORT: 8080", "LOG_INIT: SUCCESS", "STACK_DUMP: NULL",
      "CRYPTO_HASH: VAL", "ROOT_ACCESS: DENIED", "FIREWALL: UP", "DNS_RESOLVE: OK"
    ];

    const itv = setInterval(() => {
      let nextText = lines[Math.floor(Math.random() * lines.length)];
      while (nextText === lastTextRef.current) {
        nextText = lines[Math.floor(Math.random() * lines.length)];
      }
      lastTextRef.current = nextText;

      const newLine = {
        id: idRef.current++,
        chars: nextText.split('').map(c => ({ char: c, originalChar: c, glitched: false }))
      };

      setVitals(prev => [newLine, ...prev].slice(0, 8));
    }, 2000);

    return () => clearInterval(itv);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const menuItems = [
    { label: 'INFILTRATE CORE', id: 'INIT', log: 'EXE: LOAD_GAME_ENV.BIN', action: () => onStartGame('STANDARD'), primary: true, status: 'READY', size: '14.2kb', ext: 'EXE', context: ["TARGET: CORE_ROOT", "STATUS: VULNERABLE"] },
    { label: 'ADVANCED PROTOCOLS', id: 'MODES', log: 'ACCESS: DATA_MODES.CFG', action: () => onSetScreen('MODES'), status: 'SECURE', size: '08.5kb', ext: 'CFG', context: ["PERMISSIONS: ARCHITECT", "GATES: UNLOCKED"] },
    { label: 'RESTORE SESSION', id: 'RESTORE', log: 'BYPASS: SECURE_SAVE.DAT', action: onLoadGame, disabled: !hasSave, status: hasSave ? 'LINKED' : 'VOID', size: '32.1kb', ext: 'DAT', context: ["SOURCE: SECURE_NVRAM", "INTEGRITY: VERIFIED"] },
    { label: 'SYSTEM ARCHIVE', id: 'INFO', log: 'EXTRACT: SYSTEM_LOGS.DB', action: () => onOpenArchive('LORE'), status: 'ARCHIVED', size: '128kb', ext: 'DB', context: ["CATEGORIES: TACTICAL", "ACCESS: GRANTED"] },
    { label: 'SYSTEM DIAGNOSTICS', id: 'SETTINGS', log: 'OVERWRITE: USER_PREFS.CFG', action: () => onSetScreen('SETTINGS'), status: 'ACTIVE', size: '04.2kb', ext: 'CFG', context: ["INTERFACE: STABLE", "SFX_ENGINE: LOADED"] }
  ];

  // Map hover to specific context
  const currentHoverItem = menuItems.find(item => item.log === hoveredNode);

  return (
    <div className="main-menu ui-layer">
      <div className="full-screen-scan"></div>
      <div className="full-page-scanline"></div>
      
      <div className="menu-breadcrumbs">ARCHITECT@SYNTAX_CORE:~/ROOT$</div>

      <div className="menu-diagnostics">
        {currentHoverItem ? (
            <>
                <div className="diag-line" style={{ color: 'var(--neon-cyan)', fontWeight: 900 }}>{currentHoverItem.label}</div>
                {currentHoverItem.context.map((line, i) => (
                    <div key={i} className="diag-line" style={{ fontSize: '0.5rem' }}>{line}</div>
                ))}
            </>
        ) : (
            <>
                <div className="diag-line">UPTIME: {formatTime(uptime)}</div>
                <div className="diag-line">ENTROPY: {entropy.toFixed(3)}%</div>
                <div className="diag-line">PACKET_LOSS: 0.00%</div>
            </>
        )}
      </div>

      <div className="menu-content-centered">
        <h1 className={`menu-title-static ${menuGlitchActive ? 'glitch-active' : ''}`}>
          {menuGlitchActive ? 'SYNT@X D3FENSE' : 'SYNTAX DEFENSE'}
        </h1>

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
            {menuItems.map((item, idx) => (
              <button
                key={item.id}
                className={`terminal-list-item item-reveal-${idx} ${item.primary ? 'primary-item' : ''}`}
                disabled={item.disabled}
                onClick={item.action}
                onMouseEnter={() => {
                    setHoveredNode(item.log);
                    AudioManager.getInstance().playDataChatter();
                }}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <span className="item-meta">{item.size}</span>
                <div className="item-label-group">
                  <span className="item-label">
                    {item.label}
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

      <div className="menu-vitals-ticker">
        {vitals.map((v) => (
          <div key={v.id} className="vital-line">
            &gt; {v.chars.map((vc, ci) => (
              <span key={ci} className={vc.glitched ? 'vital-symbol-red' : ''}>
                {vc.char}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainMenu;
