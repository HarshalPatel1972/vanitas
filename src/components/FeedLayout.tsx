'use client';

import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { MOCK_NEWS } from '../lib/mockData';
import { SignalImage } from './SignalImage';
import { DecayingText } from './DecayingText';

export default function FeedLayout() {
  const { setNewsData, setEntropyLevel, isLocked, checkLockout, quickYield, lockoutTime } = useStore();
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     setNewsData(MOCK_NEWS);
     checkLockout();
  }, [setNewsData, checkLockout]);

  // Scroll Listener for Entropy
  useEffect(() => {
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        
        // Calculate 0 to 1 progress
        // Ensure we can actually reach 1.0 logic
        const maxScroll = scrollHeight - clientHeight;
        const progress = Math.max(0, Math.min(1, scrollTop / maxScroll));
        
        setEntropyLevel(progress);
    };

    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, [setEntropyLevel]);


  // Lockout View
  if (isLocked) {
      const remainingMin = lockoutTime ? Math.ceil((lockoutTime - Date.now()) / 60000) : 60;
      
      return (
          <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center font-mono text-center p-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter text-red-600 animate-pulse">SIGNAL LOST</h1>
              <div className="w-full max-w-md h-px bg-red-900 my-8"></div>
              <p className="text-gray-500 uppercase text-xs mb-2">Connection severed. Integrity Restoration required.</p>
              <h2 className="text-8xl text-white font-black mb-12">{remainingMin}m</h2>
              
              <button 
                onClick={quickYield}
                className="text-[10px] text-gray-800 hover:text-red-500 border border-transparent hover:border-red-900 px-4 py-2 uppercase"
              >
                  [DEV OVERRIDE: RECONNECT]
              </button>
          </div>
      );
  }

  return (
    <div className="w-full h-full relative flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-16 border-b border-white/20 bg-black/80 backdrop-blur-md z-40 flex items-center justify-between px-6">
        <h1 className="text-xl font-bold tracking-tighter text-white">VANITAS</h1>
        <div className="flex gap-2 text-[10px] font-mono text-gray-400">
            <span>SECURE_CONNECTION</span>
            <span className="text-green-500">●</span>
        </div>
      </header>

      {/* Scrollable Feed Container */}
      <div 
        ref={scrollRef}
        className="w-full h-full overflow-y-auto pt-24 pb-24 px-4 scroll-smooth"
      >
        <div className="max-w-2xl mx-auto space-y-12 md:space-y-24">
            {MOCK_NEWS.map((item, i) => (
                <div key={i} className="flex flex-col gap-4">
                    {/* The 3D Image Window */}
                    <div className="w-full aspect-video border border-white/10 bg-white/5 relative overflow-hidden">
                        {/* 1.7 aspect ratio matches the plane geometry in SignalImage roughly */}
                        <SignalImage src={item.image} className="w-full h-full" />
                    </div>
                    
                    {/* The Text Info */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-baseline border-b border-white/10 pb-2 mb-2">
                            <DecayingText text={`REF: ${item.source.toUpperCase()}`} type="meta" baseEntropy={0} />
                            <DecayingText text={item.date} type="meta" baseEntropy={0} />
                        </div>
                        <DecayingText text={item.title} type="title" baseEntropy={0} />
                        <div className="mt-2 text-sm text-gray-400">
                            {/* Summary if available or mock summary */}
                            <DecayingText 
                                text={item.summary || "Transmitting full report details... [REDACTED]... Awaiting further packets from the source."} 
                                type="body" 
                                baseEntropy={0} 
                            />
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Footer / End of infinite scroll marker */}
            <div className="h-48 flex items-center justify-center text-xs font-mono text-gray-600">
                END OF STREAM
            </div>
        </div>
      </div>
      
      {/* Footer Status */}
      <footer className="fixed bottom-0 left-0 w-full h-10 border-t border-white/10 bg-black z-40 flex items-center justify-between px-6 text-[10px] font-mono text-gray-500 uppercase">
          <span>LATENCY: 12ms</span>
          <span>ENTROPY_MONITOR: ACTIVE</span>
      </footer>
    </div>
  );
}
