interface ScheduleItem { day: string; open: string; close: string }
interface HoursData { title: string; schedule: ScheduleItem[] }

function isOpenNow(schedule: ScheduleItem[]): boolean {
  const now = new Date()
  const day = now.getDay()
  const current = now.getHours() * 60 + now.getMinutes()
  const map: Record<number, string> = { 1:'Пн – Чт',2:'Пн – Чт',3:'Пн – Чт',4:'Пн – Чт',5:'Пятница',6:'Суббота',0:'Воскресенье' }
  const s = schedule.find((x) => x.day === map[day])
  if (!s) return false
  const [oh, om] = s.open.split(':').map(Number)
  const [ch, cm] = s.close.split(':').map(Number)
  return current >= oh*60+om && current < (ch===0&&cm===0?24*60:ch*60+cm)
}

export default function WorkingHours({ data }: { data: HoursData }) {
  const open = isOpenNow(data.schedule)

  return (
    <section id="hours" className="bg-soviet-dark relative overflow-hidden">
      {/* Carpet-pattern decorative strip */}
      <div
        className="absolute top-0 left-0 right-0 h-3"
        style={{
          background: 'repeating-linear-gradient(90deg, #C00020 0px, #C00020 20px, #8B0000 20px, #8B0000 40px, #C00020 40px, #C00020 60px, #0D0D0D 60px, #0D0D0D 80px)',
        }}
      />

      <div className="max-w-screen-xl mx-auto px-6 md:px-10 pt-16 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-white/8">

          {/* Left: Status + title */}
          <div className="bg-soviet-red p-10 md:p-14 flex flex-col justify-between">
            <div>
              <p className="font-pt text-xs uppercase tracking-[0.35em] text-white/60 mb-6">Режим работы</p>
              <h2
                className="font-russo text-5xl md:text-7xl uppercase text-white leading-tight"
                style={{ letterSpacing: '-0.02em' }}
              >
                {data.title}
              </h2>
            </div>
            <div className="mt-12">
              <div className={`inline-flex items-center gap-3 px-5 py-2.5 border ${
                open ? 'border-white/30 bg-white/10' : 'border-white/20 bg-black/20'
              }`}>
                <span className={`w-2 h-2 rounded-full ${open ? 'bg-white animate-pulse' : 'bg-white/40'}`} />
                <span className="font-russo text-sm uppercase tracking-widest text-white">
                  {open ? 'Открыто сейчас' : 'Закрыто'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Schedule */}
          <div className="bg-soviet-dark2 p-10 md:p-14">
            <div className="space-y-0">
              {data.schedule.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-5 border-b border-white/6 last:border-0"
                >
                  <span className="font-russo text-sm md:text-base uppercase text-aged-cream/80 tracking-wider">
                    {item.day}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-pt text-white/50 tabular-nums">{item.open}</span>
                    <div className="w-6 h-px bg-soviet-red/50" />
                    <span className="font-pt text-white/50 tabular-nums">{item.close}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="font-pt text-xs text-white/20 uppercase tracking-widest mt-8">
              ул. А.Г. Стаханова, 49А (этаж 1) · г. Липецк
            </p>
          </div>
        </div>
      </div>

      {/* Bottom carpet strip */}
      <div
        className="absolute bottom-0 left-0 right-0 h-3"
        style={{
          background: 'repeating-linear-gradient(90deg, #C00020 0px, #C00020 20px, #8B0000 20px, #8B0000 40px, #C00020 40px, #C00020 60px, #0D0D0D 60px, #0D0D0D 80px)',
        }}
      />
    </section>
  )
}
