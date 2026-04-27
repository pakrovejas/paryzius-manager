import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import { XP_REWARDS } from '../lib/gamification'

const CATEGORIES = ['Daržovės', 'Mėsa', 'Žuvis', 'Pieno produktai', 'Gėrimai', 'Prieskoniai', 'Kita']

const STATUS_CONFIG = {
  ok: { label: 'Gerai', color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-400' },
  low: { label: 'Mažai', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  out: { label: 'Baigėsi', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-400' },
}

function getStatus(qty, minQty) {
  if (qty <= 0) return 'out'
  if (qty <= minQty) return 'low'
  return 'ok'
}

export default function Sandelis() {
  const { addXP } = useApp()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('visi')
  const [form, setForm] = useState({ name: '', quantity: '', unit: 'kg', min_quantity: '', category: 'Kita' })
  const [saving, setSaving] = useState(false)
  const [xpPop, setXpPop] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('inventory').select('*, suppliers(name)').order('name')
    setItems(data || [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('inventory').insert({
      name: form.name,
      quantity: Number(form.quantity),
      unit: form.unit,
      min_quantity: Number(form.min_quantity) || 0,
      category: form.category,
    })
    await addXP(XP_REWARDS.add_inventory_item)
    showXP(XP_REWARDS.add_inventory_item)
    setForm({ name: '', quantity: '', unit: 'kg', min_quantity: '', category: 'Kita' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function updateQty(id, delta) {
    const item = items.find(i => i.id === id)
    const newQty = Math.max(0, Number(item.quantity) + delta)
    await supabase.from('inventory').update({ quantity: newQty }).eq('id', id)
    await addXP(XP_REWARDS.update_inventory)
    showXP(XP_REWARDS.update_inventory)
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i))
  }

  async function deleteItem(id) {
    await supabase.from('inventory').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function showXP(amount) {
    setXpPop(`+${amount} XP`)
    setTimeout(() => setXpPop(null), 1500)
  }

  const filtered = filter === 'visi' ? items
    : filter === 'mazai' ? items.filter(i => getStatus(i.quantity, i.min_quantity) !== 'ok')
    : items.filter(i => i.category === filter)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">📦 Sandėlis</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-xl transition shadow"
        >
          {showForm ? '✕ Uždaryti' : '+ Pridėti'}
        </button>
      </div>

      {/* XP popup */}
      {xpPop && (
        <div className="fixed top-20 right-4 bg-amber-400 text-white font-black px-4 py-2 rounded-xl text-lg shadow-lg animate-bounce z-50">
          {xpPop} ⭐
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 space-y-3">
          <h3 className="font-bold text-blue-700">Naujas produktas</h3>
          <input
            placeholder="Produkto pavadinimas"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 text-lg focus:border-blue-400 focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Kiekis"
              type="number"
              min="0"
              step="0.1"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
              required
              className="border-2 border-blue-200 rounded-xl px-3 py-2 text-lg focus:border-blue-400 focus:outline-none"
            />
            <select
              value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })}
              className="border-2 border-blue-200 rounded-xl px-3 py-2 text-lg focus:border-blue-400 focus:outline-none"
            >
              {['kg', 'g', 'L', 'ml', 'vnt', 'pak'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Min. kiekis (perspėjimas)"
              type="number"
              min="0"
              step="0.1"
              value={form.min_quantity}
              onChange={e => setForm({ ...form, min_quantity: e.target.value })}
              className="border-2 border-blue-200 rounded-xl px-3 py-2 focus:border-blue-400 focus:outline-none"
            />
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="border-2 border-blue-200 rounded-xl px-3 py-2 focus:border-blue-400 focus:outline-none"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-lg transition"
          >
            {saving ? '⏳ Saugoma...' : '✅ Pridėti produktą (+15 XP)'}
          </button>
        </form>
      )}

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['visi', 'mazai', ...CATEGORIES].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filter === f ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'mazai' ? '⚠️ Baigiasi' : f === 'visi' ? 'Visi' : f}
          </button>
        ))}
      </div>

      {/* Items */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">⏳ Kraunama...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">📦</div>
          <p>Sandėlis tuščias. Pridėkite produktų!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => {
            const status = getStatus(item.quantity, item.min_quantity)
            const cfg = STATUS_CONFIG[status]
            return (
              <div key={item.id} className={`bg-white border-2 ${cfg.color} rounded-2xl p-4 flex items-center gap-3`}>
                <div className={`w-3 h-3 rounded-full ${cfg.dot} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 truncate">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.category}</div>
                </div>
                <div className="text-right mr-2">
                  <div className="text-xl font-black text-gray-800">{item.quantity} <span className="text-sm font-normal text-gray-400">{item.unit}</span></div>
                  {item.min_quantity > 0 && (
                    <div className="text-xs text-gray-400">min: {item.min_quantity} {item.unit}</div>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="w-9 h-9 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-xl text-lg transition"
                  >−</button>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="w-9 h-9 bg-green-100 hover:bg-green-200 text-green-600 font-bold rounded-xl text-lg transition"
                  >+</button>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-gray-300 hover:text-red-400 transition text-lg ml-1"
                >🗑️</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
