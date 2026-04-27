import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import { XP_REWARDS } from '../lib/gamification'

const SOURCES = ['Vakarienė', 'Pietūs', 'Pusryčiai', 'Fondo renginys', 'Išsinešti', 'Kita']

export default function Pajamos() {
  const { addXP } = useApp()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [period, setPeriod] = useState('savaite')
  const [form, setForm] = useState({ amount: '', source: 'Vakarienė', date: new Date().toISOString().split('T')[0], notes: '' })
  const [saving, setSaving] = useState(false)
  const [xpPop, setXpPop] = useState(null)

  useEffect(() => { load() }, [period])

  function getFromDate(p) {
    const d = new Date()
    if (p === 'diena') d.setDate(d.getDate())
    else if (p === 'savaite') d.setDate(d.getDate() - 7)
    else if (p === 'menuo') d.setMonth(d.getMonth() - 1)
    else d.setFullYear(d.getFullYear() - 1)
    return d.toISOString().split('T')[0]
  }

  async function load() {
    const from = getFromDate(period)
    const { data } = await supabase.from('revenue').select('*').gte('date', from).order('date', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('revenue').insert({
      amount: Number(form.amount),
      source: form.source,
      date: form.date,
      notes: form.notes,
    })
    await addXP(XP_REWARDS.add_revenue)
    setXpPop(`+${XP_REWARDS.add_revenue} XP`)
    setTimeout(() => setXpPop(null), 1500)
    setForm({ amount: '', source: 'Vakarienė', date: new Date().toISOString().split('T')[0], notes: '' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function deleteItem(id) {
    await supabase.from('revenue').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const total = items.reduce((s, i) => s + Number(i.amount), 0)

  // Group by date
  const byDate = items.reduce((acc, item) => {
    const d = item.date
    if (!acc[d]) acc[d] = []
    acc[d].push(item)
    return acc
  }, {})

  const dailyTotals = Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0]))
  const avgDaily = dailyTotals.length ? total / dailyTotals.length : 0
  const maxDay = dailyTotals.reduce((max, [, items]) => {
    const s = items.reduce((s, i) => s + Number(i.amount), 0)
    return s > max ? s : max
  }, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">💰 Pajamos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-xl transition shadow"
        >
          {showForm ? '✕ Uždaryti' : '+ Pridėti'}
        </button>
      </div>

      {xpPop && (
        <div className="fixed top-20 right-4 bg-amber-400 text-white font-black px-4 py-2 rounded-xl text-lg shadow-lg animate-bounce z-50">
          {xpPop} ⭐
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 space-y-3">
          <h3 className="font-bold text-green-700">Naujos pajamos</h3>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-2xl font-bold">€</span>
            <input
              placeholder="0.00"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              required
              className="w-full border-2 border-green-200 rounded-xl pl-10 pr-3 py-3 text-2xl font-bold focus:border-green-400 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.source}
              onChange={e => setForm({ ...form, source: e.target.value })}
              className="border-2 border-green-200 rounded-xl px-3 py-2 focus:border-green-400 focus:outline-none"
            >
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="border-2 border-green-200 rounded-xl px-3 py-2 focus:border-green-400 focus:outline-none"
            />
          </div>
          <input
            placeholder="Pastabos (nebūtina)"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            className="w-full border-2 border-green-200 rounded-xl px-3 py-2 focus:border-green-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-lg transition"
          >
            {saving ? '⏳ Saugoma...' : '✅ Įrašyti pajamas (+10 XP)'}
          </button>
        </form>
      )}

      {/* Period filter */}
      <div className="flex gap-2">
        {[['diena', 'Šiandien'], ['savaite', 'Savaitė'], ['menuo', 'Mėnuo'], ['metai', 'Metai']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setPeriod(val)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              period === val ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-500 text-white rounded-2xl p-4 text-center col-span-1">
          <p className="text-green-100 text-xs">Viso</p>
          <p className="text-2xl font-black">€{total.toFixed(0)}</p>
        </div>
        <div className="bg-green-100 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-green-700 text-xs">Vidurkis/d.</p>
          <p className="text-xl font-black text-green-600">€{avgDaily.toFixed(0)}</p>
        </div>
        <div className="bg-green-100 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-green-700 text-xs">Rekordas</p>
          <p className="text-xl font-black text-green-600">€{maxDay.toFixed(0)}</p>
        </div>
      </div>

      {/* Daily bar chart */}
      {dailyTotals.length > 0 && maxDay > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h3 className="font-bold text-gray-700 mb-3">Dienos pajamos</h3>
          <div className="space-y-2">
            {dailyTotals.slice(0, 10).map(([date, dayItems]) => {
              const dayTotal = dayItems.reduce((s, i) => s + Number(i.amount), 0)
              return (
                <div key={date} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-20 flex-shrink-0">{date.slice(5)}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-green-400 rounded-full transition-all"
                      style={{ width: `${(dayTotal / maxDay) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-16 text-right">€{dayTotal.toFixed(0)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">⏳ Kraunama...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">💰</div>
          <p>Šiuo laikotarpiu pajamų nėra</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800">{item.source}</div>
                <div className="text-sm text-gray-400">{item.date}{item.notes && ` · ${item.notes}`}</div>
              </div>
              <div className="text-xl font-black text-green-500 flex-shrink-0">€{Number(item.amount).toFixed(2)}</div>
              <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-400 transition">🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
