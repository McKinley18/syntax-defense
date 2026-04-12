import { useEffect, useState, useRef } from 'react';
import { AudioManager } from '../game/systems/AudioManager';

interface TerminalTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  delay?: number;
  stopAtChar?: number;
  glitchProbability?: number;
  isGlitched?: boolean;
  permanentGlitch?: boolean;
  humanTyping?: boolean; 
  decryptionMode?: boolean; 
  isCommand?: boolean; 
}

const TerminalText = ({ 
  text, 
  speed = 15, 
  onComplete, 
  delay = 0, 
  stopAtChar, 
  glitchProbability = 0.08, 
  isGlitched = false, 
  permanentGlitch = false,
  humanTyping = false,
  decryptionMode = false,
  isCommand = false
}: TerminalTextProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const hasCompletedCallbackFired = useRef(false);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    let isCancelled = false;
    
    const startTimeout = setTimeout(() => {
      if (isCancelled || hasCompletedCallbackFired.current) return;
      
      if (isCommand) {
          const am = AudioManager.getInstance();
          if (am.isReady()) am.playTerminalCommand();
      }

      let i = 0;
      const runStep = () => {
        if (isCancelled) return;
        
        const base = text.slice(0, i);
        
        if (decryptionMode) {
            const glitchPool = "!@#$%^&*()_+-=[]{}|;:,.<>/?0123456789";
            let scrambled = base.split('').map((char) => {
                if (char === ' ') return char;
                return Math.random() > 0.7 ? char : glitchPool[Math.floor(Math.random() * glitchPool.length)];
            }).join('');
            setDisplayedText(scrambled);
        } else {
            setDisplayedText(base);
        }
        
        if (i > 0 && i <= text.length && text[i-1] !== ' ') {
          const am = AudioManager.getInstance();
          if (am.isReady()) {
              if (humanTyping) am.playTypeClick();
              else am.playUiClick();
          }
        }
        
        if (stopAtChar !== undefined && i === stopAtChar) {
          setDisplayedText(text.slice(0, i)); 
          setIsFinished(true);
          if (!hasCompletedCallbackFired.current) {
              hasCompletedCallbackFired.current = true;
              if (onCompleteRef.current) onCompleteRef.current();
          }
          return;
        }

        if (i < text.length) {
            i++;
            let nextSpeed = speed;
            if (humanTyping) {
                if (text[i-1] === ' ' || text[i-1] === '-') nextSpeed += 150 + Math.random() * 200;
                else nextSpeed = speed + (Math.random() * 40 - 20);
            }
            setTimeout(runStep, nextSpeed);
        } else {
            setDisplayedText(text);
            setIsFinished(true);
            if (!hasCompletedCallbackFired.current) {
                hasCompletedCallbackFired.current = true;
                if (onCompleteRef.current) onCompleteRef.current();
            }
        }
      };

      runStep();
    }, delay);

    return () => { isCancelled = true; clearTimeout(startTimeout); };
  }, [text, speed, delay, stopAtChar, humanTyping, decryptionMode]);

  // SEPARATE GLITCH EFFECT (Doesn't re-trigger typing)
  useEffect(() => {
      if (!isGlitched || !isFinished) return;
      
      let isCancelled = false;
      const glitchPool = "!@#$%^&*()_+-=[]{}|;:,.<>/?0123456789ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz▰▱▲△▴▵▼▽◸◹◺◻◼◽◾◿";
      
      const mutationInterval = setInterval(() => {
          if (isCancelled) return;
          setDisplayedText(prev => {
              if (prev.length === 0 || !permanentGlitch) return prev;
              const chars = prev.split('');
              const idx = Math.floor(Math.random() * chars.length);
              if (chars[idx] === ' ') return prev;
              if (Math.random() < glitchProbability) {
                  chars[idx] = glitchPool[Math.floor(Math.random() * glitchPool.length)];
              } else {
                  chars[idx] = text[idx] || chars[idx];
              }
              return chars.join('');
          });
      }, 35);

      return () => { isCancelled = true; clearInterval(mutationInterval); };
  }, [isGlitched, isFinished, text, glitchProbability, permanentGlitch]);

  return (
    <span style={{ position: 'relative' }}>
      {displayedText}
      {!isFinished && <span className={`terminal-cursor ${isGlitched ? 'fast-blink' : ''}`}></span>}
    </span>
  );
};

export default TerminalText;
