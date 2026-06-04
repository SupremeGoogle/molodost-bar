'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

type SiteData = {
  hero: { tagline: string; description: string }
  about: { text: string; features: { icon: string; title: string; text: string }[] }
  gallery: { title: string; images: { src: string; alt: string }[] }
  price: { title: string; images: { src: string; alt: string }[] }
  hours: { title: string; schedule: { day: string; open: string; close: string }[] }
  reviews: { title: string; yandex_url: string; items: { author: string; rating: number; text: string; date: string }[] }
  contacts: { phone: string; address: string; telegram: string; instagram: string; yandex_maps: string }
  footer: { legal: string; legal_address: string }
  admin: { google_sheets_url: string }
}

type Tab = 'leads' | 'hero' | 'gallery' | 'price' | 'hours' | 'reviews' | 'contacts' | 'system'

interface Lead {
  id: string; createdAt: string; status: 'new' | 'called' | 'done'
  name: string; phone: string; type: string
  guests?: string; date?: string; message?: string; source?: string
}

type EnvStatus = { ok: boolean; hint: string }
type DebugResult = { allOk: boolean; vars: Record<string, EnvStatus> } | null

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
  const [pwdError, setPwdError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [data, setData] = useState<SiteData | null>(null)
  const [tab, setTab] = useState<Tab>('hero')
  const [status, setStatus] = useState<{ type: 'idle' | 'saving' | 'ok' | 'error'; msg: string }>({ type: 'idle', msg: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadTarget, setUploadTarget] = useState<'gallery' | 'price'>('gallery')
  const [debugData, setDebugData] = useState<DebugResult>(null)
  const [debugLoading, setDebugLoading] = useState(false)
  const [testResult, setTestResult] = useState<Record<string, string>>({})
  const [leads, setLeads] = useState<Lead[]>([])
  const [leadsLoading, setLeadsLoading] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === '1') setAuthed(true)
  }, [])

  useEffect(() => {
    if (authed && !data) {
      fetch('/api/content').then((r) => r.json()).then(setData)
    }
  }, [authed, data])

  useEffect(() => {
    if (authed && tab === 'leads') loadLeads()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, tab])

  const login = async () => {
    setLoginLoading(true)
    setPwdError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      })
      const json = await res.json()
      if (json.ok) {
        sessionStorage.setItem('admin_auth', '1')
        setAuthed(true)
      } else {
        setPwdError(json.error || 'Неверный пароль')
      }
    } catch {
      setPwdError('Ошибка соединения')
    } finally {
      setLoginLoading(false)
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

  const runDebug = async () => {
    setDebugLoading(true)
    const res = await fetch('/api/debug')
    const json = await res.json()
    setDebugData(json)
    setDebugLoading(false)
  }

  const sendTest = async (type: 'telegram' | 'sheets') => {
    setTestResult((p) => ({ ...p, [type]: 'sending' }))
    const res = await fetch('/api/debug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    const json = await res.json()
    setTestResult((p) => ({
      ...p,
      [type]: json.ok
        ? `✅ Успешно! ${JSON.stringify(json.result ?? '')}`
        : `❌ Ошибка: ${json.error}`,
    }))
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
            {pwdError && <p className="font-pt text-xs text-soviet-red mt-2">{pwdError}</p>}
            <button
              onClick={login}
              disabled={loginLoading}
              className="mt-6 w-full bg-soviet-red py-3 font-russo text-sm uppercase tracking-widest text-white hover:bg-dark-red disabled:opacity-60 transition-colors"
            >
              {loginLoading ? 'Проверяю...' : 'Войти'}
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

  const loadLeads = async () => {
    setLeadsLoading(true)
    const res = await fetch('/api/lead')
    setLeads(await res.json())
    setLeadsLoading(false)
  }

  const updateLeadStatus = async (id: string, status: Lead['status']) => {
    await fetch('/api/lead', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l))
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'leads', label: '📥 Заявки' },
    { id: 'hero', label: 'Главная' },
    { id: 'gallery', label: 'Галерея' },
    { id: 'price', label: 'Прайс' },
    { id: 'hours', label: 'Часы' },
    { id: 'reviews', label: 'Отзывы' },
    { id: 'contacts', label: 'Контакты' },
    { id: 'system', label: '⚙ Система' },
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

        {/* ===== LEADS ===== */}
        {tab === 'leads' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-soviet-red/30 pb-3">
              <h2 className="font-russo text-xl uppercase text-aged-cream tracking-wider">📥 Заявки с сайта</h2>
              <div className="flex gap-2 flex-wrap">
                <button onClick={loadLeads} disabled={leadsLoading}
                  className="px-4 py-2 border border-white/20 font-russo text-xs uppercase tracking-widest text-white/50 hover:border-soviet-red hover:text-soviet-red transition-colors disabled:opacity-40">
                  {leadsLoading ? 'Загружаю...' : '🔄 Обновить'}
                </button>
                <button
                  onClick={() => {
                    const csvUrl = `${window.location.origin}/api/leads.csv?token=${encodeURIComponent(prompt('Введите пароль админки:') || '')}`
                    const sheetsUrl = `https://docs.google.com/spreadsheets/create`
                    navigator.clipboard.writeText(`=IMPORTDATA("${csvUrl}")`)
                    window.open(sheetsUrl, '_blank')
                    alert('Формула скопирована!\n\nВ Google Таблице:\n1. Вставь формулу в ячейку A1 (Ctrl+V)\n2. Таблица будет автообновляться')
                  }}
                  className="px-4 py-2 border border-green-500/40 font-russo text-xs uppercase tracking-widest text-green-400 hover:bg-green-500/10 transition-colors"
                >
                  📊 Открыть в Google Таблице
                </button>
              </div>
            </div>

            {leads.length === 0 && !leadsLoading && (
              <div className="text-center py-20 border border-dashed border-white/10">
                <p className="font-russo text-2xl text-white/10 uppercase mb-3">Нет заявок</p>
                <p className="font-pt text-sm text-white/25">Нажмите «Обновить» или оставьте тестовую заявку на сайте</p>
              </div>
            )}

            {leads.map((lead) => {
              const statusColors: Record<Lead['status'], string> = {
                new: 'border-soviet-red text-soviet-red',
                called: 'border-yellow-500 text-yellow-400',
                done: 'border-green-500 text-green-400',
              }
              const statusLabels: Record<Lead['status'], string> = { new: 'Новая', called: 'Позвонили', done: 'Готово' }
              const date = new Date(lead.createdAt)
              const dateStr = `${date.getDate().toString().padStart(2,'0')}.${(date.getMonth()+1).toString().padStart(2,'0')} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`

              return (
                <div key={lead.id} className={`border p-5 relative transition-colors duration-200 ${
                  lead.status === 'new' ? 'border-soviet-red/40 bg-soviet-red/3' :
                  lead.status === 'called' ? 'border-yellow-500/30' : 'border-white/8 opacity-60'
                }`}>
                  <div className="flex flex-wrap items-start gap-4 justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-russo text-lg text-aged-cream">{lead.name}</span>
                        <span className={`text-xs font-russo uppercase px-2 py-0.5 border ${statusColors[lead.status]}`}>
                          {statusLabels[lead.status]}
                        </span>
                      </div>
                      <a href={`tel:${lead.phone.replace(/\D/g,'')}`}
                        className="font-russo text-xl text-soviet-red hover:underline block mb-3">
                        {lead.phone}
                      </a>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 font-pt text-sm text-white/40">
                        <span>📋 {lead.type}</span>
                        {lead.guests && <span>👥 {lead.guests} гостей</span>}
                        {lead.date && <span>📅 {lead.date}</span>}
                        {lead.message && <span className="block w-full text-white/30 italic">«{lead.message}»</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-pt text-xs text-white/25">{dateStr}</span>
                      <div className="flex gap-2">
                        {(['new', 'called', 'done'] as Lead['status'][]).map((s) => (
                          <button key={s} onClick={() => updateLeadStatus(lead.id, s)}
                            disabled={lead.status === s}
                            className={`px-2.5 py-1 font-russo text-[10px] uppercase tracking-wider border transition-colors disabled:opacity-30 ${statusColors[s]}`}>
                            {statusLabels[s]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

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

        {/* ===== SYSTEM ===== */}
        {tab === 'system' && (
          <div className="space-y-8">
            <h2 className="font-russo text-xl uppercase text-aged-cream tracking-wider border-b border-soviet-red/30 pb-3">
              ⚙ Система и интеграции
            </h2>

            {/* Google Sheets link */}
            <div className="border border-white/10 p-6 space-y-4">
              <h3 className="font-russo text-sm uppercase text-soviet-red tracking-wider">Google Таблица с заявками</h3>
              <Field
                label="Ссылка на Google Таблицу (для быстрого открытия)"
                value={data.admin?.google_sheets_url ?? ''}
                onChange={(v) => set(['admin', 'google_sheets_url'], v)}
              />
              {data.admin?.google_sheets_url ? (
                <a
                  href={data.admin.google_sheets_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 font-russo text-xs uppercase tracking-widest text-white hover:bg-green-600 transition-colors"
                >
                  📊 Открыть таблицу заявок ↗
                </a>
              ) : (
                <p className="font-pt text-xs text-white/30">
                  Вставьте ссылку выше → сохраните → появится кнопка открытия
                </p>
              )}
            </div>

            {/* Env check */}
            <div className="border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-russo text-sm uppercase text-soviet-red tracking-wider">Проверка переменных окружения</h3>
                <button
                  onClick={runDebug}
                  disabled={debugLoading}
                  className="px-4 py-2 border border-white/20 font-russo text-xs uppercase tracking-widest text-white/50 hover:border-soviet-red hover:text-soviet-red transition-colors disabled:opacity-40"
                >
                  {debugLoading ? 'Проверяю...' : '🔍 Проверить'}
                </button>
              </div>
              {debugData && (
                <div className="space-y-2">
                  {Object.entries(debugData.vars).map(([key, val]) => (
                    <div key={key} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                      <span className={`text-lg leading-none mt-0.5 ${val.ok ? 'text-green-400' : 'text-soviet-red'}`}>
                        {val.ok ? '✓' : '✗'}
                      </span>
                      <div>
                        <p className="font-russo text-xs uppercase tracking-wider text-white/70">{key}</p>
                        {!val.ok && <p className="font-pt text-xs text-soviet-red/70 mt-0.5">{val.hint}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Test buttons */}
            <div className="border border-white/10 p-6 space-y-4">
              <h3 className="font-russo text-sm uppercase text-soviet-red tracking-wider">Тест интеграций</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Telegram test */}
                <div className="space-y-2">
                  <button
                    onClick={() => sendTest('telegram')}
                    disabled={testResult.telegram === 'sending'}
                    className="w-full py-3 border border-blue-500/40 font-russo text-xs uppercase tracking-widest text-blue-400 hover:bg-blue-500/10 transition-colors disabled:opacity-40"
                  >
                    {testResult.telegram === 'sending' ? '⏳ Отправляю...' : '📱 Тест Telegram рассылки'}
                  </button>
                  {testResult.telegram && testResult.telegram !== 'sending' && (
                    <p className={`font-pt text-xs break-all ${testResult.telegram.startsWith('✅') ? 'text-green-400' : 'text-soviet-red'}`}>
                      {testResult.telegram}
                    </p>
                  )}
                  <p className="font-pt text-[11px] text-white/25 leading-relaxed">
                    Отправит тест всем кто написал /molodost боту. Если 0 подписчиков — напиши боту сам.
                  </p>
                </div>

                {/* Google Sheets test */}
                <div className="space-y-2">
                  <button
                    onClick={() => sendTest('sheets')}
                    disabled={testResult.sheets === 'sending'}
                    className="w-full py-3 border border-green-500/40 font-russo text-xs uppercase tracking-widest text-green-400 hover:bg-green-500/10 transition-colors disabled:opacity-40"
                  >
                    {testResult.sheets === 'sending' ? '⏳ Отправляю...' : '📊 Тест Google Таблицы'}
                  </button>
                  {testResult.sheets && testResult.sheets !== 'sending' && (
                    <p className={`font-pt text-xs break-all ${testResult.sheets.startsWith('✅') ? 'text-green-400' : 'text-soviet-red'}`}>
                      {testResult.sheets}
                    </p>
                  )}
                  <p className="font-pt text-[11px] text-white/25 leading-relaxed">
                    Добавит тестовую строку в Google Таблицу.
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="border border-yellow-500/20 bg-yellow-500/5 p-6">
              <h3 className="font-russo text-sm uppercase text-yellow-400 tracking-wider mb-4">📋 Чеклист настройки</h3>
              <ol className="space-y-3 font-pt text-sm text-white/50 list-decimal list-inside">
                <li>Задеплоить Google Apps Script → получить URL → вставить в Vercel как <code className="text-yellow-400">GOOGLE_SCRIPT_URL</code></li>
                <li>Вставить ссылку на Google Таблицу выше → Сохранить</li>
                <li>Убедиться что <code className="text-yellow-400">CLOUDFLARE_BROADCAST_SECRET</code> на Vercel совпадает с тем что в <code>wrangler secret put BROADCAST_SECRET</code></li>
                <li>Написать боту <code className="text-yellow-400">/molodost</code> — подписаться на уведомления</li>
                <li>Нажать «Тест Telegram рассылки» → получить сообщение</li>
                <li>Нажать «Тест Google Таблицы» → увидеть строку в таблице</li>
              </ol>
            </div>
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
