'use client';

import React, { useRef, useMemo } from 'react';
import { View, useTexture } from '@react-three/drei';
import { useFrame, extend } from '@react-three/fiber';
import { SignalDecayMaterial } from '../shaders/SignalDecayMaterial';
import { useStore } from '../store/useStore';
import * as THREE from 'three';

extend({ SignalDecayMaterial });

interface SignalImageProps {
  src: string;
  className?: string; // HTML class for the placeholder div
}

export const SignalImage: React.FC<SignalImageProps> = ({ src, className }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const entropy = useStore((state) => state.entropyLevel);
  // Ref for the material
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const materialRef = useRef<any>(null);

  // Load texture
  const texture = useTexture(src);
  
  // Update shader uniforms
  useFrame((state) => {
    if (materialRef.current) {
        materialRef.current.uTime = state.clock.elapsedTime;
        materialRef.current.uEntropy = entropy;
    }
  });

  return (
    <>
      {/* HTML Layout Placeholder */}
      <div ref={divRef} className={className} />
      
      {/* 3D Portal into the Div */}
      <View track={divRef as React.MutableRefObject<HTMLElement>}>
        <mesh position={[0,0,0]}>
            <planeGeometry args={[1.7, 1]} /> {/* Aspect Ratio assumed ~16:9 roughly, View fits it */}
            {/* @ts-expect-error - Custom Shader Material */}
            <signalDecayMaterial 
                ref={materialRef} 
                uTexture={texture}
                transparent
            />
        </mesh>
      </View>
    </>
  );
};
