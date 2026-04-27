import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import { XP_REWARDS } from '../lib/gamification'

export default function Tekejai() {
  const { addXP } = useApp()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name: '', contact_name: '', phone: '', email: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [xpPop, setXpPop] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('suppliers').select('*').order('name')
    setSuppliers(data || [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('suppliers').insert({
      name: form.name,
      contact_name: form.contact_name,
      phone: form.phone,
      email: form.email,
      notes: form.notes,
    })
    await addXP(XP_REWARDS.add_supplier)
    setXpPop(`+${XP_REWARDS.add_supplier} XP`)
    setTimeout(() => setXpPop(null), 1500)
    setForm({ name: '', contact_name: '', phone: '', email: '', notes: '' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function deleteSupplier(id) {
    await supabase.from('suppliers').delete().eq('id', id)
    setSuppliers(prev => prev.filter(s => s.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">🚚 Tiekėjai</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-xl transition shadow"
        >
          {showForm ? '✕ Uždaryti' : '+ Pridėti'}
        </button>
      </div>

      {xpPop && (
        <div className="fixed top-20 right-4 bg-amber-400 text-white font-black px-4 py-2 rounded-xl text-lg shadow-lg animate-bounce z-50">
          {xpPop} ⭐
        </div>
      )}

      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center">
        <p className="text-4xl font-black text-purple-600">{suppliers.length}</p>
        <p className="text-purple-700 text-sm">Tiekėjų sąraše</p>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 space-y-3">
          <h3 className="font-bold text-purple-700">Naujas tiekėjas</h3>
          <input
            placeholder="Įmonės pavadinimas *"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border-2 border-purple-200 rounded-xl px-3 py-2 text-lg focus:border-purple-400 focus:outline-none"
          />
          <input
            placeholder="Kontaktinis asmuo"
            value={form.contact_name}
            onChange={e => setForm({ ...form, contact_name: e.target.value })}
            className="w-full border-2 border-purple-200 rounded-xl px-3 py-2 focus:border-purple-400 focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="📞 Telefonas"
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="border-2 border-purple-200 rounded-xl px-3 py-2 focus:border-purple-400 focus:outline-none"
            />
            <input
              placeholder="📧 El. paštas"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="border-2 border-purple-200 rounded-xl px-3 py-2 focus:border-purple-400 focus:outline-none"
            />
          </div>
          <textarea
            placeholder="Pastabos (pvz. pristatymo dienų, minimalus užsakymas)"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="w-full border-2 border-purple-200 rounded-xl px-3 py-2 focus:border-purple-400 focus:outline-none resize-none"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl text-lg transition"
          >
            {saving ? '⏳ Saugoma...' : '✅ Pridėti tiekėją (+15 XP)'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">⏳ Kraunama...</div>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">🚚</div>
          <p>Tiekėjų sąrašas tuščias. Pridėkite tiekėjų!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {suppliers.map(s => (
            <div key={s.id}>
              <div
                className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:border-purple-300 transition"
                onClick={() => setSelected(selected?.id === s.id ? null : s)}
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  🚚
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800">{s.name}</div>
                  {s.contact_name && <div className="text-sm text-gray-500">👤 {s.contact_name}</div>}
                </div>
                <span className="text-gray-400">{selected?.id === s.id ? '▲' : '▼'}</span>
              </div>

              {selected?.id === s.id && (
                <div className="bg-purple-50 border-2 border-purple-200 border-t-0 rounded-b-2xl p-4 space-y-2 -mt-1">
                  {s.phone && (
                    <a href={`tel:${s.phone}`} className="flex items-center gap-2 text-purple-700 hover:text-purple-900">
                      <span>📞</span> <span className="font-medium">{s.phone}</span>
                    </a>
                  )}
                  {s.email && (
                    <a href={`mailto:${s.email}`} className="flex items-center gap-2 text-purple-700 hover:text-purple-900">
                      <span>📧</span> <span className="font-medium">{s.email}</span>
                    </a>
                  )}
                  {s.notes && (
                    <div className="text-sm text-gray-600 bg-white rounded-xl p-3">
                      📝 {s.notes}
                    </div>
                  )}
                  <button
                    onClick={() => deleteSupplier(s.id)}
                    className="text-red-400 hover:text-red-600 text-sm font-medium transition"
                  >
                    🗑️ Ištrinti tiekėją
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
