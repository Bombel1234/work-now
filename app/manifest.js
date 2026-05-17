

export default function manifest() {
  return {
    id:'/',
    name: 'My Work',
    short_name: 'My Work',
    description: 'Moj grafik pracy',
    start_url: '/',
    display: 'standalone',
    background_color: 'rgb(100, 100, 191)',
    theme_color: 'rgb(26, 125, 125)',
    icons: [
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-180.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    screenshots: [
      
    // {
    //   "src": "images/Screenshot_1080x2408.png",
    //   "type": "image/png",
    //   "sizes": "1080x2408",
    //   "form_factor": "wide"
    // },
    
  ]
  }
}