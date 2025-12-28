'use client';

import GlobalCanvas from '../components/GlobalCanvas';
import FeedLayout from '../components/FeedLayout';

export default function Home() {
  return (
    <main className="w-full h-screen bg-black text-white relative font-sans selection:bg-white selection:text-black">
      {/* The 3D Layer (Fixed in background, portals into FeedLayout) */}
      <GlobalCanvas />
      
      {/* The HTML UI Layer (Scrollable) */}
      <FeedLayout />
    </main>
  );
}
