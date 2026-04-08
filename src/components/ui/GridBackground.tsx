import React from 'react';

interface GridBackgroundProps {
  isDistorted?: boolean;
  isFlickering?: boolean;
}

const GridBackground: React.FC<GridBackgroundProps> = ({ isDistorted, isFlickering }) => {
  return (
    <div className={`grid-background ${isDistorted ? 'distorted' : ''} ${isFlickering ? 'flicker-active' : ''}`}>
      <div className="grid-lines"></div>
      <div className="grid-sweep"></div>
      <div className="grid-glows">
        <div className="glow-bit glow-2 comet-left"></div>
        <div className="glow-bit glow-3 comet-down"></div>
        <div className="glow-bit glow-4 comet-up"></div>
      </div>
    </div>
  );
};

export default GridBackground;
