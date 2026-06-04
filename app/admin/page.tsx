'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const PASSWORD = 'molodost062026'

type SiteData = {
  hero: { tagline: string; description: string }
  about: { text: string; features: { icon: string; title: string; text: string }[] }
  gallery: { title: string; images: { src: string; alt: string }[] }
  price: { title: string; images: { src: string; alt: string }[] }
  hours: { title: string; schedule: { day: string; open: string; close: string }[] }
  reviews: { title: string; yandex_url: string; items: { author: string; rating: number; text: string; date: string }[] }
  contacts: { phone: string; address: string; telegram: string; instagram: string; yandex_maps: string }
  footer: { legal: string; legal_address: string }
}

type Tab = 'hero' | 'gallery' | 'price' | 'hours' | 'reviews' | 'contacts'

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-russo text-xs uppercase tracking-widest transition-all ${
        active ? 'bg-soviet-red text-white' : 'border border-white/20 text-white/50 hover:border-soviet-red hover:text-soviet-red'
      }`}
    >
      {label}
    </button>
  )
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pwd, setPwd] = useState('')
  const [pwdError, setPwdError] = useState(false)
  const [data, setData] = useState<SiteData | null>(null)
  const [tab, setTab] = useState<Tab>('hero')
  const [status, setStatus] = useState<{ type: 'idle' | 'saving' | 'ok' | 'error'; msg: string }>({ type: 'idle', msg: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadTarget, setUploadTarget] = useState<'gallery' | 'price'>('gallery')

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === '1') setAuthed(true)
  }, [])

  useEffect(() => {
    if (authed && !data) {
      fetch('/api/content').then((r) => r.json()).then(setData)
    }
  }, [authed, data])

  const login = () => {
    if (pwd === PASSWORD) {
      sessionStorage.setItem('admin_auth', '1')
      setAuthed(true)
      setPwdError(false)
    } else {
      setPwdError(true)
    }
  }

  const set = (path: string[], value: unknown) => {
    setData((prev) => {
      if (!prev) return prev
      const next = JSON.parse(JSON.stringify(prev)) as SiteData
      let cur: Record<string, unknown> = next as unknown as Record<string, unknown>
      for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]] as Record<string, unknown>
      cur[path[path.length - 1]] = value
      return next
    })
  }

  const save = async () => {
    if (!data) return
    setStatus({ type: 'saving', msg: 'Сохраняю и отправляю в GitHub...' })
    try {
      const res = await fetch('/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data }) })
      const json = await res.json()
      if (json.ok) setStatus({ type: 'ok', msg: json.message || 'Сохранено!' })
      else setStatus({ type: 'error', msg: json.error || 'Ошибка' })
    } catch (e) {
      setStatus({ type: 'error', msg: String(e) })
    }
    setTimeout(() => setStatus({ type: 'idle', msg: '' }), 5000)
  }

  const uploadImage = async (file: File, folder: 'gallery' | 'price') => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1]
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName, base64, folder }),
          })
          const json = await res.json()
          if (json.ok) resolve(json.src)
          else reject(json.error)
        } catch (e) { reject(e) }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !data) return
    setStatus({ type: 'saving', msg: 'Загружаю фото...' })
    try {
      const src = await uploadImage(file, uploadTarget)
      const alt = file.name.replace(/\.[^.]+$/, '')
      if (uploadTarget === 'gallery') {
        set(['gallery', 'images'], [...data.gallery.images, { src, alt }])
      } else {
        set(['price', 'images'], [...data.price.images, { src, alt }])
      }
      setStatus({ type: 'ok', msg: 'Фото загружено! Нажмите «Сохранить».' })
    } catch (err) {
      setStatus({ type: 'error', msg: String(err) })
    }
  }

  const removeImage = (section: 'gallery' | 'price', i: number) => {
    if (!data) return
    const imgs = [...data[section].images]
    imgs.splice(i, 1)
    set([section, 'images'], imgs)
  }

  const addImageByUrl = (section: 'gallery' | 'price', url: string, alt: string) => {
    if (!data || !url) return
    const imgs = [...data[section].images, { src: url, alt: alt || url }]
    set([section, 'images'], imgs)
  }

  // ---- Login screen ----
  if (!authed) {
    return (
      <div className="min-h-screen bg-soviet-dark flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Image src="/logo.jpg" alt="Молодость" width={160} height={56} className="mx-auto w-36 mb-6" style={{ mixBlendMode: 'lighten' }} />
            <h1 className="font-russo text-2xl uppercase text-aged-cream tracking-widest">Админ панель</h1>
            <div className="w-10 h-0.5 bg-soviet-red mx-auto mt-3" />
          </div>
          <div className="border border-soviet-red/30 p-8 bg-soviet-dark2">
            <label className="block font-russo text-xs uppercase tracking-widest text-white/50 mb-2">Пароль</label>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && login()}
              className={`w-full bg-soviet-dark border px-4 py-3 font-pt text-white focus:outline-none focus:border-soviet-red transition-colors ${
                pwdError ? 'border-soviet-red' : 'border-white/20'
              }`}
              placeholder="••••••••••••"
              autoFocus
            />
            {pwdError && <p className="font-pt text-xs text-soviet-red mt-2">Неверный пароль</p>}
            <button
              onClick={login}
              className="mt-6 w-full bg-soviet-red py-3 font-russo text-sm uppercase tracking-widest text-white hover:bg-dark-red transition-colors"
            >
              Войти
            </button>
          </div>
          <p className="text-center font-pt text-xs text-white/20 mt-6 uppercase tracking-widest">
            Молодость · Управление сайтом
          </p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-soviet-dark flex items-center justify-center">
        <p className="font-russo text-soviet-red animate-pulse uppercase tracking-widest">Загрузка...</p>
      </div>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'hero', label: 'Главная' },
    { id: 'gallery', label: 'Галерея' },
    { id: 'price', label: 'Прайс' },
    { id: 'hours', label: 'Часы' },
    { id: 'reviews', label: 'Отзывы' },
    { id: 'contacts', label: 'Контакты' },
  ]

  return (
    <div className="min-h-screen bg-soviet-dark text-white">
      {/* Admin header */}
      <header className="bg-black border-b border-soviet-red/30 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.jpg" alt="Молодость" width={100} height={36} className="h-8 w-auto" style={{ mixBlendMode: 'lighten' }} />
            <span className="font-russo text-xs uppercase tracking-widest text-soviet-red">Админ</span>
          </div>
          <div className="flex items-center gap-3">
            {status.type !== 'idle' && (
              <span className={`font-pt text-xs ${
                status.type === 'ok' ? 'text-green-400' :
                status.type === 'error' ? 'text-soviet-red' : 'text-white/50 animate-pulse'
              }`}>
                {status.msg}
              </span>
            )}
            <button
              onClick={save}
              disabled={status.type === 'saving'}
              className="px-6 py-2 bg-soviet-red font-russo text-xs uppercase tracking-widest text-white hover:bg-dark-red disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {status.type === 'saving' ? '⏳ Сохраняю...' : '💾 Сохранить → GitHub'}
            </button>
            <a href="/" target="_blank" className="px-4 py-2 border border-white/20 font-russo text-xs uppercase tracking-widest text-white/50 hover:border-soviet-red hover:text-soviet-red transition-colors">
              Сайт ↗
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab nav */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((t) => (
            <Pill key={t.id} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} />
          ))}
        </div>

        {/* ===== HERO ===== */}
        {tab === 'hero' && (
          <div className="space-y-6">
            <h2 className="font-russo text-xl uppercase text-aged-cream tracking-wider border-b border-soviet-red/30 pb-3">
              Главная страница
            </h2>
            <Field label="Тэглайн (после «Молодость»)" value={data.hero.tagline}
              onChange={(v) => set(['hero', 'tagline'], v)} />
            <Field label="Описание под заголовком" value={data.hero.description}
              onChange={(v) => set(['hero', 'description'], v)} />

            <h3 className="font-russo text-sm uppercase text-soviet-red tracking-wider mt-8">О нас — текст</h3>
            <TextArea label="Основной текст раздела «О нас»" value={data.about.text}
              onChange={(v) => set(['about', 'text'], v)} />

            <h3 className="font-russo text-sm uppercase text-soviet-red tracking-wider mt-6">Три преимущества</h3>
            {data.about.features.map((f, i) => (
              <div key={i} className="border border-white/10 p-4 space-y-3">
                <div className="flex items-center gap-2 font-russo text-xs uppercase text-soviet-red tracking-wider">★ Блок {i + 1}</div>
                <Field label="Иконка" value={f.icon} onChange={(v) => set(['about', 'features', i.toString(), 'icon'], v)} />
                <Field label="Заголовок" value={f.title} onChange={(v) => set(['about', 'features', i.toString(), 'title'], v)} />
                <TextArea label="Описание" value={f.text} onChange={(v) => set(['about', 'features', i.toString(), 'text'], v)} rows={2} />
              </div>
            ))}
          </div>
        )}

        {/* ===== GALLERY ===== */}
        {tab === 'gallery' && (
          <ImageManager
            label="Галерея"
            images={data.gallery.images}
            folder="gallery"
            fileInputRef={fileInputRef}
            uploadTarget={uploadTarget}
            setUploadTarget={setUploadTarget}
            onUpload={handleFileUpload}
            onRemove={(i) => removeImage('gallery', i)}
            onAddUrl={(url, alt) => addImageByUrl('gallery', url, alt)}
            onAltChange={(i, alt) => set(['gallery', 'images', i.toString(), 'alt'], alt)}
          />
        )}

        {/* ===== PRICE ===== */}
        {tab === 'price' && (
          <ImageManager
            label="Прайс-лист / Меню"
            images={data.price.images}
            folder="price"
            fileInputRef={fileInputRef}
            uploadTarget={uploadTarget}
            setUploadTarget={setUploadTarget}
            onUpload={handleFileUpload}
            onRemove={(i) => removeImage('price', i)}
            onAddUrl={(url, alt) => addImageByUrl('price', url, alt)}
            onAltChange={(i, alt) => set(['price', 'images', i.toString(), 'alt'], alt)}
          />
        )}

        {/* ===== HOURS ===== */}
        {tab === 'hours' && (
          <div className="space-y-6">
            <h2 className="font-russo text-xl uppercase text-aged-cream tracking-wider border-b border-soviet-red/30 pb-3">
              Часы работы
            </h2>
            <Field label="Заголовок раздела" value={data.hours.title}
              onChange={(v) => set(['hours', 'title'], v)} />
            <div className="space-y-4">
              {data.hours.schedule.map((s, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 border border-white/10 p-4">
                  <Field label="День" value={s.day} onChange={(v) => set(['hours', 'schedule', i.toString(), 'day'], v)} />
                  <Field label="Открытие" value={s.open} onChange={(v) => set(['hours', 'schedule', i.toString(), 'open'], v)} />
                  <Field label="Закрытие" value={s.close} onChange={(v) => set(['hours', 'schedule', i.toString(), 'close'], v)} />
                </div>
              ))}
            </div>
            <button
              onClick={() => set(['hours', 'schedule'], [...data.hours.schedule, { day: 'День', open: '12:00', close: '00:00' }])}
              className="border border-soviet-red/40 px-4 py-2 font-russo text-xs uppercase tracking-widest text-soviet-red hover:bg-soviet-red hover:text-white transition-colors"
            >
              + Добавить строку
            </button>
          </div>
        )}

        {/* ===== REVIEWS ===== */}
        {tab === 'reviews' && (
          <div className="space-y-6">
            <h2 className="font-russo text-xl uppercase text-aged-cream tracking-wider border-b border-soviet-red/30 pb-3">
              Отзывы
            </h2>
            <Field label="Заголовок раздела" value={data.reviews.title}
              onChange={(v) => set(['reviews', 'title'], v)} />
            <Field label="Ссылка Яндекс Карты" value={data.reviews.yandex_url}
              onChange={(v) => set(['reviews', 'yandex_url'], v)} />

            {data.reviews.items.map((r, i) => (
              <div key={i} className="border border-white/10 p-6 space-y-3 relative">
                <button
                  onClick={() => {
                    const items = [...data.reviews.items]
                    items.splice(i, 1)
                    set(['reviews', 'items'], items)
                  }}
                  className="absolute top-3 right-3 text-white/30 hover:text-soviet-red font-russo text-sm"
                >✕</button>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Автор" value={r.author} onChange={(v) => set(['reviews', 'items', i.toString(), 'author'], v)} />
                  <Field label="Дата" value={r.date} onChange={(v) => set(['reviews', 'items', i.toString(), 'date'], v)} />
                </div>
                <div>
                  <label className="font-russo text-xs uppercase tracking-widest text-white/40 mb-1 block">Рейтинг (1-5)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => set(['reviews', 'items', i.toString(), 'rating'], n)}
                        className={`text-2xl transition-colors ${n <= r.rating ? 'text-soviet-gold' : 'text-white/20'}`}>★</button>
                    ))}
                  </div>
                </div>
                <TextArea label="Текст отзыва" value={r.text} onChange={(v) => set(['reviews', 'items', i.toString(), 'text'], v)} rows={3} />
              </div>
            ))}
            <button
              onClick={() => set(['reviews', 'items'], [...data.reviews.items, { author: 'Гость', rating: 5, text: 'Отличное место!', date: 'Июнь 2026' }])}
              className="border border-soviet-red/40 px-4 py-2 font-russo text-xs uppercase tracking-widest text-soviet-red hover:bg-soviet-red hover:text-white transition-colors"
            >
              + Добавить отзыв
            </button>
          </div>
        )}

        {/* ===== CONTACTS ===== */}
        {tab === 'contacts' && (
          <div className="space-y-6">
            <h2 className="font-russo text-xl uppercase text-aged-cream tracking-wider border-b border-soviet-red/30 pb-3">
              Контакты
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Телефон" value={data.contacts.phone} onChange={(v) => set(['contacts', 'phone'], v)} />
              <Field label="Адрес" value={data.contacts.address} onChange={(v) => set(['contacts', 'address'], v)} />
              <Field label="Telegram (ссылка)" value={data.contacts.telegram} onChange={(v) => set(['contacts', 'telegram'], v)} />
              <Field label="Instagram (ссылка)" value={data.contacts.instagram} onChange={(v) => set(['contacts', 'instagram'], v)} />
              <Field label="Яндекс Карты (ссылка)" value={data.contacts.yandex_maps} onChange={(v) => set(['contacts', 'yandex_maps'], v)} />
            </div>
            <h3 className="font-russo text-sm uppercase text-soviet-red tracking-wider mt-6">Подвал сайта</h3>
            <Field label="Юридические реквизиты" value={data.footer.legal} onChange={(v) => set(['footer', 'legal'], v)} />
            <Field label="Юридический адрес" value={data.footer.legal_address} onChange={(v) => set(['footer', 'legal_address'], v)} />
          </div>
        )}

        {/* Save bar */}
        <div className="mt-12 border-t border-soviet-red/20 pt-6 flex justify-end">
          <button
            onClick={save}
            disabled={status.type === 'saving'}
            className="px-8 py-4 bg-soviet-red font-russo text-sm uppercase tracking-widest text-white hover:bg-dark-red disabled:opacity-50 transition-colors"
          >
            {status.type === 'saving' ? '⏳ Отправляю в GitHub...' : '💾 Сохранить всё и пуш в GitHub'}
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
    </div>
  )
}

// ---- Helper components ----

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="font-russo text-xs uppercase tracking-widest text-white/40 mb-1.5 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-soviet-dark2 border border-white/15 px-3 py-2.5 font-pt text-sm text-white focus:outline-none focus:border-soviet-red transition-colors"
      />
    </div>
  )
}

function TextArea({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="font-russo text-xs uppercase tracking-widest text-white/40 mb-1.5 block">{label}</label>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-soviet-dark2 border border-white/15 px-3 py-2.5 font-pt text-sm text-white focus:outline-none focus:border-soviet-red transition-colors resize-y"
      />
    </div>
  )
}

function ImageManager({
  label, images, folder, fileInputRef, uploadTarget, setUploadTarget,
  onUpload, onRemove, onAddUrl, onAltChange,
}: {
  label: string
  images: { src: string; alt: string }[]
  folder: 'gallery' | 'price'
  fileInputRef: React.RefObject<HTMLInputElement | null>
  uploadTarget: 'gallery' | 'price'
  setUploadTarget: (t: 'gallery' | 'price') => void
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: (i: number) => void
  onAddUrl: (url: string, alt: string) => void
  onAltChange: (i: number, alt: string) => void
}) {
  const [urlInput, setUrlInput] = useState('')
  const [altInput, setAltInput] = useState('')

  return (
    <div className="space-y-6">
      <h2 className="font-russo text-xl uppercase text-aged-cream tracking-wider border-b border-soviet-red/30 pb-3">
        {label}
      </h2>

      {/* Add options */}
      <div className="border border-white/10 p-6 space-y-4">
        <h3 className="font-russo text-xs uppercase tracking-widest text-soviet-red">Добавить фото</h3>

        {/* Upload from device */}
        <button
          onClick={() => {
            setUploadTarget(folder)
            fileInputRef.current?.click()
          }}
          className="flex items-center gap-3 px-6 py-3 border border-soviet-red/50 font-russo text-xs uppercase tracking-widest text-soviet-red hover:bg-soviet-red hover:text-white transition-colors"
        >
          📁 Загрузить с устройства
        </button>

        {/* Add by URL */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://... URL фотографии"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 bg-soviet-dark border border-white/15 px-3 py-2 font-pt text-sm text-white focus:outline-none focus:border-soviet-red transition-colors"
          />
          <input
            type="text"
            placeholder="Описание"
            value={altInput}
            onChange={(e) => setAltInput(e.target.value)}
            className="w-40 bg-soviet-dark border border-white/15 px-3 py-2 font-pt text-sm text-white focus:outline-none focus:border-soviet-red transition-colors"
          />
          <button
            onClick={() => { onAddUrl(urlInput, altInput); setUrlInput(''); setAltInput('') }}
            className="px-4 py-2 bg-soviet-red font-russo text-xs uppercase text-white hover:bg-dark-red transition-colors"
          >
            + Добавить
          </button>
        </div>
      </div>

      {/* Current images grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, i) => (
          <div key={i} className="relative group border border-white/10 overflow-hidden">
            <div className="relative aspect-[3/4]">
              <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="200px" />
            </div>
            {/* Actions overlay */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
              <button
                onClick={() => onRemove(i)}
                className="w-full py-1.5 bg-soviet-red font-russo text-xs uppercase text-white hover:bg-dark-red transition-colors"
              >
                ✕ Удалить
              </button>
            </div>
            {/* Alt text */}
            <input
              type="text"
              value={img.alt}
              onChange={(e) => onAltChange(i, e.target.value)}
              className="w-full bg-soviet-dark border-t border-white/10 px-2 py-1.5 font-pt text-xs text-white/50 focus:outline-none focus:text-white focus:bg-soviet-dark2"
              placeholder="Описание"
            />
          </div>
        ))}
        {images.length === 0 && (
          <div className="col-span-4 py-16 text-center border border-dashed border-white/15">
            <p className="font-pt text-sm text-white/30">Нет фотографий. Добавьте выше.</p>
          </div>
        )}
      </div>
    </div>
  )
}
