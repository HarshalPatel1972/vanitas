'use client';

import React, { useRef, useMemo } from 'react';
import { View, useTexture } from '@react-three/drei';
import { useFrame, extend } from '@react-three/fiber';
import { SignalDecayMaterial } from '../shaders/SignalDecayMaterial';
import { useStore } from '../store/useStore';
import * as THREE from 'three';

// Add Typescript support for the custom element
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      signalDecayMaterial: any; 
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

extend({ SignalDecayMaterial });

interface SignalImageProps {
  src: string;
  className?: string;
}

// Internal Component: Runs INSIDE the Canvas Context
const SignalDecayScene = ({ src }: { src: string }) => {
    const entropy = useStore((state) => state.entropyLevel);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const materialRef = useRef<any>(null);
    const texture = useTexture(src);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime;
            materialRef.current.uEntropy = entropy;
        }
    });

    return (
        <mesh position={[0,0,0]}>
            <planeGeometry args={[1.7, 1]} />
            <signalDecayMaterial 
                ref={materialRef} 
                uTexture={texture}
                transparent
            />
        </mesh>
    );
};

export const SignalImage: React.FC<SignalImageProps> = ({ src, className }) => {
  const divRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={divRef} className={className} />
      
      <View track={divRef as React.MutableRefObject<HTMLElement>}>
        <SignalDecayScene src={src} />
      </View>
    </>
  );
};
