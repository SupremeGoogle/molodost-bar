import type { Metadata } from 'next'
import { Russo_One, PT_Sans } from 'next/font/google'
import './globals.css'

const russoOne = Russo_One({
  weight: '400',
  subsets: ['latin', 'cyrillic'],
  variable: '--font-russo',
  display: 'swap',
})

const ptSans = PT_Sans({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'cyrillic'],
  variable: '--font-pt',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Молодость — Кафе-бар | Липецк',
  description: 'Кафе-бар «Молодость» в Липецке. Оригинальные настойки, еда по ГоСТУ, живое пиво. Хиты твоей молодости. ул. А.Г. Стаханова, 49А.',
  keywords: 'кафе бар Липецк, Молодость, настойки, живое пиво, еда по ГОСТ, советское кафе',
  openGraph: {
    title: 'Молодость — Кафе-бар | Липецк',
    description: 'Оригинальные настойки, еда по ГоСТУ, хиты твоей молодости',
    images: ['/logo.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${russoOne.variable} ${ptSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
