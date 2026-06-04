import Image from 'next/image'

interface FooterData {
  legal: string
  legal_address: string
}

interface ContactsData {
  phone: string
  telegram: string
  instagram: string
  yandex_maps: string
}

export default function Footer({ footer, contacts }: { footer: FooterData; contacts: ContactsData }) {
  return (
    <footer className="bg-black border-t border-soviet-red/20 pt-12 pb-6">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <Image src="/logo.jpg" alt="Молодость" width={160} height={56} className="w-36 object-contain invert mb-4" />
            <p className="font-pt text-sm text-white/40 leading-relaxed">
              Кафе-бар «Молодость» — место, где время останавливается.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-russo text-xs uppercase tracking-widest text-soviet-red mb-4">Навигация</h4>
            <ul className="space-y-2">
              {[
                { href: '#about', label: 'О нас' },
                { href: '#gallery', label: 'Галерея' },
                { href: '#menu', label: 'Меню & Цены' },
                { href: '#hours', label: 'Часы работы' },
                { href: '#contacts', label: 'Контакты' },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="font-pt text-sm text-white/50 hover:text-soviet-red transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-russo text-xs uppercase tracking-widest text-soviet-red mb-4">Контакты</h4>
            <div className="space-y-2">
              <p className="font-pt text-sm text-white/50">
                <a href={`tel:${contacts.phone.replace(/\D/g, '')}`} className="hover:text-soviet-red transition-colors">
                  {contacts.phone}
                </a>
              </p>
              <p className="font-pt text-sm text-white/40 leading-relaxed">
                ул. А.Г. Стаханова, 49А<br />г. Липецк
              </p>
              <div className="flex gap-3 mt-4">
                <a href={contacts.telegram} target="_blank" rel="noopener noreferrer"
                  className="font-russo text-xs px-3 py-1.5 border border-white/20 text-white/50 hover:border-soviet-red hover:text-soviet-red transition-colors">
                  TG
                </a>
                <a href={contacts.instagram} target="_blank" rel="noopener noreferrer"
                  className="font-russo text-xs px-3 py-1.5 border border-white/20 text-white/50 hover:border-soviet-red hover:text-soviet-red transition-colors">
                  IN
                </a>
                <a href={contacts.yandex_maps} target="_blank" rel="noopener noreferrer"
                  className="font-russo text-xs px-3 py-1.5 border border-white/20 text-white/50 hover:border-soviet-red hover:text-soviet-red transition-colors">
                  Я
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom legal */}
        <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="font-pt text-xs text-white/25 text-center md:text-left">{footer.legal}</p>
          <p className="font-pt text-xs text-white/20 text-center md:text-right">{footer.legal_address}</p>
        </div>

        <div className="text-center mt-6">
          <p className="font-russo text-xs text-soviet-red/30 uppercase tracking-widest">
            ★ Молодость прощает всё ★
          </p>
        </div>
      </div>
    </footer>
  )
}
