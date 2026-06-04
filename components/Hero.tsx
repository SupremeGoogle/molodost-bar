'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

interface HeroData {
  tagline: string
  description: string
}

export default function Hero({ data }: { data: HeroData }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden bg-black">
      {/* Background — ковёр */}
      <Image
        src="/ковер.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center scale-105"
        style={{ filter: 'saturate(0.6) brightness(0.30)' }}
      />

      {/* Diagonal red constructivist slab */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, rgba(192,0,32,0.18) 0%, transparent 55%)',
        }}
      />

      {/* Top red banner stripe */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-soviet-red z-20" />

      {/* Vertical red left accent */}
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-soviet-red/60 z-20" />

      {/* Content — left-aligned, full editorial */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-screen-xl mx-auto">

        {/* City / year badge */}
        <div
          className={`flex items-center gap-4 mb-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '100ms' }}
        >
          <div className="w-12 h-px bg-soviet-red" />
          <span className="font-pt text-xs uppercase tracking-[0.45em] text-white/40">
            Кафе-бар · Липецк
          </span>
        </div>

        {/* Giant title */}
        <div
          className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ transitionDelay: '200ms' }}
        >
          <h1
            className="font-russo uppercase leading-[0.82] text-white"
            style={{ fontSize: 'clamp(5rem, 18vw, 18rem)', letterSpacing: '-0.02em' }}
          >
            МО<span className="text-soviet-red">ЛО</span>
            <br />ДОСТЬ
          </h1>
        </div>

        {/* Tagline */}
        <div
          className={`mt-4 flex items-center gap-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '350ms' }}
        >
          <div className="w-0.5 h-14 bg-soviet-red" />
          <div>
            <p className="font-russo text-2xl md:text-4xl text-aged-cream uppercase tracking-wide leading-tight">
              {data.tagline}
            </p>
            <p className="font-pt text-xs md:text-sm text-white/40 uppercase tracking-[0.35em] mt-2">
              {data.description}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div
          className={`flex flex-wrap gap-4 mt-14 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '500ms' }}
        >
          <a
            href="#booking"
            className="px-10 py-4 bg-soviet-red font-russo text-sm uppercase tracking-widest text-white hover:bg-dark-red transition-colors duration-200"
          >
            Забронировать
          </a>
          <a
            href="#menu"
            className="px-10 py-4 border border-white/25 font-russo text-sm uppercase tracking-widest text-white/70 hover:border-soviet-red hover:text-soviet-red transition-colors duration-200"
          >
            Меню
          </a>
        </div>

        {/* Bottom info bar */}
        <div
          className={`absolute bottom-8 left-8 md:left-16 lg:left-24 right-8 flex justify-between items-end transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '700ms' }}
        >
          <p className="font-pt text-[11px] text-white/25 uppercase tracking-widest">
            ул. А.Г. Стаханова, 49А · +7 (4742) 39-03-93
          </p>
          <div className="flex flex-col items-center gap-1">
            <div className="w-px h-10 bg-gradient-to-b from-soviet-red to-transparent" />
            <span className="font-pt text-[10px] text-white/20 uppercase tracking-widest rotate-0">
              scroll
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
