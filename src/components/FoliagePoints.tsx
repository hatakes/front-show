import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';
import * as THREE from 'three';

interface FoliagePointsProps {
  progressRef: MutableRefObject<number>;
}

const createFoliageGeometry = (count: number) => {
  const chaos = new Float32Array(count * 3);
  const target = new Float32Array(count * 3);
  const scale = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const radius = 10 * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    chaos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    chaos[i * 3 + 1] = radius * Math.cos(phi) + 3;
    chaos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    const height = 9;
    const y = Math.random() * height;
    const coneRadius = (1 - y / height) * 4.8;
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * coneRadius;

    target[i * 3] = r * Math.cos(angle);
    target[i * 3 + 1] = y;
    target[i * 3 + 2] = r * Math.sin(angle);

    scale[i] = 2 + Math.random() * 3;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(chaos, 3));
  geometry.setAttribute('aChaos', new THREE.BufferAttribute(chaos, 3));
  geometry.setAttribute('aTarget', new THREE.BufferAttribute(target, 3));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));

  return geometry;
};

const FoliagePoints = ({ progressRef }: FoliagePointsProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => createFoliageGeometry(1800), []);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = progressRef.current;
    }
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uProgress: { value: progressRef.current },
          uColorA: { value: new THREE.Color('#0c3b30') },
          uColorB: { value: new THREE.Color('#d6b25e') }
        }}
        vertexShader={`
          attribute vec3 aChaos;
          attribute vec3 aTarget;
          attribute float aScale;
          uniform float uProgress;
          varying float vY;

          void main() {
            vec3 mixed = mix(aChaos, aTarget, uProgress);
            vY = mixed.y;
            vec4 mvPosition = modelViewMatrix * vec4(mixed, 1.0);
            gl_PointSize = aScale * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          varying float vY;

          void main() {
            float dist = length(gl_PointCoord - 0.5);
            if (dist > 0.5) discard;
            float mixVal = smoothstep(0.0, 9.0, vY);
            vec3 color = mix(uColorA, uColorB, mixVal);
            float alpha = smoothstep(0.5, 0.0, dist);
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </points>
  );
};

export default FoliagePoints;
