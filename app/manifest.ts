import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Teach For Free',
        short_name: 'TFF',
        description: 'Teacher Scheduler',
        start_url: '/',
        display: 'standalone',
        background_color: '#A197F8',
        theme_color: '#0F0F19',
        icons: [
            {
                src: '/images/pwaImg.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/images/pwaImg.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}