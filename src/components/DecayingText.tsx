'use client';

import React from 'react';
import { useStore } from '../store/useStore';

interface DecayingTextProps {
  text: string;
  type: 'title' | 'meta' | 'body';
  baseEntropy: number; // The entropy point where this specific card lives
}

export const DecayingText: React.FC<DecayingTextProps> = ({ text, type, baseEntropy }) => {
  const globalEntropy = useStore((state) => state.entropyLevel);
  
  // Calculate local "damage" for this text
  // The deeper we scroll (higher baseEntropy), AND the higher the global entropy is.
  // Actually globalEntropy is derived from scroll, so we just compare.
  // Let's say: If globalEntropy > baseEntropy, we start rotting.
  // Wait, if entropy is global (0 to 1 based on scroll), and items are at different scroll positions...
  // The Store 'entropyLevel' is basically 'scrollPosition %'.
  
  // Logic: 
  // We want items at the top to be clean when we are at the top.
  // When we scroll down, EVERYTHING decays? 
  // Prompt: "The Content Cards individually degrade based on a global 'Entropy' value."
  // So if I am at the bottom (Entropy 1.0), even the top card is fully corrupted.
  // AND the bottom card is fully corrupted.
  // So 'baseEntropy' might not be needed if uniform decay is the goal.
  // BUT visually, usually things "off screen" don't matter.
  // Let's stick to Global Entropy affects ALL visible text equally.
  
  const decayStage = globalEntropy;

  // Render Logic
  const redactedText = React.useMemo(() => {
    if (decayStage < 0.1) return text; // Clean

    return text.split('').map((char, i) => {
      // Space usually stays space
      if (char === ' ') return ' ';
      
      // Random deterministic seed based on char index + entropy
      // We want it to be stable-ish but progressive
      const randomVal = Math.sin(i * 999 + decayStage * 50);
      
      // Stage 1: Random Symbol Replacements (30-70%)
      if (decayStage > 0.3 && decayStage < 0.7) {
         if (randomVal < (decayStage - 0.2)) { // Progressive probability
             const symbols = ['$', '#', '!', '?', '█', '/', '\\'];
             return symbols[Math.floor(Math.abs(randomVal * 10)) % symbols.length];
         }
      }
      
      // Stage 2: Full Redaction > 70%
      if (decayStage >= 0.7) {
          // Keep a few words readable?
          // "User has to squint"
          // Heavily redacted.
          if (randomVal < 0.8) return '█';
      }
      
      return char;
    }).join('');
  }, [text, decayStage]);

  const className = type === 'title' 
    ? "text-2xl font-bold tracking-tight uppercase"
    : "text-xs font-mono text-gray-400";

  return (
    <span className={className}>
      {redactedText}
    </span>
  );
};
