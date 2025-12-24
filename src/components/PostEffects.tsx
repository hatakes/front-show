import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

const PostEffects = () => {
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

export default PostEffects;
