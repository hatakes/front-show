import { useEffect, useState } from 'react';
import type { GestureState } from '../hooks/useHandGestures';

interface LuxuryOverlayProps {
  gesture: GestureState;
  chaosMode: boolean;
  cameraActive: boolean;
}

const messages: Record<GestureState, string> = {
  OPEN: 'UNLEASH CHAOS',
  CLOSED: 'FORM THE TREE',
  NONE: 'SHOW YOUR HAND'
};

const LuxuryOverlay = ({ gesture, chaosMode, cameraActive }: LuxuryOverlayProps) => {
  const [sparkle, setSparkle] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setSparkle((prev) => !prev), 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between p-8">
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-goldLuxury/80">Grand Luxury</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[0.2em] text-goldLuxury drop-shadow-[0_0_25px_rgba(214,178,94,0.45)]">
          Interactive Christmas Tree
        </h1>
      </header>
      <div className="flex flex-col items-center gap-2 rounded-full border border-goldLuxury/40 bg-black/40 px-6 py-3 text-center shadow-glow">
        <span className="text-xs uppercase tracking-[0.25em] text-goldLuxury/70">
          Gesture Control
        </span>
        <span className={`text-sm font-semibold ${sparkle ? 'text-goldLuxury' : 'text-white'}`}>
          {messages[gesture]}
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/70">
          {cameraActive ? (chaosMode ? 'CHAOS MODE' : 'FORMED MODE') : 'CAMERA OFF'}
        </span>
      </div>
      <p className="text-xs text-white/70">
        Move your hand to steer the view • Open palm to unleash • Closed fist to reform
      </p>
    </div>
  );
};

export default LuxuryOverlay;
