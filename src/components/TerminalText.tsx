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
}

const TerminalText = ({ text, speed = 15, onComplete, delay = 0, stopAtChar, glitchProbability = 0.04, isGlitched = false }: TerminalTextProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    let isCancelled = false;
    const startTimeout = setTimeout(() => {
      if (isCancelled) return;
      let i = 0;
      const interval = setInterval(() => {
        if (isCancelled) { clearInterval(interval); return; }
        
        // CHARACTER MUTATION LOGIC
        let currentString = text.slice(0, i);
        if (isGlitched && i > 0 && i < text.length && Math.random() < glitchProbability && text[i-1] !== ' ') {
            const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>/?";
            const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
            currentString = currentString.slice(0, -1) + randomChar;
        }

        setDisplayedText(currentString);
        
        if (i > 0 && i <= text.length && text[i-1] !== ' ') {
          const am = AudioManager.getInstance();
          if (am.isReady()) am.playTypeClick();
        }
        
        if (stopAtChar !== undefined && i === stopAtChar) {
          clearInterval(interval);
          setDisplayedText(text.slice(0, i)); 
          if (onCompleteRef.current) onCompleteRef.current();
          return;
        }

        i++;
        if (i > text.length) {
          clearInterval(interval);
          setDisplayedText(text); 
          setIsFinished(true);
          if (onCompleteRef.current) onCompleteRef.current();
        }
      }, speed);
      return () => { isCancelled = true; clearInterval(interval); };
    }, delay);
    return () => { isCancelled = true; clearTimeout(startTimeout); };
  }, [text, speed, delay, stopAtChar, glitchProbability, isGlitched]);

  return (
    <span>
      {displayedText}
      {!isFinished && <span className="terminal-cursor"></span>}
    </span>
  );
};

export default TerminalText;
