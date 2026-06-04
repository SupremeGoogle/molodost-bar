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
    <section id="about" className="bg-soviet-dark2 py-24 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-soviet-red" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-pt text-xs uppercase tracking-[0.3em] text-soviet-red mb-4">
            ★ Кафе-бар · Липецк ★
          </p>
          <h2 className="section-title text-aged-cream mb-6">О нас</h2>
          <div className="red-divider" />
          <p className="font-pt text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            {data.text}
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-soviet-red/20">
          {data.features.map((f, i) => (
            <div
              key={i}
              className="bg-soviet-dark2 p-8 text-center group hover:bg-soviet-dark transition-colors duration-300"
            >
              <div className="text-soviet-red text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <h3 className="font-russo text-lg uppercase text-aged-cream mb-3 tracking-wider">
                {f.title}
              </h3>
              <p className="font-pt text-sm text-white/50 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>

        {/* Soviet-style quote */}
        <div className="mt-16 text-center border-t border-b border-soviet-red/20 py-8">
          <p className="font-russo text-2xl md:text-3xl text-soviet-red uppercase tracking-wider">
            «Молодость прощает всё!»
          </p>
        </div>
      </div>
    </section>
  )
}
