import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import { useStore } from '../store/useStore';
import { NewsItem } from '../store/useStore';

interface NewsCardProps {
  item: NewsItem;
  position: [number, number, number];
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, position }) => {
  const entropyLevel = useStore((state) => state.entropyLevel);
  // Ideally we would load the texture. For mock data we have URLs.
  // We need to handle texture loading errors or pre-loading.
  // useTexture can suspend.
  
  // Safe texture loading (fallback if fails not implemented here for brevity, assume valid urls)
  const texture = useTexture(item.image);
  
  // Refs for materials to update uniforms
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageMaterialRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textMaterialRef = useRef<any>(null);
  
  // Random offset for floating effect or just static grid? Prompt says "single-column 3D scroll".
  
  useFrame((state) => {
    if (imageMaterialRef.current) {
      imageMaterialRef.current.uTime = state.clock.elapsedTime;
      imageMaterialRef.current.uEntropy = entropyLevel;
    }
    // We can apply the same logic to text if we use the custom material on it
    if (textMaterialRef.current) {
      textMaterialRef.current.uTime = state.clock.elapsedTime;
      textMaterialRef.current.uEntropy = entropyLevel;
    }
  });

  return (
    <group position={position}>
      {/* Image Plane - Optimized Geometry */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[4, 3, 20, 20]} />
        {/* @ts-expect-error - Custom element */}
        <vanitasMeltMaterial ref={imageMaterialRef} uTexture={texture} transparent />
      </mesh>

      {/* Title Text */}
      <Text
        position={[-1.9, -1.8, 0.05]}
        fontSize={0.22}
        color="#E0E0E0"
        anchorX="left"
        anchorY="top"
        maxWidth={3.8}
        lineHeight={1.2}
        font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
      >
        {item.title}
      </Text>

      {/* Source & Date */}
      <Text
        position={[-1.8, -2.5, 0.1]}
        fontSize={0.15}
        color="#FF2A2A"
        anchorX="left"
        anchorY="top"
        // font URL removed for stability
      >
        {`${item.source} • ${item.date}`}
      </Text>
    </group>
  );
};
