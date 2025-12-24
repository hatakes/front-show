import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import FoliagePoints from './FoliagePoints';
import Ornaments from './Ornaments';

const CHAOS_SPEED = 0.5;
const FORMED_SPEED = 0.8;

export interface GrandTreeSceneProps {
  chaosMode: boolean;
  handRotation: { x: number; y: number };
}

const GrandTreeScene = ({ chaosMode, handRotation }: GrandTreeSceneProps) => {
  const progressRef = useRef(1);
  const targetRef = useRef(1);
  const { camera } = useThree();

  const cameraTarget = useMemo(() => new THREE.Vector3(0, 3, 0), []);

  useFrame((state, delta) => {
    targetRef.current = chaosMode ? 0 : 1;
    const speed = chaosMode ? CHAOS_SPEED : FORMED_SPEED;
    progressRef.current = THREE.MathUtils.damp(progressRef.current, targetRef.current, speed, delta);

    const desiredYaw = handRotation.y;
    const desiredPitch = handRotation.x;

    const radius = 20;
    const yaw = desiredYaw;
    const pitch = desiredPitch;
    const x = Math.sin(yaw) * radius;
    const z = Math.cos(yaw) * radius;
    const y = 4 + pitch * 6;

    camera.position.lerp(new THREE.Vector3(x, y, z), 0.08);
    camera.lookAt(cameraTarget);
  });

  return (
    <group>
      <FoliagePoints progressRef={progressRef} />
      <Ornaments progressRef={progressRef} />
    </group>
  );
};

export default GrandTreeScene;
