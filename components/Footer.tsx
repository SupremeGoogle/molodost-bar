interface FooterData { legal: string; legal_address: string }
interface ContactsData { phone: string; telegram: string; instagram: string; yandex_maps: string }

export default function Footer({ footer, contacts }: { footer: FooterData; contacts: ContactsData }) {
  return (
    <footer className="bg-black border-t border-white/6">
      {/* Carpet stripe */}
      <div
        className="h-2"
        style={{
          background: 'repeating-linear-gradient(90deg, #C00020 0px, #C00020 20px, #8B0000 20px, #8B0000 40px, #C00020 40px, #C00020 60px, #0D0D0D 60px, #0D0D0D 80px)',
        }}
      />

      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-soviet-red font-russo text-lg">★</span>
              <span className="font-russo text-xl uppercase tracking-wide text-white">Молодость</span>
            </div>
            <p className="font-pt text-sm text-white/30 leading-relaxed">
              Кафе-бар в Липецке. Настойки, еда по ГоСТУ, живое пиво.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="font-russo text-xs uppercase tracking-widest text-soviet-red mb-5">Навигация</h4>
            <ul className="space-y-2">
              {[
                { href: '#about', label: 'О нас' },
                { href: '#gallery', label: 'Галерея' },
                { href: '#menu', label: 'Меню' },
                { href: '#hours', label: 'Часы работы' },
                { href: '#contacts', label: 'Контакты' },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="font-pt text-sm text-white/35 hover:text-soviet-red transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-russo text-xs uppercase tracking-widest text-soviet-red mb-5">Контакты</h4>
            <div className="space-y-3">
              <a href={`tel:${contacts.phone.replace(/\D/g,'')}`} className="block font-pt text-sm text-white/35 hover:text-soviet-red transition-colors">
                {contacts.phone}
              </a>
              <p className="font-pt text-sm text-white/25">ул. А.Г. Стаханова, 49А, г. Липецк</p>
              <div className="flex gap-3 pt-2">
                {[
                  { href: contacts.telegram, label: 'TG' },
                  { href: contacts.instagram, label: 'IN' },
                  { href: contacts.yandex_maps, label: 'Я' },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 border border-white/12 flex items-center justify-center font-russo text-xs text-white/30 hover:border-soviet-red hover:text-soviet-red transition-colors">
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/6 pt-6 flex flex-col md:flex-row justify-between gap-2">
          <p className="font-pt text-[11px] text-white/20">{footer.legal}</p>
          <p className="font-pt text-[11px] text-white/15">{footer.legal_address}</p>
        </div>
      </div>
    </footer>
  )
}
