import React, { useState, useEffect } from 'react';
import { StateManager, AppState } from '../core/StateManager';

export const PowerOn: React.FC = () => {
    const [status, setStatus] = useState("INITIALIZING");
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        const sequence = async () => {
            setOpacity(1);
            await new Promise(r => setTimeout(r, 1000));
            setStatus("KERNEL_VERSION_1.0.4");
            await new Promise(r => setTimeout(r, 800));
            setStatus("ESTABLISHING_CORE_LINK");
            await new Promise(r => setTimeout(r, 1200));
            setStatus("SYSTEM_READY");
            await new Promise(r => setTimeout(r, 500));
            StateManager.instance.transitionTo(AppState.SYSTEM_CHECK);
        };
        sequence();
    }, []);

    return (
        <div style={{
            backgroundColor: '#000', width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', fontFamily: "'Courier New', monospace",
            color: '#fff', opacity: opacity, transition: 'opacity 1s',
            overflow: 'hidden' // Hardened scroll suppression
        }}>
            <div style={{ fontSize: '0.8rem', letterSpacing: '4px', opacity: 0.5 }}>SYNTAX_KERNEL_BOOT</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '1rem', letterSpacing: '2px' }}>
                &gt; {status}
                <span style={{ 
                    display: 'inline-block', width: '10px', height: '20px', 
                    backgroundColor: '#fff', marginLeft: '10px', verticalAlign: 'middle',
                    animation: 'blink 1s step-end infinite'
                }}></span>
            </div>
            
            <style>{`
                @keyframes blink { 50% { opacity: 0; } }
            `}</style>
        </div>
    );
};
