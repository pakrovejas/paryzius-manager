import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import { XP_REWARDS } from '../lib/gamification'

const CATEGORIES = ['Užkandžiai', 'Sriubos', 'Pagrindiniai', 'Desertai', 'Gėrimai', 'Alkoholis', 'Kita']

export default function Meniu() {
  const { addXP } = useApp()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('Visi')
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Pagrindiniai', is_available: true })
  const [saving, setSaving] = useState(false)
  const [xpPop, setXpPop] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('menu_items').select('*').order('category').order('name')
    setItems(data || [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('menu_items').insert({
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      is_available: form.is_available,
    })
    await addXP(XP_REWARDS.add_menu_item)
    setXpPop(`+${XP_REWARDS.add_menu_item} XP`)
    setTimeout(() => setXpPop(null), 1500)
    setForm({ name: '', description: '', price: '', category: 'Pagrindiniai', is_available: true })
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function toggleAvailable(item) {
    await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i))
  }

  async function deleteItem(id) {
    await supabase.from('menu_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const filtered = categoryFilter === 'Visi' ? items : items.filter(i => i.category === categoryFilter)
  const available = items.filter(i => i.is_available).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">🍽️ Meniu</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded-xl transition shadow"
        >
          {showForm ? '✕ Uždaryti' : '+ Pridėti'}
        </button>
      </div>

      {xpPop && (
        <div className="fixed top-20 right-4 bg-amber-400 text-white font-black px-4 py-2 rounded-xl text-lg shadow-lg animate-bounce z-50">
          {xpPop} ⭐
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-yellow-600">{items.length}</p>
          <p className="text-yellow-700 text-sm">Patiekalų iš viso</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-green-600">{available}</p>
          <p className="text-green-700 text-sm">Šiandien galima užsakyti</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 space-y-3">
          <h3 className="font-bold text-yellow-700">Naujas patiekalas</h3>
          <input
            placeholder="Patiekalo pavadinimas"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border-2 border-yellow-200 rounded-xl px-3 py-2 text-lg focus:border-yellow-400 focus:outline-none"
          />
          <input
            placeholder="Aprašymas (nebūtina)"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full border-2 border-yellow-200 rounded-xl px-3 py-2 focus:border-yellow-400 focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">€</span>
              <input
                placeholder="Kaina"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                required
                className="w-full border-2 border-yellow-200 rounded-xl pl-7 pr-3 py-2 text-lg focus:border-yellow-400 focus:outline-none"
              />
            </div>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="border-2 border-yellow-200 rounded-xl px-3 py-2 focus:border-yellow-400 focus:outline-none"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={e => setForm({ ...form, is_available: e.target.checked })}
              className="w-5 h-5 rounded accent-yellow-500"
            />
            <span className="text-gray-700">Galima užsakyti dabar</span>
          </label>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl text-lg transition"
          >
            {saving ? '⏳ Saugoma...' : '✅ Pridėti patiekalą (+20 XP)'}
          </button>
        </form>
      )}

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['Visi', ...CATEGORIES].map(f => (
          <button
            key={f}
            onClick={() => setCategoryFilter(f)}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition ${
              categoryFilter === f ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">⏳ Kraunama...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">🍽️</div>
          <p>Meniu tuščias. Pridėkite patiekalų!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div
              key={item.id}
              className={`bg-white border-2 rounded-2xl p-4 flex items-center gap-3 ${
                item.is_available ? 'border-gray-200' : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">{item.name}</span>
                  {!item.is_available && <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Nepasiekiama</span>}
                </div>
                {item.description && <div className="text-sm text-gray-400 truncate">{item.description}</div>}
                <div className="text-xs text-yellow-600 font-medium mt-0.5">{item.category}</div>
              </div>
              <div className="text-xl font-black text-gray-800">€{Number(item.price).toFixed(2)}</div>
              <button
                onClick={() => toggleAvailable(item)}
                className={`w-10 h-6 rounded-full transition-all ${item.is_available ? 'bg-green-400' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${item.is_available ? 'translate-x-4' : ''}`} />
              </button>
              <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-400 transition">🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
