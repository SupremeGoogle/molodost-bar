'use client'

import { useState } from 'react'
import Image from 'next/image'

interface PriceImage {
  src: string
  alt: string
}

interface PriceData {
  title: string
  images: PriceImage[]
}

export default function PriceMenu({ data }: { data: PriceData }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const prev = () => setActive((a) => (a - 1 + data.images.length) % data.images.length)
  const next = () => setActive((a) => (a + 1) % data.images.length)

  return (
    <section id="menu" className="bg-soviet-dark py-24 relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(-45deg, #C00020 0px, #C00020 1px, transparent 1px, transparent 20px)',
        }}
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="font-pt text-xs uppercase tracking-[0.3em] text-soviet-red mb-4">
            ★ Прейскурант цен ★
          </p>
          <h2 className="section-title text-aged-cream mb-6">{data.title}</h2>
          <div className="red-divider" />
        </div>

        {/* Main viewer */}
        <div className="flex flex-col items-center">
          {/* Page counter */}
          <div className="flex items-center gap-4 mb-6">
            {data.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i === active ? 'bg-soviet-red scale-150' : 'bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Page viewer */}
          <div className="relative w-full max-w-2xl mx-auto">
            {/* Navigation buttons */}
            <button
              onClick={prev}
              className="absolute -left-4 md:-left-16 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 border border-soviet-red/50 text-soviet-red hover:bg-soviet-red hover:text-white transition-all duration-200 font-russo text-lg flex items-center justify-center"
            >
              ‹
            </button>

            {/* Current page */}
            <div
              className="relative cursor-zoom-in soviet-border"
              onClick={() => setLightbox(true)}
            >
              <Image
                src={data.images[active].src}
                alt={data.images[active].alt}
                width={600}
                height={850}
                className="w-full object-contain shadow-2xl shadow-black/80"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5" />
              <div className="absolute bottom-4 right-4 text-xs font-pt text-soviet-red bg-soviet-dark/80 px-2 py-1">
                {active + 1} / {data.images.length}
              </div>
            </div>

            <button
              onClick={next}
              className="absolute -right-4 md:-right-16 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 border border-soviet-red/50 text-soviet-red hover:bg-soviet-red hover:text-white transition-all duration-200 font-russo text-lg flex items-center justify-center"
            >
              ›
            </button>
          </div>

          {/* Thumbnail strip */}
          <div className="flex gap-3 mt-8 overflow-x-auto pb-2 max-w-full">
            {data.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative flex-shrink-0 w-16 h-20 overflow-hidden border-2 transition-all duration-200 ${
                  i === active ? 'border-soviet-red' : 'border-transparent opacity-50 hover:opacity-80'
                }`}
              >
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(false)}>
          <div className="relative max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={data.images[active].src}
              alt={data.images[active].alt}
              width={600}
              height={850}
              className="w-full object-contain max-h-[90vh]"
            />
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-soviet-red text-3xl"
              onClick={() => setLightbox(false)}
            >
              ✕
            </button>
            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full text-soviet-red text-4xl px-4"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full text-soviet-red text-4xl px-4"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
