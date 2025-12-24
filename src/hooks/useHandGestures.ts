import { useEffect, useRef, useState } from 'react';
import type { Hands } from '@mediapipe/hands';
import type { Camera } from '@mediapipe/camera_utils';

export type GestureState = 'OPEN' | 'CLOSED' | 'NONE';

export interface HandGestureData {
  gesture: GestureState;
  rotation: { x: number; y: number };
  active: boolean;
}

const OPEN_THRESHOLD = 0.23;

const distance = (a: { x: number; y: number; z?: number }, b: { x: number; y: number; z?: number }) => {
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.hypot(a.x - b.x, a.y - b.y, dz);
};

export const useHandGestures = () => {
  const [gesture, setGesture] = useState<GestureState>('NONE');
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const cameraRef = useRef<Camera | null>(null);
  const handsRef = useRef<Hands | null>(null);

  useEffect(() => {
    let cancelled = false;
    const video = document.createElement('video');
    video.setAttribute('playsinline', 'true');
    video.style.position = 'fixed';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    document.body.appendChild(video);

    const handleResults = (results: { multiHandLandmarks?: Array<Array<{ x: number; y: number; z: number }>> }) => {
      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        setActive(false);
        setGesture('NONE');
        return;
      }

      const landmarks = results.multiHandLandmarks[0];
      setActive(true);

      const wrist = landmarks[0];
      const indexTip = landmarks[8];
      const middleTip = landmarks[12];
      const ringTip = landmarks[16];
      const pinkyTip = landmarks[20];

      const avgSpread =
        (distance(indexTip, wrist) +
          distance(middleTip, wrist) +
          distance(ringTip, wrist) +
          distance(pinkyTip, wrist)) /
        4;

      setGesture(avgSpread > OPEN_THRESHOLD ? 'OPEN' : 'CLOSED');

      const center = landmarks.reduce(
        (acc, point) => ({
          x: acc.x + point.x,
          y: acc.y + point.y
        }),
        { x: 0, y: 0 }
      );

      const normalized = {
        x: center.x / landmarks.length,
        y: center.y / landmarks.length
      };

      setRotation({
        x: (normalized.y - 0.5) * 0.6,
        y: (normalized.x - 0.5) * 0.8
      });
    };

    const setupCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setActive(false);
          return;
        }

        const [{ Hands: HandsCtor }, { Camera: CameraCtor }] = await Promise.all([
          import('@mediapipe/hands'),
          import('@mediapipe/camera_utils')
        ]);

        if (cancelled) return;

        const hands = new HandsCtor({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          selfieMode: true,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6
        });

        hands.onResults(handleResults);
        handsRef.current = hands;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        video.srcObject = stream;
        await video.play();

        const camera = new CameraCtor(video, {
          onFrame: async () => {
            if (cancelled) return;
            try {
              await hands.send({ image: video });
            } catch (error) {
              setActive(false);
              cancelled = true;
              camera.stop();
            }
          },
          width: 640,
          height: 480
        });

        camera.start();
        cameraRef.current = camera;
      } catch (error) {
        setActive(false);
      }
    };

    void setupCamera();

    return () => {
      cancelled = true;
      cameraRef.current?.stop();
      handsRef.current?.close();
      const tracks = (video.srcObject as MediaStream | null)?.getTracks();
      tracks?.forEach((track) => track.stop());
      video.remove();
    };
  }, []);

  return { gesture, rotation, active } satisfies HandGestureData;
};
