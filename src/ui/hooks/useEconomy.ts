import { useState, useEffect } from 'react';
import { EconomyManager } from '../../game/systems/EconomyManager';

/**
 * React hook to synchronize the UI with the EconomyManager.
 * 
 * Usage:
 * const credits = useEconomy();
 * return <div>SCRAP: {credits}</div>;
 */
export function useEconomy() {
    const [credits, setCredits] = useState<number>(
        EconomyManager.instance.credits
    );

    useEffect(() => {
        // Subscribe to the singleton EconomyManager
        const unsubscribe = EconomyManager.instance.subscribe((newBalance) => {
            setCredits(newBalance);
        });

        // Cleanup on unmount
        return () => unsubscribe();
    }, []);

    return credits;
}
