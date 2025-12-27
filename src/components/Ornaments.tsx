import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';
import * as THREE from 'three';

interface OrnamentData {
  chaos: THREE.Vector3;
  target: THREE.Vector3;
  rotation: THREE.Euler;
  weight: number;
  scale: number;
}

interface OrnamentsProps {
  progressRef: MutableRefObject<number>;
}

const createPolaroidTexture = (seed: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const gradient = ctx.createLinearGradient(0, 0, 256, 320);
  gradient.addColorStop(0, `hsl(${seed * 60 + 20}, 60%, 60%)`);
  gradient.addColorStop(1, `hsl(${seed * 60 + 80}, 55%, 40%)`);

  ctx.fillStyle = '#f8f4e8';
  ctx.fillRect(0, 0, 256, 320);
  ctx.fillStyle = '#d6b25e';
  ctx.fillRect(12, 12, 232, 230);
  ctx.fillStyle = gradient;
  ctx.fillRect(18, 18, 220, 200);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(18, 210, 220, 30);
  ctx.fillStyle = '#e6d7b0';
  ctx.font = '20px serif';
  ctx.fillText('Luxury Moment', 24, 250);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const createOrnaments = (count: number, radius: number, height: number, weight: number) => {
  return Array.from({ length: count }, () => {
    const chaosRadius = 12 * Math.cbrt(Math.random());
    const chaosTheta = Math.random() * Math.PI * 2;
    const chaosPhi = Math.acos(2 * Math.random() - 1);

    const chaos = new THREE.Vector3(
      chaosRadius * Math.sin(chaosPhi) * Math.cos(chaosTheta),
      chaosRadius * Math.cos(chaosPhi) + 2,
      chaosRadius * Math.sin(chaosPhi) * Math.sin(chaosTheta)
    );

    const y = Math.random() * height + 0.5;
    const coneRadius = (1 - y / height) * radius + 0.6;
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * coneRadius;

    const target = new THREE.Vector3(r * Math.cos(angle), y, r * Math.sin(angle));

    const rotation = new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    return {
      chaos,
      target,
      rotation,
      weight,
      scale: 0.6 + Math.random() * 0.5
    } satisfies OrnamentData;
  });
};

const applyInstanceMatrices = (
  mesh: THREE.InstancedMesh,
  ornaments: OrnamentData[],
  progress: number,
  time: number
) => {
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const position = new THREE.Vector3();

  const eased = THREE.MathUtils.smoothstep(progress, 0, 1);

  ornaments.forEach((ornament, index) => {
    const weightedProgress = THREE.MathUtils.clamp(Math.pow(eased, ornament.weight), 0, 1);
    const jitter = Math.sin(time + index) * 0.15 * (1 - weightedProgress);
    position.copy(ornament.chaos).lerp(ornament.target, weightedProgress);
    position.addScaledVector(new THREE.Vector3(jitter, jitter * 0.6, jitter), 0.3);

    quaternion.setFromEuler(ornament.rotation);
    scale.setScalar(ornament.scale + (1 - weightedProgress) * 0.25);
    matrix.compose(position, quaternion, scale);
    mesh.setMatrixAt(index, matrix);
  });

  mesh.instanceMatrix.needsUpdate = true;
};

const Ornaments = ({ progressRef }: OrnamentsProps) => {
  const giftRef = useRef<THREE.InstancedMesh>(null);
  const ballRef = useRef<THREE.InstancedMesh>(null);
  const lightRef = useRef<THREE.InstancedMesh>(null);
  const polaroidRefs = useRef<Array<THREE.InstancedMesh | null>>([]);

  const gifts = useMemo(() => createOrnaments(48, 4.2, 6, 1.4), []);
  const balls = useMemo(() => createOrnaments(70, 4.5, 8.4, 1.1), []);
  const lights = useMemo(() => createOrnaments(120, 5, 9, 0.8), []);
  const polaroids = useMemo(() => createOrnaments(36, 4.8, 7.5, 0.9), []);
  const polaroidGroups = useMemo(
    () => [polaroids.slice(0, 12), polaroids.slice(12, 24), polaroids.slice(24, 36)],
    [polaroids]
  );

  const polaroidTextures = useMemo(
    () => [createPolaroidTexture(1), createPolaroidTexture(2), createPolaroidTexture(3)],
    []
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const progress = progressRef.current;

    if (giftRef.current) {
      applyInstanceMatrices(giftRef.current, gifts, progress, time);
    }
    if (ballRef.current) {
      applyInstanceMatrices(ballRef.current, balls, progress, time + 1.2);
    }
    if (lightRef.current) {
      applyInstanceMatrices(lightRef.current, lights, progress, time + 2.1);
    }
    polaroidRefs.current.forEach((mesh, index) => {
      if (mesh) {
        applyInstanceMatrices(mesh, polaroidGroups[index], progress, time + 3.4 + index);
      }
    });
  });

  return (
    <group>
      <instancedMesh ref={giftRef} args={[undefined, undefined, gifts.length]}>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshStandardMaterial color="#d6b25e" metalness={0.7} roughness={0.2} />
      </instancedMesh>
      <instancedMesh ref={ballRef} args={[undefined, undefined, balls.length]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#b2183b" metalness={0.6} roughness={0.2} />
      </instancedMesh>
      <instancedMesh ref={lightRef} args={[undefined, undefined, lights.length]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#f7e5b2" emissive="#f7e5b2" emissiveIntensity={1.5} />
      </instancedMesh>
      {polaroidTextures.map((texture, index) => (
        <instancedMesh
          key={texture.uuid}
          ref={(mesh) => {
            polaroidRefs.current[index] = mesh;
          }}
          args={[undefined, undefined, 12]}
        >
          <planeGeometry args={[0.7, 0.95]} />
          <meshStandardMaterial map={texture} metalness={0.2} roughness={0.6} />
        </instancedMesh>
      ))}
    </group>
  );
};

export default Ornaments;
