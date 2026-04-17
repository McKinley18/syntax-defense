import { useEffect, useState, useRef } from 'react';
import { AudioManager } from '../systems/AudioManager';

interface TerminalTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  delay?: number;
  humanTyping?: boolean; 
  isCommand?: boolean; 
  isGlitched?: boolean;
  permanentGlitch?: boolean;
}

const TerminalText = ({ 
  text, 
  speed = 30, 
  onComplete, 
  delay = 0, 
  humanTyping = false,
  isCommand = false,
  isGlitched = false,
  permanentGlitch = false
}: TerminalTextProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const onCompleteRef = useRef(onComplete);
  const hasCompleted = useRef(false);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    let isCancelled = false;
    let i = 0;
    let currentStr = "";

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const runTyping = async () => {
      await wait(delay);
      if (isCancelled) return;
      setIsTyping(true);

      if (isCommand) {
          AudioManager.getInstance().playTerminalCommand();
      }

      while (i < text.length) {
        if (isCancelled) return;

        if (humanTyping) {
            // Simulated Typo Logic
            if (Math.random() < 0.02 && i > 2 && text[i] !== ' ' && text[i-1] !== ' ') {
                const keys = "asdfghjklqwertyuiop";
                const typo = keys[Math.floor(Math.random() * keys.length)];
                setDisplayedText(currentStr + typo);
                AudioManager.getInstance().playTypeClick();
                await wait(150 + Math.random() * 100);
                setDisplayedText(currentStr);
                await wait(100 + Math.random() * 50);
            }

            let charDelay = speed + (Math.random() * 40 - 20);
            if (text[i] === ' ') charDelay += 120 + Math.random() * 100;
            if (text[i] === '-' || text[i] === '.') charDelay += 80;
            await wait(charDelay);
        } else {
            await wait(speed);
        }

        currentStr += text[i];
        setDisplayedText(currentStr);
        
        // --- REALISTIC AUDIO SYNC ---
        if (text[i] !== ' ') {
            if (humanTyping) {
                AudioManager.getInstance().playTypeClick(); // Mechanical
            } else {
                AudioManager.getInstance().playDataChatter(); // Tech Blip
            }
        }

        i++;
      }

      if (!isCancelled) {
          setIsFinished(true);
          setIsTyping(false);
          if (onCompleteRef.current && !hasCompleted.current) {
              hasCompleted.current = true;
              onCompleteRef.current();
          }
      }
    };

    runTyping();
    return () => { isCancelled = true; };
  }, [text, speed, delay, humanTyping]);

  useEffect(() => {
      if (!isGlitched || !isFinished) return;
      const glitchPool = "!@#$%^&*()_+-=[]{}|;:,.<>/?0123456789ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz▰▱▲△▴▵▼▽◸◹◺◻◼◽◾◿";
      const mutationInterval = setInterval(() => {
          setDisplayedText(prev => {
              if (prev.length === 0 || !permanentGlitch) return prev;
              const chars = prev.split('');
              const idx = Math.floor(Math.random() * chars.length);
              if (chars[idx] === ' ') return prev;
              chars[idx] = Math.random() < 0.08 ? glitchPool[Math.floor(Math.random() * glitchPool.length)] : text[idx] || chars[idx];
              return chars.join('');
          });
      }, 35);
      return () => clearInterval(mutationInterval);
  }, [isGlitched, isFinished, text, permanentGlitch]);

  return (
    <span style={{ 
        position: 'relative',
        display: 'inline-block',
        animation: 'text-grow 0.4s ease-out forwards',
        transformOrigin: 'left center'
    }}>
      {displayedText}
      {(!isFinished || isTyping) && <span style={{
          display: 'inline-block',
          width: '8px',
          height: '1.2em',
          backgroundColor: 'currentColor',
          marginLeft: '4px',
          verticalAlign: 'middle'
      }}></span>}
    </span>
  );
};

export default TerminalText;
