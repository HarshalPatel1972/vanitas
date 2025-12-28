
import { ScrollControls, Scroll, useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { SocialCard } from './SocialCard'
import { useStore } from '@/store/useStore'
import * as THREE from 'three'

interface Post {
    id: number
    url: string
    text: string
}

const POSTS: Post[] = [
    { id: 1, url: 'https://picsum.photos/seed/entropy1/800/600', text: '@user_01: Just living my best life #blessed' },
    { id: 2, url: 'https://picsum.photos/seed/entropy2/800/600', text: '@dev_null: Why is everything melting? #glitch' },
    { id: 3, url: 'https://picsum.photos/seed/entropy3/800/600', text: '@entropy_bot: System integrity at 40%...' },
    { id: 4, url: 'https://picsum.photos/seed/entropy4/800/600', text: '@void_walker: The pixels are tasty.' },
    { id: 5, url: 'https://picsum.photos/seed/entropy5/800/600', text: '@echo_location: Is anyone else seeing this?' },
]

function FeedContent() {
    const scroll = useScroll()
    const lastDecayRef = useRef(0)

    useFrame(() => {
        const isRepairing = useStore.getState().isRepairing
        
        // If repairing, force scroll to top
        if (isRepairing) {
            const current = scroll.el.scrollTop
            if (current > 1) {
                scroll.el.scrollTop = current * 0.9 // Smooth scroll up
            } else {
                scroll.el.scrollTop = 0
            }
        }

        // Map scroll offset (0 to 1) to decay level
        const offset = scroll.offset
        
        // Only update store if value changed significantly (avoid 60fps updates)
        if (Math.abs(offset - lastDecayRef.current) > 0.001) {
            lastDecayRef.current = offset
            useStore.getState().setDecayLevel(offset)
        }
    })

    return (
        <>
            {POSTS.map((post, i) => (
                <SocialCard 
                    key={post.id}
                    index={i}
                    url={post.url} 
                    text={post.text}
                    position={[0, -i * 5, 0]} // Stack vertically
                />
            ))}
        </>
    )
}

export function Feed() {
  return (
    <ScrollControls pages={POSTS.length} damping={0.2}>
      <Scroll>
        <FeedContent />
      </Scroll>
    </ScrollControls>
  )
}
