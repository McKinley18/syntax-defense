import { useEffect, useState, useRef } from 'react';
import { AudioManager } from '../game/systems/AudioManager';

interface TerminalTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  delay?: number;
  stopAtChar?: number;
}

const TerminalText = ({ text, speed = 15, onComplete, delay = 0, stopAtChar }: TerminalTextProps) => {
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
        
        setDisplayedText(text.slice(0, i));
        if (i > 0 && i <= text.length && text[i-1] !== ' ') {
          AudioManager.getInstance().playTypeClick();
        }
        
        if (stopAtChar !== undefined && i === stopAtChar) {
          clearInterval(interval);
          if (onCompleteRef.current) onCompleteRef.current();
          return;
        }

        i++;
        if (i > text.length) {
          clearInterval(interval);
          setIsFinished(true);
          if (onCompleteRef.current) onCompleteRef.current();
        }
      }, speed);
      return () => { isCancelled = true; clearInterval(interval); };
    }, delay);
    return () => { isCancelled = true; clearTimeout(startTimeout); };
  }, [text, speed, delay, stopAtChar]);

  return (
    <span>
      {displayedText}
      {!isFinished && <span className="terminal-cursor"></span>}
    </span>
  );
};

export default TerminalText;
