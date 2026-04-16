# [01] STUDIO_SPLASH: BRAND_IDENTITY

## I. LOGIC & TIMING
- **GATE**: `isLandscape && showStudioSplash && systemInitialized && !studioComplete`.
- **DURATION**: 7000ms (Total sequence).
- **STATE_CHANGE**: Sets `showStudioSplash(false)` and `studioComplete(true)` upon timeout.
- **SEQUENCE**: 
  - **0.5s**: M-Logo manifests from blur/small.
  - **2.5s**: M reaches full scale.
  - **4.0s**: Transformation (M -> 4-Pillar Monument) begins.
  - **4.1s**: "MONOLITH" branding appears.
  - **7.5s**: Splash exit sequence begins.

## II. STRUCTURE (JSX)
```tsx
<div className="studio-splash ui-layer" onClick={initializeSystem}>
  <div className="manifest-wrapper">
    <div className="pillars-bg">
      <div className="pillar p1"></div>
      <div className="pillar p2"></div>
      <div className="pillar p3"></div>
      <div className="pillar p4"></div>
    </div>
    <h1 className="manifest-text">MONOLITH</h1>
    <div className="manifest-subtext">PRESENTS</div>
  </div>
</div>
```

## III. STYLING (CSS)
```css
.manifest-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: splash-exit 0.6s 9.5s forwards;
}

.pillars-bg {
  position: relative;
  width: 140px;
  height: 140px;
  margin-bottom: 25px;
  opacity: 0;
  animation: pillars-manifest 2s 0.5s forwards;
}

.pillar {
  position: absolute;
  width: 16px;
  background: var(--neon-cyan);
  box-shadow: 0 0 30px var(--neon-cyan);
  border-radius: 1px;
}

/* LEFT LEG */
.pillar.p1 {
  left: 0; height: 140px; z-index: 2; transform-origin: center;
  animation: pillar-shrink-smooth 1.5s 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* BACKSLASH - Inner Left */
.pillar.p2 {
  left: 12px; height: 140px; z-index: 1; transform-origin: top left;
  transform: skewX(20.5deg); 
  animation: pillar-straighten-p2 1.5s 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* FORWARD SLASH - Inner Right */
.pillar.p3 {
  right: 12px; height: 140px; z-index: 1; transform-origin: top right;
  transform: skewX(-20.5deg); 
  animation: pillar-straighten-p3 1.5s 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* RIGHT LEG */
.pillar.p4 {
  right: 0; height: 140px; z-index: 2; transform-origin: center;
  animation: pillar-shrink-smooth 1.5s 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes pillars-manifest {
  from { opacity: 0; filter: blur(30px); transform: scale(0.4); }
  to { opacity: 1; filter: blur(0); transform: scale(1); }
}

@keyframes pillar-shrink-smooth {
  to { transform: scaleY(0.714); }
}

@keyframes pillar-straighten-p2 {
  to { transform: skewX(0deg); left: 42px; }
}

@keyframes pillar-straighten-p3 {
  to { transform: skewX(0deg); right: 42px; }
}

.manifest-text {
  font-size: 4rem; font-weight: 900; letter-spacing: 25px; color: #fff;
  opacity: 0; text-shadow: 0 0 20px rgba(255,255,255,0.4);
  animation: text-manifest 2s 4.1s forwards;
}
```
