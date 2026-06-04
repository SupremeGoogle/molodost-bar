interface ContactsData {
  phone: string
  address: string
  telegram: string
  instagram: string
  yandex_maps: string
}

export default function Contacts({ data }: { data: ContactsData }) {
  return (
    <section id="contacts" className="bg-soviet-dark py-24 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-soviet-red" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-pt text-xs uppercase tracking-[0.3em] text-soviet-red mb-4">
            ★ Найти нас ★
          </p>
          <h2 className="section-title text-aged-cream mb-6">Контакты</h2>
          <div className="red-divider" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact info */}
          <div className="space-y-8">
            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-soviet-red flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-soviet-red">☎</span>
              </div>
              <div>
                <p className="font-russo text-xs uppercase tracking-widest text-white/40 mb-1">Телефон</p>
                <a
                  href={`tel:${data.phone.replace(/\D/g, '')}`}
                  className="font-russo text-2xl text-aged-cream hover:text-soviet-red transition-colors"
                >
                  {data.phone}
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-soviet-red flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-soviet-red">📍</span>
              </div>
              <div>
                <p className="font-russo text-xs uppercase tracking-widest text-white/40 mb-1">Адрес</p>
                <p className="font-pt text-lg text-white/80 leading-relaxed">{data.address}</p>
                <a
                  href={data.yandex_maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 font-pt text-sm text-soviet-red hover:underline"
                >
                  Открыть на Яндекс Картах →
                </a>
              </div>
            </div>

            {/* Socials */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-soviet-red flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-soviet-red">✦</span>
              </div>
              <div>
                <p className="font-russo text-xs uppercase tracking-widest text-white/40 mb-3">Соцсети</p>
                <div className="flex flex-col gap-3">
                  <a
                    href={data.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 font-pt text-white/70 hover:text-soviet-red transition-colors group"
                  >
                    <span className="w-8 h-8 bg-[#0088cc] flex items-center justify-center text-white text-sm font-russo">TG</span>
                    <span>Telegram</span>
                    <span className="text-soviet-red opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </a>
                  <a
                    href={data.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 font-pt text-white/70 hover:text-soviet-red transition-colors group"
                  >
                    <span className="w-8 h-8 bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center text-white text-xs font-russo">IN</span>
                    <span>Instagram</span>
                    <span className="text-soviet-red opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </a>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <a
                href={data.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-soviet-red font-russo text-sm uppercase tracking-widest text-white hover:bg-dark-red transition-colors duration-200"
              >
                <span>Написать в Telegram</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Map */}
          <div className="relative">
            <div className="border border-soviet-red/30 overflow-hidden">
              <iframe
                src="https://yandex.ru/map-widget/v1/?oid=141859830238&ol=biz"
                width="100%"
                height="400"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                title="Молодость на карте"
              />
            </div>
            <div className="flex items-center justify-between mt-3 px-1">
              <p className="font-pt text-xs text-white/30 uppercase tracking-wider">
                Яндекс Карты
              </p>
              <a
                href={data.yandex_maps}
                target="_blank"
                rel="noopener noreferrer"
                className="font-pt text-xs text-soviet-red hover:underline"
              >
                Открыть полную карту →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
