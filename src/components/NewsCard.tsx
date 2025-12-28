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
      {/* Image Plane */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[4, 3, 32, 32]} />
        {/* @ts-expect-error - Custom element */}
        <vanitasMeltMaterial ref={imageMaterialRef} uTexture={texture} transparent />
      </mesh>

      {/* Title Text */}
      <Text
        position={[-1.8, -1.8, 0.1]}
        fontSize={0.25}
        color="#E0E0E0"
        anchorX="left"
        anchorY="top"
        maxWidth={3.8}
        font="https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff" // Online URL for Playfair or local
      >
        {item.title}
        {/* We can try to use custom material here, but might break SDF rendering. 
            For now, let's just keep standard text material but maybe colorize/glitch via props later. 
            Detailed shader on text is Phase 3 really, creating the shader was Phase 3.
            If I want to enforce Phase 3 logic now:
        */}
        {/* <vanitasMeltMaterial attach="material" ref={textMaterialRef} uTexture={null} /> */}
      </Text>

      {/* Source & Date */}
      <Text
        position={[-1.8, -2.5, 0.1]}
        fontSize={0.15}
        color="#FF2A2A"
        anchorX="left"
        anchorY="top"
        font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0Pn5.woff" // JetBrains Mono
      >
        {`${item.source} • ${item.date}`}
      </Text>
    </group>
  );
};
