import { Component, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

class PostEffectsBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

const PostEffectsInner = () => {
  const { gl, size, scene, camera } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);

  const bloomPass = useMemo(() => {
    return new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 1.2, 0.4, 0.8);
  }, [size.height, size.width]);

  useEffect(() => {
    if (!gl) return;

    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(bloomPass);
    composerRef.current = composer;

    const previousAutoClear = gl.autoClear;
    gl.autoClear = false;

    return () => {
      composer.dispose();
      gl.autoClear = previousAutoClear;
    };
  }, [bloomPass, camera, gl, scene]);

  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height);
  }, [size.height, size.width]);

  useFrame(() => {
    composerRef.current?.render();
  }, 1);

  return null;
};

const PostEffects = () => {
  return (
    <PostEffectsBoundary>
      <PostEffectsInner />
    </PostEffectsBoundary>
  );
};

export default PostEffects;
