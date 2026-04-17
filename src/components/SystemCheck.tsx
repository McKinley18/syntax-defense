import React, { useEffect, useState, useRef } from 'react';
import { StateManager, AppState } from '../core/StateManager';

const SYSTEM_BIOS_LOGS = [
    "MONOLITH BIOS v4.0.22",
    "---------------------------------",
    "CPU: SYNTAX-CORE @ 4.2GHz ... OK",
    "MEM: 64GB DDR5 VIRTUAL_STACK ... OK",
    "IO_BRIDGE: ESTABLISHED",
    "MOUNTING NVMe_SECTOR_0 (ROOT) ... DONE",
    "MOUNTING NVMe_SECTOR_1 (TACTICAL) ... DONE",
    "KERNEL_INIT: SEEDING ENTROPY",
    "DASHBOARD_PPL: V-SYNC ENABLED",
    "UI_ENGINE: PIXI_v8_STABLE",
    "NETWORK: DHCP ACQUIRING IP... 192.168.1.1",
    "SYSTEM_INTEGRITY: 100% NOMINAL",
    "LOADING TACTICAL_ASSETS ...",
    "READY_FOR_USER_AUTHORIZATION"
];

export const SystemCheck: React.FC = () => {
    const [visibleCount, setVisibleCount] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleCount(prev => {
                if (prev >= SYSTEM_BIOS_LOGS.length) {
                    clearInterval(interval);
                    setTimeout(() => {
                        StateManager.instance.transitionTo(AppState.TERMINAL_BOOT);
                    }, 1500);
                    return prev;
                }
                return prev + 1;
            });
        }, 300);

        return () => clearInterval(interval);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [visibleCount]);

    return (
        <div style={{
            backgroundColor: '#000',
            width: '100%',
            height: '100%',
            padding: '30px',
            boxSizing: 'border-box',
            fontFamily: "'Courier New', monospace",
            fontSize: '16px',
            color: '#00ff66',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            position: 'relative',
            zIndex: 9999,
            overflow: 'hidden'
        }}>
            <div style={{ marginBottom: '20px', fontWeight: 'bold', fontSize: '20px' }}>SYSTEM_STARTUP_PRECHECK</div>
            
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto' }}>
                {SYSTEM_BIOS_LOGS.slice(0, visibleCount).map((line, idx) => (
                    <div key={idx} style={{ marginBottom: '4px', opacity: 0.9 }}>{line}</div>
                ))}
                
                <div style={{ marginTop: '10px' }}>
                    <span style={{ width: '10px', height: '18px', backgroundColor: '#00ff66', display: 'inline-block', animation: 'bios-cursor 0.5s infinite' }}></span>
                </div>
            </div>

            <style>{`
                @keyframes bios-cursor {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};
