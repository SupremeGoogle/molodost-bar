'use client'

import { useState } from 'react'
import Image from 'next/image'

interface GalleryImage { src: string; alt: string }
interface GalleryData { title: string; images: GalleryImage[] }

export default function Gallery({ data }: { data: GalleryData }) {
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState(0)

  const open = (src: string, i: number) => { setLightbox(src); setLightboxIdx(i) }
  const prev = () => { const i = (lightboxIdx - 1 + data.images.length) % data.images.length; setLightbox(data.images[i].src); setLightboxIdx(i) }
  const next = () => { const i = (lightboxIdx + 1) % data.images.length; setLightbox(data.images[i].src); setLightboxIdx(i) }

  return (
    <section id="gallery" className="bg-soviet-dark2 py-20 relative overflow-hidden">
      {/* Carpet-style decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-soviet-red" />
      <div
        className="absolute top-1.5 left-0 right-0 h-px opacity-20"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, #C00020 0px, #C00020 8px, transparent 8px, transparent 16px)',
        }}
      />

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 border-b border-white/8 pb-6">
          <div>
            <p className="font-pt text-[11px] uppercase tracking-[0.35em] text-soviet-red mb-2">★ Атмосфера</p>
            <h2 className="font-russo text-4xl md:text-5xl uppercase text-aged-cream">{data.title}</h2>
          </div>
          <span className="font-pt text-xs text-white/20 uppercase tracking-widest hidden md:block">
            {data.images.length} фото
          </span>
        </div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-12 grid-rows-2 gap-3 h-[75vh] min-h-[500px]">
          {/* Large left */}
          <div
            className="col-span-12 md:col-span-7 row-span-2 relative overflow-hidden cursor-pointer group"
            onClick={() => open(data.images[0].src, 0)}
          >
            <Image src={data.images[0].src} alt={data.images[0].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="60vw" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute bottom-4 left-4 font-pt text-xs text-white/50 uppercase tracking-widest">{data.images[0].alt}</span>
          </div>

          {/* Right top */}
          <div
            className="col-span-6 md:col-span-5 row-span-1 relative overflow-hidden cursor-pointer group"
            onClick={() => open(data.images[1].src, 1)}
          >
            <Image src={data.images[1].src} alt={data.images[1].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="40vw" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          </div>

          {/* Right bottom */}
          <div
            className="col-span-6 md:col-span-5 row-span-1 relative overflow-hidden cursor-pointer group"
            onClick={() => open(data.images[2].src, 2)}
          >
            <Image src={data.images[2].src} alt={data.images[2].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="40vw" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          </div>
        </div>

        {/* Bottom strip */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          {data.images.slice(3).map((img, i) => (
            <div
              key={i}
              className="relative overflow-hidden cursor-pointer group"
              style={{ aspectRatio: '4/3' }}
              onClick={() => open(img.src, i + 3)}
            >
              <Image src={img.src} alt={img.alt} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="33vw" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-soviet-red/15 transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-soviet-red text-2xl font-russo" onClick={() => setLightbox(null)}>✕</button>
          <button className="absolute left-4 md:left-10 text-white/50 hover:text-soviet-red text-5xl font-russo" onClick={(e) => { e.stopPropagation(); prev() }}>‹</button>
          <div className="relative max-w-4xl max-h-[85vh] w-full mx-16" onClick={(e) => e.stopPropagation()}>
            <Image src={lightbox} alt="" width={1200} height={800} className="object-contain max-h-[85vh] w-full" />
          </div>
          <button className="absolute right-4 md:right-10 text-white/50 hover:text-soviet-red text-5xl font-russo" onClick={(e) => { e.stopPropagation(); next() }}>›</button>
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 font-pt text-xs text-white/30 uppercase tracking-widest">
            {lightboxIdx + 1} / {data.images.length}
          </span>
        </div>
      )}
    </section>
  )
}
