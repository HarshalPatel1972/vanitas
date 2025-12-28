
import { ScrollControls, Scroll, useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
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
    const setDecayLevel = useStore((state) => state.setDecayLevel)

    useFrame(() => {
        // Map scroll offset (0 to 1) to decay level
        // We might want to make it 1 when at the bottom.
        // scroll.offset is current / (total - viewport)
        const offset = scroll.offset
        setDecayLevel(offset)
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
