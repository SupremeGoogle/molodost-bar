'use client'

import { useState } from 'react'

const TYPES = ['Бронирование стола', 'Мероприятие', 'Вопрос', 'Другое']
const GUESTS_OPTIONS = ['1–2', '3–4', '5–6', '7–10', '10+']

type Status = 'idle' | 'sending' | 'ok' | 'error'

export default function LeadForm() {
  const [form, setForm] = useState({
    name: '', phone: '', type: 'Бронирование стола',
    guests: '', date: '', message: '',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const needsDate = form.type === 'Бронирование стола' || form.type === 'Мероприятие'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'Сайт' }),
      })
      const json = await res.json()
      if (json.ok) {
        setStatus('ok')
        setForm({ name: '', phone: '', type: 'Бронирование стола', guests: '', date: '', message: '' })
      } else {
        setStatus('error')
        setErrorMsg(json.error || 'Ошибка отправки')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Нет соединения')
    }
  }

  return (
    <section id="booking" className="bg-soviet-dark2 py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(192,0,32,0.08)_0%,_transparent_65%)]" />
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-soviet-red" />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <div className="text-center mb-14">
          <p className="font-pt text-xs uppercase tracking-[0.3em] text-soviet-red mb-4">★ Связаться ★</p>
          <h2 className="section-title text-aged-cream mb-6">Забронировать стол</h2>
          <div className="red-divider" />
          <p className="font-pt text-white/50 text-sm mt-4">
            Оставьте заявку — мы перезвоним в течение 30 минут
          </p>
        </div>

        {status === 'ok' ? (
          <div className="border border-soviet-red/40 bg-soviet-dark p-12 text-center">
            <div className="text-soviet-red text-5xl mb-4">★</div>
            <h3 className="font-russo text-2xl uppercase text-aged-cream tracking-wider mb-3">
              Заявка принята!
            </h3>
            <p className="font-pt text-white/60">
              Мы получили ваш запрос и скоро перезвоним.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-8 px-8 py-3 border border-soviet-red/40 font-russo text-xs uppercase tracking-widest text-soviet-red hover:bg-soviet-red hover:text-white transition-colors"
            >
              Отправить ещё одну
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            {/* Тип заявки */}
            <div>
              <label className="block font-russo text-xs uppercase tracking-widest text-white/40 mb-3">
                Тип заявки
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set('type', t)}
                    className={`py-2.5 font-russo text-xs uppercase tracking-wider transition-all ${
                      form.type === t
                        ? 'bg-soviet-red text-white'
                        : 'border border-white/20 text-white/50 hover:border-soviet-red hover:text-soviet-red'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Имя и телефон */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Имя *"
                placeholder="Иван"
                value={form.name}
                onChange={(v) => set('name', v)}
                required
              />
              <FormInput
                label="Телефон *"
                placeholder="+7 (___) ___-__-__"
                value={form.phone}
                onChange={(v) => set('phone', v)}
                type="tel"
                required
              />
            </div>

            {/* Гости и дата (только для бронирования/мероприятия) */}
            {needsDate && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-russo text-xs uppercase tracking-widest text-white/40 mb-2">
                    Количество гостей
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {GUESTS_OPTIONS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => set('guests', g)}
                        className={`px-3 py-1.5 font-russo text-xs transition-all ${
                          form.guests === g
                            ? 'bg-soviet-red text-white'
                            : 'border border-white/20 text-white/40 hover:border-soviet-red hover:text-soviet-red'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <FormInput
                  label="Дата и время"
                  placeholder="10 июня, 19:00"
                  value={form.date}
                  onChange={(v) => set('date', v)}
                />
              </div>
            )}

            {/* Сообщение */}
            <div>
              <label className="block font-russo text-xs uppercase tracking-widest text-white/40 mb-2">
                Комментарий
              </label>
              <textarea
                rows={3}
                placeholder="Дополнительные пожелания..."
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                className="w-full bg-soviet-dark border border-white/15 px-4 py-3 font-pt text-sm text-white placeholder-white/25 focus:outline-none focus:border-soviet-red transition-colors resize-none"
              />
            </div>

            {/* Error */}
            {status === 'error' && (
              <p className="font-pt text-sm text-soviet-red">{errorMsg}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-4 bg-soviet-red font-russo text-sm uppercase tracking-widest text-white hover:bg-dark-red disabled:opacity-60 transition-colors"
            >
              {status === 'sending' ? 'Отправляю...' : 'Отправить заявку →'}
            </button>

            <p className="font-pt text-xs text-white/25 text-center">
              Или позвоните прямо сейчас:{' '}
              <a href="tel:+74742390393" className="text-soviet-red hover:underline">
                +7 (4742) 39-03-93
              </a>
            </p>
          </form>
        )}
      </div>
    </section>
  )
}

function FormInput({
  label, placeholder, value, onChange, type = 'text', required,
}: {
  label: string; placeholder: string; value: string
  onChange: (v: string) => void; type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block font-russo text-xs uppercase tracking-widest text-white/40 mb-2">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-soviet-dark border border-white/15 px-4 py-3 font-pt text-sm text-white placeholder-white/25 focus:outline-none focus:border-soviet-red transition-colors"
      />
    </div>
  )
}
