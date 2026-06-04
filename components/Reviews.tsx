interface Review {
  author: string
  rating: number
  text: string
  date: string
}

interface ReviewsData {
  title: string
  yandex_url: string
  items: Review[]
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? 'text-soviet-gold' : 'text-white/20'}>
          ★
        </span>
      ))}
    </div>
  )
}

export default function Reviews({ data }: { data: ReviewsData }) {
  return (
    <section id="reviews" className="bg-soviet-dark2 py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(192,0,32,0.06)_0%,_transparent_70%)]" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="font-pt text-xs uppercase tracking-[0.3em] text-soviet-red mb-4">
            ★ Отзывы ★
          </p>
          <h2 className="section-title text-aged-cream mb-6">{data.title}</h2>
          <div className="red-divider" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.items.map((r, i) => (
            <div
              key={i}
              className="bg-soviet-dark border border-white/8 p-6 hover:border-soviet-red/40 transition-colors duration-300 group relative"
            >
              {/* Top red accent */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-soviet-red/0 group-hover:bg-soviet-red transition-all duration-300" />

              <Stars rating={r.rating} />
              <p className="font-pt text-white/70 text-sm leading-relaxed mt-4 mb-6">
                &laquo;{r.text}&raquo;
              </p>
              <div className="flex justify-between items-center border-t border-white/10 pt-4">
                <span className="font-russo text-sm uppercase text-aged-cream/80 tracking-wider">
                  {r.author}
                </span>
                <span className="font-pt text-xs text-white/30">{r.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Link to full reviews */}
        <div className="text-center mt-12">
          <a
            href={data.yandex_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-3.5 border border-soviet-red/40 font-russo text-sm uppercase tracking-widest text-soviet-red hover:bg-soviet-red hover:text-white transition-all duration-200"
          >
            <span>Читать все отзывы</span>
            <span className="text-base">→</span>
          </a>
          <p className="font-pt text-xs text-white/30 mt-3 uppercase tracking-widest">На Яндекс Картах</p>
        </div>
      </div>
    </section>
  )
}
