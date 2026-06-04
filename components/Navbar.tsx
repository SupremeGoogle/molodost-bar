'use client'

import { useState, useEffect } from 'react'

const links = [
  { href: '#about', label: 'О нас' },
  { href: '#gallery', label: 'Галерея' },
  { href: '#menu', label: 'Меню' },
  { href: '#hours', label: 'Часы' },
  { href: '#booking', label: 'Бронь', highlight: true },
  { href: '#contacts', label: 'Контакты' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/95 backdrop-blur-sm border-b border-white/6' : 'bg-transparent'
    }`}>
      {/* Red top line — always visible */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-soviet-red" />

      <div className="max-w-screen-xl mx-auto px-6 md:px-10 h-14 flex items-center justify-between">

        {/* Wordmark — no image */}
        <a href="#hero" className="flex items-center gap-2 group">
          <span className="text-soviet-red font-russo text-base">★</span>
          <span className="font-russo text-base uppercase tracking-[0.15em] text-white group-hover:text-soviet-red transition-colors duration-200">
            Молодость
          </span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <li key={l.href}>
              {l.highlight ? (
                <a
                  href={l.href}
                  className="px-5 py-1.5 border border-soviet-red font-russo text-xs uppercase tracking-widest text-soviet-red hover:bg-soviet-red hover:text-white transition-all duration-200"
                >
                  {l.label}
                </a>
              ) : (
                <a
                  href={l.href}
                  className="font-pt text-xs uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors duration-200"
                >
                  {l.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 flex flex-col gap-1.5" onClick={() => setOpen(!open)}>
          <span className={`block w-5 h-px bg-white transition-all ${open ? 'rotate-45 translate-y-[5px]' : ''}`} />
          <span className={`block w-5 h-px bg-white transition-all ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px bg-white transition-all ${open ? '-rotate-45 -translate-y-[5px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-black border-t border-white/8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block px-8 py-3.5 font-russo text-xs uppercase tracking-widest border-b border-white/5 transition-colors ${
                l.highlight
                  ? 'text-soviet-red hover:bg-soviet-red hover:text-white'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
