'use client'

import { useState } from 'react'
import Image from 'next/image'

interface GalleryImage {
  src: string
  alt: string
}

interface GalleryData {
  title: string
  images: GalleryImage[]
}

export default function Gallery({ data }: { data: GalleryData }) {
  const [lightbox, setLightbox] = useState<string | null>(null)

  return (
    <section id="gallery" className="aged-paper py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-pt text-xs uppercase tracking-[0.3em] text-soviet-red mb-4">
            ★ Атмосфера ★
          </p>
          <h2 className="section-title text-soviet-dark mb-6">{data.title}</h2>
          <div className="red-divider" />
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {data.images.map((img, i) => (
            <div
              key={i}
              className={`relative overflow-hidden cursor-pointer group ${
                i === 0 ? 'col-span-2 md:col-span-1 md:row-span-2' : ''
              }`}
              style={{ aspectRatio: i === 0 ? '3/4' : '4/3' }}
              onClick={() => setLightbox(img.src)}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-soviet-red/0 group-hover:bg-soviet-red/20 transition-all duration-300" />
              {/* Soviet red corner accent */}
              <div className="absolute top-0 left-0 w-0 h-0 border-t-[40px] border-l-[40px] border-t-soviet-red/0 border-l-soviet-red/0 group-hover:border-t-soviet-red group-hover:border-l-soviet-red transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
            <Image
              src={lightbox}
              alt="Gallery"
              width={1200}
              height={800}
              className="object-contain max-h-[90vh] w-full"
            />
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-soviet-red text-3xl font-russo leading-none"
              onClick={() => setLightbox(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
