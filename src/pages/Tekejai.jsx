import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const today = () => new Date().toISOString().split('T')[0]

export default function Tekejai() {
  const [suppliers, setSuppliers] = useState([])
  const [inventory, setInventory] = useState([])
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' | 'new-supplier' | 'new-delivery'
  const [supplierForm, setSupplierForm] = useState({ name: '', contact_name: '', phone: '', notes: '' })
  const [delivery, setDelivery] = useState({ supplier_id: '', date: today(), items: [{ inventory_id: '', qty: '', price: '' }] })
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [s, inv, del] = await Promise.all([
      supabase.from('suppliers').select('*').order('name'),
      supabase.from('inventory').select('id, name, unit, quantity, unit_cost').order('name'),
      supabase.from('expenses').select('*').eq('category', 'Tiekėjas').order('date', { ascending: false }).limit(30),
    ])
    setSuppliers(s.data || [])
    setInventory(inv.data || [])
    setDeliveries(del.data || [])
    setLoading(false)
  }

  async function saveSupplier(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('suppliers').insert({
      name: supplierForm.name,
      contact_name: supplierForm.contact_name,
      phone: supplierForm.phone,
      notes: supplierForm.notes,
    })
    setSupplierForm({ name: '', contact_name: '', phone: '', notes: '' })
    setView('list')
    setSaving(false)
    loadAll()
  }

  async function saveDelivery(e) {
    e.preventDefault()
    setSaving(true)

    const validItems = delivery.items.filter(i => i.inventory_id && Number(i.qty) > 0)
    if (validItems.length === 0) { setSaving(false); return }

    const total = validItems.reduce((s, i) => s + Number(i.qty) * Number(i.price || 0), 0)
    const supplier = suppliers.find(s => s.id === delivery.supplier_id)

    // 1. Išlaida
    await supabase.from('expenses').insert({
      date: delivery.date,
      amount: total,
      category: 'Tiekėjas',
      description: supplier ? supplier.name : 'Tiekėjas',
    })

    // 2. Sandėlis: pridėti kiekius + atnaujinti kainą
    for (const item of validItems) {
      const inv = inventory.find(i => i.id === item.inventory_id)
      if (!inv) continue
      const newQty = Number(inv.quantity) + Number(item.qty)
      const update = { quantity: newQty }
      if (Number(item.price) > 0) update.unit_cost = Number(item.price)
      await supabase.from('inventory').update(update).eq('id', item.inventory_id)
    }

    setResult({ total, items: validItems.length, supplier: supplier?.name })
    setDelivery({ supplier_id: '', date: today(), items: [{ inventory_id: '', qty: '', price: '' }] })
    setView('list')
    setSaving(false)
    loadAll()
  }

  function addItem() {
    setDelivery(d => ({ ...d, items: [...d.items, { inventory_id: '', qty: '', price: '' }] }))
  }

  function updateItem(idx, field, val) {
    setDelivery(d => {
      const items = [...d.items]
      items[idx] = { ...items[idx], [field]: val }
      // auto-fill kaina iš sandėlio
      if (field === 'inventory_id') {
        const inv = inventory.find(i => i.id === val)
        if (inv && Number(inv.unit_cost) > 0) items[idx].price = inv.unit_cost
      }
      return { ...d, items }
    })
  }

  function removeItem(idx) {
    setDelivery(d => ({ ...d, items: d.items.filter((_, i) => i !== idx) }))
  }

  const deliveryTotal = delivery.items.reduce((s, i) => s + Number(i.qty || 0) * Number(i.price || 0), 0)

  if (loading) return <div className="text-center py-16 text-gray-400">⏳ Kraunama...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">🚚 Tiekėjai</h1>
        <div className="flex gap-2">
          <button onClick={() => setView(view === 'new-delivery' ? 'list' : 'new-delivery')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-2 rounded-xl transition shadow text-sm">
            {view === 'new-delivery' ? '✕' : '📦 Pristatymas'}
          </button>
          <button onClick={() => setView(view === 'new-supplier' ? 'list' : 'new-supplier')}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-3 py-2 rounded-xl transition shadow text-sm">
            {view === 'new-supplier' ? '✕' : '+ Tiekėjas'}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-bold text-green-700">Pristatymas įvestas!</p>
            <p className="text-sm text-green-600">{result.supplier} · {result.items} produktai · €{result.total.toFixed(2)}</p>
          </div>
          <button onClick={() => setResult(null)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      {/* Naujas tiekėjas */}
      {view === 'new-supplier' && (
        <form onSubmit={saveSupplier} className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 space-y-3">
          <h3 className="font-bold text-purple-700">Naujas tiekėjas</h3>
          <input placeholder="Įmonės pavadinimas *" required value={supplierForm.name}
            onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })}
            className="w-full border-2 border-purple-200 rounded-xl px-3 py-2 focus:border-purple-400 focus:outline-none" />
          <input placeholder="Kontaktinis asmuo" value={supplierForm.contact_name}
            onChange={e => setSupplierForm({ ...supplierForm, contact_name: e.target.value })}
            className="w-full border-2 border-purple-200 rounded-xl px-3 py-2 focus:border-purple-400 focus:outline-none" />
          <input placeholder="📞 Telefonas" value={supplierForm.phone}
            onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })}
            className="w-full border-2 border-purple-200 rounded-xl px-3 py-2 focus:border-purple-400 focus:outline-none" />
          <textarea placeholder="Pastabos" rows={2} value={supplierForm.notes}
            onChange={e => setSupplierForm({ ...supplierForm, notes: e.target.value })}
            className="w-full border-2 border-purple-200 rounded-xl px-3 py-2 focus:border-purple-400 focus:outline-none resize-none" />
          <button type="submit" disabled={saving}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition">
            {saving ? '⏳ Saugoma...' : '✅ Pridėti tiekėją'}
          </button>
        </form>
      )}

      {/* Naujas pristatymas */}
      {view === 'new-delivery' && (
        <form onSubmit={saveDelivery} className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 space-y-3">
          <h3 className="font-bold text-green-700">📦 Naujas pristatymas</h3>

          <div className="grid grid-cols-2 gap-2">
            <select value={delivery.supplier_id}
              onChange={e => setDelivery(d => ({ ...d, supplier_id: e.target.value }))}
              className="border-2 border-green-200 rounded-xl px-3 py-2 focus:border-green-400 focus:outline-none">
              <option value="">-- Tiekėjas --</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="date" value={delivery.date}
              onChange={e => setDelivery(d => ({ ...d, date: e.target.value }))}
              className="border-2 border-green-200 rounded-xl px-3 py-2 focus:border-green-400 focus:outline-none" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-green-700">Produktai:</p>
            {delivery.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <select value={item.inventory_id}
                  onChange={e => updateItem(idx, 'inventory_id', e.target.value)}
                  className="flex-1 border-2 border-green-200 rounded-xl px-2 py-2 text-sm focus:border-green-400 focus:outline-none">
                  <option value="">-- Produktas --</option>
                  {inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                </select>
                <input type="number" min="0" step="0.01" placeholder="Kiekis"
                  value={item.qty}
                  onChange={e => updateItem(idx, 'qty', e.target.value)}
                  className="w-20 border-2 border-green-200 rounded-xl px-2 py-2 text-sm focus:border-green-400 focus:outline-none" />
                <div className="relative w-24">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">€/vnt</span>
                  <input type="number" min="0" step="0.01" placeholder="Kaina"
                    value={item.price}
                    onChange={e => updateItem(idx, 'price', e.target.value)}
                    className="w-full border-2 border-green-200 rounded-xl pl-8 pr-1 py-2 text-sm focus:border-green-400 focus:outline-none" />
                </div>
                {delivery.items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 text-lg">✕</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addItem}
              className="text-green-600 hover:text-green-800 text-sm font-medium">
              + Pridėti produktą
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-green-200">
            <span className="text-green-700 font-semibold">Viso: <span className="font-black text-lg">€{deliveryTotal.toFixed(2)}</span></span>
            <button type="submit" disabled={saving || deliveryTotal === 0}
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 rounded-xl transition disabled:opacity-50">
              {saving ? '⏳...' : '✅ Išsaugoti'}
            </button>
          </div>
          <p className="text-xs text-green-600">Automatiškai: sukurs išlaidą P&L + papildys sandėlio kiekius</p>
        </form>
      )}

      {/* Tiekėjų sąrašas */}
      <div className="space-y-2">
        {suppliers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">🚚</div>
            <p>Tiekėjų nėra. Pridėk pirmą!</p>
          </div>
        ) : suppliers.map(s => (
          <div key={s.id} className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🚚</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-800">{s.name}</div>
              {s.contact_name && <div className="text-sm text-gray-500">👤 {s.contact_name}</div>}
              {s.phone && <div className="text-sm text-gray-500">📞 {s.phone}</div>}
            </div>
            <button onClick={async () => { if (!window.confirm(`Ištrinti "${s.name}"?`)) return; await supabase.from('suppliers').delete().eq('id', s.id); loadAll() }}
              className="text-gray-300 hover:text-red-400 transition text-lg">🗑️</button>
          </div>
        ))}
      </div>

      {/* Paskutiniai pristatymai */}
      {deliveries.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h3 className="font-bold text-gray-700 mb-3">📋 Paskutiniai pristatymai</h3>
          <div className="space-y-2">
            {deliveries.map(d => (
              <div key={d.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-400 w-20 flex-shrink-0">{d.date}</span>
                <span className="flex-1 text-sm text-gray-700 truncate">{d.description}</span>
                <span className="font-bold text-red-500 text-sm">−€{Number(d.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
