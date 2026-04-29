import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import { XP_REWARDS } from '../lib/gamification'

const CATEGORIES = ['Užkandžiai', 'Sriubos', 'Pagrindiniai', 'Desertai', 'Gėrimai', 'Alkoholis', 'Kita']

// ─── RECEPTŪROS ────────────────────────────────────────────────────
function Recepturos() {
  const [menuItems, setMenuItems] = useState([])
  const [inventory, setInventory] = useState([])
  const [recipes, setRecipes] = useState({}) // { menu_item_id: [recipe_items] }
  const [selected, setSelected] = useState(null)
  const [addingIngredient, setAddingIngredient] = useState(false)
  const [ingredientForm, setIngredientForm] = useState({ inventory_id: '', quantity: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const [menuRes, invRes, recRes] = await Promise.all([
      supabase.from('menu_items').select('*').order('category').order('name'),
      supabase.from('inventory').select('*').order('name'),
      supabase.from('recipe_items').select('*, inventory(name, unit, unit_cost)'),
    ])
    setMenuItems(menuRes.data || [])
    setInventory(invRes.data || [])

    // Grupuoti pagal menu_item_id
    const grouped = {}
    for (const r of (recRes.data || [])) {
      if (!grouped[r.menu_item_id]) grouped[r.menu_item_id] = []
      grouped[r.menu_item_id].push(r)
    }
    setRecipes(grouped)
    setLoading(false)
  }

  async function addIngredient(e) {
    e.preventDefault()
    if (!selected || !ingredientForm.inventory_id) return
    await supabase.from('recipe_items').insert({
      menu_item_id: selected.id,
      inventory_id: ingredientForm.inventory_id,
      quantity: Number(ingredientForm.quantity),
    })
    setIngredientForm({ inventory_id: '', quantity: '' })
    setAddingIngredient(false)
    load()
  }

  async function removeIngredient(id, name) {
    if (!window.confirm(`Ištrinti ingredientą "${name}"?`)) return
    await supabase.from('recipe_items').delete().eq('id', id)
    load()
  }

  function calcCost(menuItemId) {
    const items = recipes[menuItemId] || []
    return items.reduce((s, r) => {
      const cost = Number(r.inventory?.unit_cost || 0) * Number(r.quantity)
      return s + cost
    }, 0)
  }

  function getFoodCostPct(menuItemId, price) {
    const cost = calcCost(menuItemId)
    if (!price || !cost) return null
    return (cost / Number(price)) * 100
  }

  function getFoodCostColor(pct) {
    if (pct <= 25) return 'text-green-600 bg-green-50 border-green-200'
    if (pct <= 35) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  function getRecommendedPrice(cost) {
    return cost / 0.30 // 30% food cost tikslas
  }

  if (loading) return <div className="text-center py-12 text-gray-400">⏳ Kraunama...</div>

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">🧮 Receptūrų kalkuliatorius</h2>
        <p className="text-xs text-gray-400">Pasirinkite patiekalą → pridėkite ingredientus → matysite savikainą</p>
      </div>

      {/* Patiekalų sąrašas su savikaina */}
      <div className="space-y-2">
        {menuItems.map(item => {
          const cost = calcCost(item.id)
          const pct = getFoodCostPct(item.id, item.price)
          const recipeCount = (recipes[item.id] || []).length
          const isOpen = selected?.id === item.id

          return (
            <div key={item.id}>
              <div
                onClick={() => { setSelected(isOpen ? null : item); setAddingIngredient(false) }}
                className={`bg-white border-2 rounded-2xl p-4 cursor-pointer transition ${
                  isOpen ? 'border-amber-300 bg-amber-50' : 'border-gray-200 hover:border-amber-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 truncate">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.category} · {recipeCount} ingredientai</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-black text-gray-800">€{Number(item.price).toFixed(2)}</div>
                    {cost > 0 && (
                      <div className="text-xs text-gray-500">savikaina: €{cost.toFixed(2)}</div>
                    )}
                  </div>
                  {pct !== null && (
                    <div className={`border rounded-xl px-2 py-1 text-xs font-bold flex-shrink-0 ${getFoodCostColor(pct)}`}>
                      {pct.toFixed(0)}%
                    </div>
                  )}
                  <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Receptūros detalės */}
              {isOpen && (
                <div className="bg-amber-50 border-2 border-amber-200 border-t-0 rounded-b-2xl p-4 space-y-3 -mt-1">

                  {/* Savikaina suvestinė */}
                  {cost > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white rounded-xl p-3 text-center border border-amber-100">
                        <p className="text-xs text-gray-500">Savikaina</p>
                        <p className="font-black text-gray-800">€{cost.toFixed(2)}</p>
                      </div>
                      <div className={`rounded-xl p-3 text-center border ${pct !== null ? getFoodCostColor(pct) : 'bg-white border-gray-100'}`}>
                        <p className="text-xs opacity-70">Maisto kaštas</p>
                        <p className="font-black">{pct !== null ? `${pct.toFixed(1)}%` : '—'}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 text-center border border-amber-100">
                        <p className="text-xs text-gray-500">Rekomenduojama</p>
                        <p className="font-black text-green-600">€{getRecommendedPrice(cost).toFixed(2)}</p>
                      </div>
                    </div>
                  )}

                  {/* Maisto kašto paaiškinimas */}
                  {pct !== null && (
                    <div className={`text-xs rounded-xl px-3 py-2 border ${getFoodCostColor(pct)}`}>
                      {pct <= 25 && '✅ Puiku! Maisto kaštas žemiau 25% — labai pelningas patiekalas.'}
                      {pct > 25 && pct <= 35 && '⚠️ Maisto kaštas 25-35% — priimtina, bet galima optimizuoti.'}
                      {pct > 35 && `🚨 Maisto kaštas virš 35%! Rekomenduojama kaina: €${getRecommendedPrice(cost).toFixed(2)}`}
                    </div>
                  )}

                  {/* Ingredientų sąrašas */}
                  {(recipes[item.id] || []).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Ingredientai</p>
                      {recipes[item.id].map(r => (
                        <div key={r.id} className="bg-white rounded-xl px-3 py-2 flex items-center gap-2 border border-amber-100">
                          <div className="flex-1 text-sm font-medium text-gray-700">{r.inventory?.name}</div>
                          <div className="text-sm text-gray-500">{r.quantity} {r.inventory?.unit}</div>
                          {Number(r.inventory?.unit_cost) > 0 && (
                            <div className="text-xs text-gray-400">
                              €{(Number(r.inventory.unit_cost) * Number(r.quantity)).toFixed(2)}
                            </div>
                          )}
                          <button onClick={() => removeIngredient(r.id, r.inventory?.name)}
                            className="text-gray-300 hover:text-red-400 transition text-sm">🗑️</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pridėti ingredientą */}
                  {addingIngredient ? (
                    <form onSubmit={addIngredient} className="bg-white rounded-xl p-3 border border-amber-200 space-y-2">
                      <p className="text-xs font-bold text-amber-700">Pridėti ingredientą</p>
                      <select
                        value={ingredientForm.inventory_id}
                        onChange={e => setIngredientForm({ ...ingredientForm, inventory_id: e.target.value })}
                        required
                        className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                      >
                        <option value="">Pasirinkite produktą...</option>
                        {inventory.map(inv => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} ({inv.unit}){Number(inv.unit_cost) > 0 ? ` — €${Number(inv.unit_cost).toFixed(2)}/${inv.unit}` : ' — kaina nenurodyta'}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="number" min="0" step="0.001"
                          placeholder="Kiekis"
                          value={ingredientForm.quantity}
                          onChange={e => setIngredientForm({ ...ingredientForm, quantity: e.target.value })}
                          required
                          className="flex-1 border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                        />
                        <button type="submit"
                          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                          ✓ Pridėti
                        </button>
                        <button type="button" onClick={() => setAddingIngredient(false)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm transition">
                          ✕
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setAddingIngredient(true)}
                      className="w-full border-2 border-dashed border-amber-300 text-amber-600 hover:bg-amber-100 rounded-xl py-2 text-sm font-semibold transition"
                    >
                      + Pridėti ingredientą
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-500 space-y-1">
        <p className="font-bold text-gray-600 mb-2">📊 Maisto kašto spalvos:</p>
        <p><span className="text-green-600 font-bold">Žalia (≤25%)</span> — puikus pelningumas</p>
        <p><span className="text-yellow-600 font-bold">Geltona (25–35%)</span> — priimtina norma</p>
        <p><span className="text-red-600 font-bold">Raudona (&gt;35%)</span> — per brangi savikaina, didinkite kainą</p>
        <p className="mt-2">💡 Rekomenduojama kaina skaičiuojama pagal 30% maisto kašto tikslą</p>
      </div>
    </div>
  )
}

// ─── PATIEKALAI ─────────────────────────────────────────────────────
function Patiekalai() {
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
      name: form.name, description: form.description,
      price: Number(form.price), category: form.category,
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

  async function deleteItem(id, name) {
    if (!window.confirm(`Ištrinti "${name}"? Bus ištrinta ir receptūra.`)) return
    await supabase.from('menu_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const filtered = categoryFilter === 'Visi' ? items : items.filter(i => i.category === categoryFilter)
  const available = items.filter(i => i.is_available).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">🍽️ Patiekalai</h2>
          <p className="text-xs text-gray-400">{available} iš {items.length} galima užsakyti</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded-xl transition shadow text-sm">
          {showForm ? '✕' : '+ Pridėti'}
        </button>
      </div>

      {xpPop && (
        <div className="fixed top-20 right-4 bg-amber-400 text-white font-black px-4 py-2 rounded-xl text-lg shadow-lg animate-bounce z-50">
          {xpPop} ⭐
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 space-y-3">
          <h3 className="font-bold text-yellow-700">Naujas patiekalas</h3>
          <input placeholder="Pavadinimas" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} required
            className="w-full border-2 border-yellow-200 rounded-xl px-3 py-2 text-lg focus:border-yellow-400 focus:outline-none" />
          <input placeholder="Aprašymas (nebūtina)" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full border-2 border-yellow-200 rounded-xl px-3 py-2 focus:border-yellow-400 focus:outline-none" />
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">€</span>
              <input placeholder="Kaina" type="number" min="0" step="0.01" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} required
                className="w-full border-2 border-yellow-200 rounded-xl pl-7 pr-3 py-2 text-lg focus:border-yellow-400 focus:outline-none" />
            </div>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="border-2 border-yellow-200 rounded-xl px-3 py-2 focus:border-yellow-400 focus:outline-none">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_available}
              onChange={e => setForm({ ...form, is_available: e.target.checked })}
              className="w-5 h-5 rounded accent-yellow-500" />
            <span className="text-gray-700">Galima užsakyti dabar</span>
          </label>
          <button type="submit" disabled={saving}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl text-lg transition">
            {saving ? '⏳ Saugoma...' : `✅ Pridėti (+${XP_REWARDS.add_menu_item} XP)`}
          </button>
        </form>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['Visi', ...CATEGORIES].map(f => (
          <button key={f} onClick={() => setCategoryFilter(f)}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition ${
              categoryFilter === f ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>{f}</button>
        ))}
      </div>

      {loading ? <div className="text-center py-8 text-gray-400">⏳ Kraunama...</div>
      : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">🍽️</div>
          <p>Meniu tuščias. Pridėkite patiekalų!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id}
              className={`bg-white border-2 rounded-2xl p-4 flex items-center gap-3 ${item.is_available ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">{item.name}</span>
                  {!item.is_available && <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Nepasiekiama</span>}
                </div>
                {item.description && <div className="text-sm text-gray-400 truncate">{item.description}</div>}
                <div className="text-xs text-yellow-600 font-medium mt-0.5">{item.category}</div>
              </div>
              <div className="text-xl font-black text-gray-800">€{Number(item.price).toFixed(2)}</div>
              <button onClick={() => toggleAvailable(item)}
                className={`w-10 h-6 rounded-full transition-all flex-shrink-0 ${item.is_available ? 'bg-green-400' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${item.is_available ? 'translate-x-4' : ''}`} />
              </button>
              <button onClick={() => deleteItem(item.id, item.name)} className="text-gray-300 hover:text-red-400 transition">🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── PAGRINDINIS ────────────────────────────────────────────────────
export default function Meniu() {
  const [tab, setTab] = useState('patiekalai')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">📋 Receptūros</h1>
      <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl">
        <button onClick={() => setTab('patiekalai')}
          className={`flex-1 py-2 rounded-xl font-semibold text-sm transition ${tab === 'patiekalai' ? 'bg-white shadow text-yellow-600' : 'text-gray-500'}`}>
          🍽️ Patiekalai
        </button>
        <button onClick={() => setTab('recepturos')}
          className={`flex-1 py-2 rounded-xl font-semibold text-sm transition ${tab === 'recepturos' ? 'bg-white shadow text-amber-600' : 'text-gray-500'}`}>
          🧮 Receptūros
        </button>
      </div>
      {tab === 'patiekalai' ? <Patiekalai /> : <Recepturos />}
    </div>
  )
}
