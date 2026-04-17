import React, { useEffect } from 'react';
import { MainLayout } from './ui/layout/MainLayout';
import { StateManager, AppState } from './core/StateManager';
import './App.css';

/**
 * APP ENTRY POINT: Structural Bootstrap
 * Initializes the global application environment.
 */

function App() {
  useEffect(() => {
    // Initial state transition
    StateManager.instance.transitionTo(AppState.BOOT);

    // Auto-transition to Menu after 2s for testing
    const timer = setTimeout(() => {
        StateManager.instance.transitionTo(AppState.MAIN_MENU);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="game-wrapper">
      <MainLayout />
    </div>
  );
}

export default App;
