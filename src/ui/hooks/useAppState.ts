import { useState, useEffect } from 'react';
import { StateManager, AppState } from '../../core/StateManager';

/**
 * React hook to synchronize the UI with the core StateManager.
 * 
 * Usage:
 * const state = useAppState();
 * if (state === AppState.MAIN_MENU) return <MainMenu />;
 */
export function useAppState() {
    const [currentState, setCurrentState] = useState<AppState>(
        StateManager.instance.currentState
    );

    useEffect(() => {
        // Subscribe to the singleton StateManager
        const unsubscribe = StateManager.instance.subscribe((state) => {
            setCurrentState(state);
        });

        // Cleanup on unmount
        return () => unsubscribe();
    }, []);

    return currentState;
}

/**
 * Simple dispatcher hook for triggering transitions.
 */
export function useTransition() {
    return (state: AppState) => StateManager.instance.transitionTo(state);
}
