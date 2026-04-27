import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import { XP_REWARDS } from '../lib/gamification'

const CATEGORIES = ['Maisto produktai', 'Komunaliniai', 'Darbo užmokestis', 'Įranga', 'Remontas', 'Rinkodara', 'Kita']

export default function Islaidos() {
  const { addXP } = useApp()
  const [items, setItems] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [period, setPeriod] = useState('savaite')
  const [form, setForm] = useState({ description: '', amount: '', category: 'Kita', supplier_id: '', date: new Date().toISOString().split('T')[0], notes: '' })
  const [saving, setSaving] = useState(false)
  const [xpPop, setXpPop] = useState(null)

  useEffect(() => { load() }, [period])

  async function load() {
    const from = getFromDate(period)
    const [expRes, supRes] = await Promise.all([
      supabase.from('expenses').select('*, suppliers(name)').gte('date', from).order('date', { ascending: false }),
      supabase.from('suppliers').select('id, name').order('name'),
    ])
    setItems(expRes.data || [])
    setSuppliers(supRes.data || [])
    setLoading(false)
  }

  function getFromDate(p) {
    const d = new Date()
    if (p === 'diena') d.setDate(d.getDate())
    else if (p === 'savaite') d.setDate(d.getDate() - 7)
    else if (p === 'menuo') d.setMonth(d.getMonth() - 1)
    else d.setFullYear(d.getFullYear() - 1)
    return d.toISOString().split('T')[0]
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('expenses').insert({
      description: form.description,
      amount: Number(form.amount),
      category: form.category,
      supplier_id: form.supplier_id || null,
      date: form.date,
      notes: form.notes,
    })
    await addXP(XP_REWARDS.add_expense)
    setXpPop(`+${XP_REWARDS.add_expense} XP`)
    setTimeout(() => setXpPop(null), 1500)
    setForm({ description: '', amount: '', category: 'Kita', supplier_id: '', date: new Date().toISOString().split('T')[0], notes: '' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function deleteItem(id) {
    await supabase.from('expenses').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const total = items.reduce((s, i) => s + Number(i.amount), 0)

  const byCategory = CATEGORIES.map(cat => ({
    cat,
    total: items.filter(i => i.category === cat).reduce((s, i) => s + Number(i.amount), 0)
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">💸 Išlaidos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl transition shadow"
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
        <form onSubmit={handleSubmit} className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 space-y-3">
          <h3 className="font-bold text-red-700">Nauja išlaida</h3>
          <input
            placeholder="Aprašymas (pvz. Daržovės iš turgaus)"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            required
            className="w-full border-2 border-red-200 rounded-xl px-3 py-2 text-lg focus:border-red-400 focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-bold">€</span>
              <input
                placeholder="Suma"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                required
                className="w-full border-2 border-red-200 rounded-xl pl-8 pr-3 py-2 text-lg focus:border-red-400 focus:outline-none"
              />
            </div>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="border-2 border-red-200 rounded-xl px-3 py-2 focus:border-red-400 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="border-2 border-red-200 rounded-xl px-3 py-2 focus:border-red-400 focus:outline-none"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select
              value={form.supplier_id}
              onChange={e => setForm({ ...form, supplier_id: e.target.value })}
              className="border-2 border-red-200 rounded-xl px-3 py-2 focus:border-red-400 focus:outline-none"
            >
              <option value="">Tiekėjas (nebūtina)</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <input
            placeholder="Pastabos (nebūtina)"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            className="w-full border-2 border-red-200 rounded-xl px-3 py-2 focus:border-red-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-lg transition"
          >
            {saving ? '⏳ Saugoma...' : '✅ Įrašyti išlaidą (+10 XP)'}
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
              period === val ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="bg-red-500 text-white rounded-2xl p-4 text-center">
        <p className="text-red-100 text-sm">Viso išleista</p>
        <p className="text-4xl font-black">€{total.toFixed(2)}</p>
      </div>

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h3 className="font-bold text-gray-700 mb-3">Pagal kategorijas</h3>
          <div className="space-y-2">
            {byCategory.map(({ cat, total: catTotal }) => (
              <div key={cat} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-36 truncate">{cat}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-red-400 rounded-full"
                    style={{ width: `${total > 0 ? (catTotal / total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-700 w-16 text-right">€{catTotal.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">⏳ Kraunama...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">💸</div>
          <p>Šiuo laikotarpiu išlaidų nėra</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 truncate">{item.description}</div>
                <div className="text-sm text-gray-400">
                  {item.category} {item.suppliers?.name && `· ${item.suppliers.name}`} · {item.date}
                </div>
                {item.notes && <div className="text-xs text-gray-400 mt-0.5">{item.notes}</div>}
              </div>
              <div className="text-xl font-black text-red-500 flex-shrink-0">€{Number(item.amount).toFixed(2)}</div>
              <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-400 transition">🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
