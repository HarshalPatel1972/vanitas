import { ScrollControls, Scroll, useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { SocialCard } from './SocialCard'
import { useStore } from '@/store/useStore'

interface Post {
    id: number
    url: string
    text: string
}

// Curated images for visual impact
const POSTS: Post[] = [
    { 
        id: 1, 
        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', 
        text: '@void_architect · The beauty of digital decay' 
    },
    { 
        id: 2, 
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', 
        text: '@entropy_watcher · Systems fail. This is inevitable.' 
    },
    { 
        id: 3, 
        url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80', 
        text: '@data_ghost · Nothing lasts. Not even pixels.' 
    },
    { 
        id: 4, 
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', 
        text: '@null_prophet · The feed consumes. The feed decays.' 
    },
    { 
        id: 5, 
        url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80', 
        text: '@static_dreamer · Watch it melt. Watch it burn.' 
    },
    { 
        id: 6, 
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 
        text: '@bit_rot · Every scroll brings you closer to nothing.' 
    },
]

function FeedContent() {
    const scroll = useScroll()
    const lastDecayRef = useRef(0)

    useFrame(() => {
        const isRepairing = useStore.getState().isRepairing
        
        if (isRepairing) {
            const current = scroll.el.scrollTop
            if (current > 1) {
                scroll.el.scrollTop = current * 0.92
            } else {
                scroll.el.scrollTop = 0
            }
        }

        const offset = scroll.offset
        
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
                    position={[0, -i * 4.5, 0]}
                />
            ))}
        </>
    )
}

export function Feed() {
  return (
    <ScrollControls pages={POSTS.length * 0.8} damping={0.15}>
      <Scroll>
        <FeedContent />
      </Scroll>
    </ScrollControls>
  )
}
