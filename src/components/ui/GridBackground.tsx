import React from 'react';

interface GridBackgroundProps {
  isDistorted?: boolean;
  isFlickering?: boolean;
  mousePos?: { x: number, y: number };
}

const GridBackground: React.FC<GridBackgroundProps> = ({ isDistorted, isFlickering, mousePos = { x: 0.5, y: 0.5 } }) => {
  // Subtly shift based on mouse (parallax)
  const shiftX = (mousePos.x - 0.5) * 15;
  const shiftY = (mousePos.y - 0.5) * 15;

  return (
    <div className={`grid-background ${isDistorted ? 'distorted' : ''} ${isFlickering ? 'flicker-active' : ''}`}>
      <div className="grid-lines" style={{ transform: `translate(${shiftX}px, ${shiftY}px) scale(1.05)` }}></div>
      <div className="grid-sweep"></div>
      <div className="grid-glows" style={{ transform: `translate(${shiftX * 1.5}px, ${shiftY * 1.5}px) scale(1.05)` }}>
        <div className="glow-bit glow-2 comet-left"></div>
        <div className="glow-bit glow-3 comet-down"></div>
        <div className="glow-bit glow-4 comet-up"></div>
      </div>
      
      {/* VERTICAL DATA STREAMS */}
      <div className="data-stream stream-left">
        <div>01011010</div><div>0x7FF_LOCK</div><div>SYNC_TRUE</div><div>11001011</div><div>MEM_ALLOC</div>
      </div>
      <div className="data-stream stream-right">
        <div>CORE_LOAD</div><div>0x004_INIT</div><div>10101010</div><div>ACTIVE_GA</div><div>01110001</div>
      </div>
    </div>
  );
};

export default GridBackground;
