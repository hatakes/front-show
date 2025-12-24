import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Suspense, useMemo } from 'react';
import GrandTreeScene from './components/GrandTreeScene';
import LuxuryOverlay from './components/LuxuryOverlay';
import { useHandGestures } from './hooks/useHandGestures';

const App = () => {
  const { gesture, rotation, active } = useHandGestures();
  const chaosMode = useMemo(() => gesture === 'OPEN', [gesture]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-emeraldLuxury">
      <Canvas camera={{ position: [0, 4, 20], fov: 45 }}>
        <color attach="background" args={["#081f19"]} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 12, 6]} intensity={1.3} color="#f7e5b2" />
        <Suspense fallback={null}>
          <Environment preset="lobby" />
        </Suspense>
        <GrandTreeScene chaosMode={chaosMode} handRotation={rotation} />
        <EffectComposer>
          <Bloom luminanceThreshold={0.8} intensity={1.2} mipmapBlur />
        </EffectComposer>
      </Canvas>
      <LuxuryOverlay gesture={gesture} chaosMode={chaosMode} cameraActive={active} />
    </div>
  );
};

export default App;
