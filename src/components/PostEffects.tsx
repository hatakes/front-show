import { Component, useEffect, useState, type ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

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
  const { gl, size } = useThree();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (gl && size.width > 0 && size.height > 0) {
      setReady(true);
    }
  }, [gl, size.height, size.width]);

  if (!ready) {
    return null;
  }

  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.8} intensity={1.2} mipmapBlur />
    </EffectComposer>
  );
};

const PostEffects = () => {
  return (
    <PostEffectsBoundary>
      <PostEffectsInner />
    </PostEffectsBoundary>
  );
};

export default PostEffects;
