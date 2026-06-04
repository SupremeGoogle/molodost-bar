interface Feature {
  icon: string
  title: string
  text: string
}

interface AboutData {
  text: string
  features: Feature[]
}

export default function About({ data }: { data: AboutData }) {
  return (
    <section id="about">

      {/* Soviet propaganda banner — full red */}
      <div className="bg-soviet-red py-10 px-6 overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px)',
          }}
        />
        <div className="max-w-screen-xl mx-auto flex flex-wrap items-center justify-center gap-4 md:gap-12 relative z-10">
          {['Оригинальные Настойки', 'Еда по ГоСТУ', 'Хиты твоей молодости'].map((s, i) => (
            <div key={i} className="flex items-center gap-4">
              {i > 0 && <span className="hidden md:block text-white/30 text-2xl">★</span>}
              <span className="font-russo text-lg md:text-2xl uppercase text-white tracking-wide text-center">
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main about block */}
      <div className="bg-soviet-dark">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-12">

          {/* Left: huge quote */}
          <div className="md:col-span-5 border-r border-white/6 p-10 md:p-16 flex flex-col justify-center">
            <p className="font-pt text-[11px] uppercase tracking-[0.35em] text-soviet-red mb-6">
              ★ О заведении
            </p>
            <blockquote
              className="font-russo text-3xl md:text-4xl text-aged-cream leading-tight uppercase"
              style={{ letterSpacing: '0.01em' }}
            >
              «Молодость<br />
              <span className="text-soviet-red">прощает</span><br />
              всё!»
            </blockquote>
            <div className="w-10 h-0.5 bg-soviet-red mt-8 mb-6" />
            <p className="font-pt text-sm text-white/45 leading-relaxed">
              {data.text}
            </p>
          </div>

          {/* Right: three features */}
          <div className="md:col-span-7">
            {data.features.map((f, i) => (
              <div
                key={i}
                className={`flex gap-8 p-10 md:p-12 border-b border-white/6 last:border-0 group hover:bg-white/2 transition-colors duration-300`}
              >
                {/* Number */}
                <div className="flex-shrink-0">
                  <span
                    className="font-russo text-6xl md:text-7xl leading-none text-white/6 group-hover:text-soviet-red/20 transition-colors duration-300"
                    style={{ letterSpacing: '-0.04em' }}
                  >
                    0{i + 1}
                  </span>
                </div>
                <div className="pt-1">
                  <h3 className="font-russo text-lg uppercase text-aged-cream tracking-wider mb-3">
                    {f.title}
                  </h3>
                  <p className="font-pt text-sm text-white/40 leading-relaxed">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
