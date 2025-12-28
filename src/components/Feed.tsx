
import { ScrollControls, Scroll, useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { SocialCard } from './SocialCard'
import { useStore } from '@/store/useStore'

// High-end, Fashion/Clinical Photography (Unsplash Source)
const POSTS = [
    { id: 1, url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80', text: 'Subject 001: The Gaze' },
    { id: 2, url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80', text: 'Subject 002: Isolation' },
    { id: 3, url: 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=800&q=80', text: 'Subject 003: Structure' },
    { id: 4, url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', text: 'Subject 004: Identity' },
    { id: 5, url: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800&q=80', text: 'Subject 005: Form' },
    { id: 6, url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80', text: 'Subject 006: Void' },
    { id: 7, url: 'https://images.unsplash.com/photo-1488161628813-994252600572?w=800&q=80', text: 'Subject 007: Fade' },
    { id: 8, url: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?w=800&q=80', text: 'Subject 008: Echo' },
    { id: 9, url: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=800&q=80', text: 'Subject 009: Static' },
    { id: 10, url: 'https://images.unsplash.com/photo-1517423568366-697553540371?w=800&q=80', text: 'Subject 010: End' },
]

function FeedContent() {
    const scroll = useScroll()
    const lastEntropyRef = useRef(0)

    useFrame(() => {
        // Link scroll distance to entropy.
        // Scroll 0 = Entropy 0.
        // Scroll 100% = Entropy 1.0 (Total Destruction)
        const offset = scroll.offset
        
        // Update store only when changed significantly to avoid React render thrashing
        if (Math.abs(offset - lastEntropyRef.current) > 0.0005) {
            lastEntropyRef.current = offset
            useStore.getState().setEntropyLevel(offset)
        }
    })

    return (
        <group position={[0, 0, 0]}>
            {POSTS.map((post, i) => (
                <SocialCard 
                    key={post.id}
                    index={i}
                    url={post.url} 
                    text={post.text}
                    position={[0, -i * 2.5, 0]} // Vertical stacking with generous whitespace
                />
            ))}
        </group>
    )
}

export function Feed() {
  return (
    // Damping 0.1 for that heavy, "luxurious" inertial feel
    <ScrollControls pages={POSTS.length * 0.4} damping={0.1}>
      <Scroll>
        <FeedContent />
      </Scroll>
    </ScrollControls>
  )
}
