import Image from 'next/image'

interface ScheduleItem {
  day: string
  open: string
  close: string
}

interface HoursData {
  title: string
  schedule: ScheduleItem[]
}

function isOpenNow(schedule: ScheduleItem[]): boolean {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours()
  const min = now.getMinutes()
  const current = hour * 60 + min

  const dayMap: Record<number, string> = {
    1: 'Пн – Чт', 2: 'Пн – Чт', 3: 'Пн – Чт', 4: 'Пн – Чт',
    5: 'Пятница', 6: 'Суббота', 0: 'Воскресенье',
  }
  const todayKey = dayMap[day]
  const todaySchedule = schedule.find((s) => s.day === todayKey)
  if (!todaySchedule) return false

  const [oh, om] = todaySchedule.open.split(':').map(Number)
  const [ch, cm] = todaySchedule.close.split(':').map(Number)
  const openMin = oh * 60 + om
  const closeMin = ch === 0 && cm === 0 ? 24 * 60 : ch * 60 + cm

  return current >= openMin && current < closeMin
}

export default function WorkingHours({ data }: { data: HoursData }) {
  const open = isOpenNow(data.schedule)

  return (
    <section id="hours" className="aged-paper py-24 relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="font-pt text-xs uppercase tracking-[0.3em] text-soviet-red mb-4">
            ★ Режим работы ★
          </p>
          <h2 className="section-title text-soviet-dark mb-6">{data.title}</h2>
          <div className="red-divider" />
        </div>

        {/* Status badge */}
        <div className="flex justify-center mb-12">
          <div
            className={`flex items-center gap-3 px-6 py-3 font-russo text-sm uppercase tracking-widest ${
              open
                ? 'bg-green-900/20 border border-green-500/50 text-green-400'
                : 'bg-red-900/20 border border-soviet-red/50 text-soviet-red'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${open ? 'bg-green-400 blink' : 'bg-soviet-red'}`} />
            {open ? 'Открыто сейчас' : 'Закрыто'}
          </div>
        </div>

        {/* Schedule board — Soviet poster style */}
        <div className="bg-soviet-dark border border-soviet-red/30 p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8 border-b border-soviet-red/30 pb-6">
            <Image
              src="/logo.jpg"
              alt="Молодость"
              width={200}
              height={70}
              className="mx-auto w-40 md:w-48 object-contain mb-4"
              style={{ mixBlendMode: 'lighten' }}
            />
            <p className="font-pt text-xs text-white/40 uppercase tracking-widest">Буфет · Кафе-бар</p>
          </div>

          <h3 className="font-russo text-2xl md:text-4xl uppercase text-aged-cream text-center mb-8 tracking-wider">
            Часы работы
          </h3>

          <div className="space-y-4 max-w-sm mx-auto">
            {data.schedule.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0"
              >
                <span className="font-russo text-sm md:text-base uppercase text-aged-cream tracking-wider">
                  {item.day}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-pt text-white/60 text-sm">{item.open}</span>
                  <span className="text-soviet-red">—</span>
                  <span className="font-pt text-white/60 text-sm">{item.close}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address note */}
        <p className="text-center font-pt text-sm text-soviet-dark/60 mt-8 uppercase tracking-wider">
          ул. А.Г. Стаханова, 49А (этаж 1) · г. Липецк
        </p>
      </div>
    </section>
  )
}
