'use client'

import Image from 'next/image'

interface HeroData {
  tagline: string
  description: string
}

export default function Hero({ data }: { data: HeroData }) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center bg-soviet-dark overflow-hidden"
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(192,0,32,0.12)_0%,_transparent_70%)]" />

      {/* Top red stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-soviet-red" />

      {/* Diagonal dark overlay lines — Soviet constructivism feel */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 30px)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4 py-32 max-w-4xl mx-auto">
        {/* Logo */}
        <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <Image
            src="/logo.jpg"
            alt="Молодость Кафе-бар"
            width={280}
            height={100}
            className="w-64 md:w-80 object-contain"
            priority
          />
        </div>

        {/* Red star divider */}
        <div
          className="flex items-center gap-3 mb-6 animate-fade-up"
          style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
        >
          <div className="w-16 h-px bg-soviet-red" />
          <span className="text-soviet-red text-2xl">★</span>
          <div className="w-16 h-px bg-soviet-red" />
        </div>

        {/* Main tagline */}
        <h1
          className="font-russo text-6xl md:text-8xl lg:text-9xl uppercase text-aged-cream leading-none tracking-tight animate-fade-up"
          style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
        >
          Молодость{' '}
          <span className="text-soviet-red neon-red">{data.tagline}</span>
        </h1>

        {/* Description */}
        <p
          className="mt-8 font-pt text-base md:text-xl text-white/60 tracking-widest uppercase animate-fade-up"
          style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
        >
          {data.description}
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 mt-12 animate-fade-up"
          style={{ animationDelay: '0.8s', animationFillMode: 'both' }}
        >
          <a
            href="#menu"
            className="px-8 py-3.5 bg-soviet-red font-russo text-sm uppercase tracking-widest text-white hover:bg-dark-red transition-colors duration-200"
          >
            Наше меню
          </a>
          <a
            href="#contacts"
            className="px-8 py-3.5 border border-white/30 font-russo text-sm uppercase tracking-widest text-white/80 hover:border-soviet-red hover:text-soviet-red transition-colors duration-200"
          >
            Найти нас
          </a>
        </div>
      </div>

      {/* Bottom scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="font-pt text-xs uppercase tracking-widest text-white/30">Листай</span>
        <div className="w-px h-8 bg-gradient-to-b from-soviet-red to-transparent" />
      </div>

      {/* Bottom red stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-soviet-red/40" />
    </section>
  )
}
