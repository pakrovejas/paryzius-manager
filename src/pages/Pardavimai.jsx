import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

const IGNORE_CATEGORIES = ['Priedai']

function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim())
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const vals = []
    let cur = ''
    let inQ = false
    for (const ch of lines[i]) {
      if (ch === '"') { inQ = !inQ }
      else if (ch === ',' && !inQ) { vals.push(cur.trim()); cur = '' }
      else { cur += ch }
    }
    vals.push(cur.trim())
    if (vals.length >= 13) {
      const row = {}
      headers.forEach((h, idx) => row[h] = vals[idx] || '')
      rows.push(row)
    }
  }
  return rows
}

export default function Pardavimai() {
  const [period, setPeriod] = useState('diena')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const fileRef = useRef()

  useEffect(() => { load() }, [period])

  function getFromDate(p) {
    const d = new Date()
    if (p === 'diena') return d.toISOString().split('T')[0]
    if (p === 'savaite') { d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] }
    if (p === 'menuo') { d.setMonth(d.getMonth() - 1); return d.toISOString().split('T')[0] }
    d.setFullYear(d.getFullYear() - 1); return d.toISOString().split('T')[0]
  }

  async function load() {
    setLoading(true)
    const fromDate = getFromDate(period)
    let all = []
    let from = 0
    const batchSize = 1000
    while (true) {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .gte('sale_date', fromDate)
        .not('category', 'in', '("Priedai")')
        .order('sale_datetime', { ascending: false })
        .range(from, from + batchSize - 1)
      if (error || !data || data.length === 0) break
      all = all.concat(data)
      if (data.length < batchSize) break
      from += batchSize
    }
    setData(all)
    setLoading(false)
  }

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)

    const text = await file.text()
    const rows = parseCSV(text)
    const importId = `import_${Date.now()}`

    const toInsert = rows
      .filter(r => !IGNORE_CATEGORIES.includes(r['Patiekalų grupė']))
      .filter(r => r['Patiekalas'] && r['Suma (€)'])
      .map(r => ({
        sale_datetime: r['Data'] ? new Date(r['Data'].replace(' ', 'T')).toISOString() : null,
        sale_date: r['Data'] ? r['Data'].split(' ')[0] : null,
        dish_name: r['Patiekalas'],
        barcode: r['Barkodas'] || null,
        category: r['Patiekalų grupė'] || null,
        dish_type: r['Patiekalo tipas'] || null,
        waiter: r['Padavėjas'] || null,
        quantity: parseInt(r['Kiekis']) || 1,
        amount: parseFloat(r['Suma (€)'].replace(',', '.')) || 0,
        discount: parseFloat(r['Nuolaida (€)'].replace(',', '.')) || 0,
        order_nr: r['Užsakymo nr.'] || null,
        import_id: importId,
      }))

    // Batch insert 500 at a time, skip duplicates
    let inserted = 0
    for (let i = 0; i < toInsert.length; i += 500) {
      const batch = toInsert.slice(i, i + 500)
      const { data: res, error } = await supabase
        .from('sales')
        .upsert(batch, { onConflict: 'order_nr,dish_name,sale_datetime', ignoreDuplicates: true })
      if (!error) inserted += batch.length
    }

    setImportResult({ inserted, total: toInsert.length })
    setImporting(false)
    fileRef.current.value = ''
    load()
  }

  // Statistika
  const totalRevenue = data.reduce((s, r) => s + Number(r.amount), 0)
  const totalItems = data.reduce((s, r) => s + Number(r.quantity), 0)

  // Pagal patiekalą
  const byDish = {}
  for (const r of data) {
    if (!byDish[r.dish_name]) byDish[r.dish_name] = { qty: 0, amount: 0, category: r.category }
    byDish[r.dish_name].qty += Number(r.quantity)
    byDish[r.dish_name].amount += Number(r.amount)
  }
  const topDishes = Object.entries(byDish)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 15)

  // Pagal kategoriją
  const byCategory = {}
  for (const r of data) {
    if (!byCategory[r.category]) byCategory[r.category] = 0
    byCategory[r.category] += Number(r.amount)
  }
  const topCategories = Object.entries(byCategory)
    .map(([cat, amount]) => ({ cat, amount }))
    .sort((a, b) => b.amount - a.amount)

  // Pagal dieną
  const byDate = {}
  for (const r of data) {
    if (!byDate[r.sale_date]) byDate[r.sale_date] = 0
    byDate[r.sale_date] += Number(r.amount)
  }
  const dailyData = Object.entries(byDate)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))
  const maxDay = Math.max(...dailyData.map(d => d.amount), 1)

  // Pagal padavėją
  const byWaiter = {}
  for (const r of data) {
    if (!r.waiter) continue
    if (!byWaiter[r.waiter]) byWaiter[r.waiter] = 0
    byWaiter[r.waiter] += Number(r.amount)
  }
  const topWaiters = Object.entries(byWaiter)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">📊 Pardavimai</h1>
        <button
          onClick={() => fileRef.current.click()}
          disabled={importing}
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-xl transition shadow text-sm disabled:opacity-50"
        >
          {importing ? '⏳ Importuojama...' : '📥 Įkelti CSV'}
        </button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
      </div>

      {/* Import result */}
      {importResult && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-bold text-green-700">Importas sėkmingas!</p>
            <p className="text-sm text-green-600">Įkelta {importResult.inserted} įrašų iš {importResult.total}</p>
          </div>
          <button onClick={() => setImportResult(null)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      {/* Period filter */}
      <div className="flex gap-2">
        {[['diena', 'Šiandien'], ['savaite', 'Savaitė'], ['menuo', 'Mėnuo'], ['metai', 'Metai']].map(([val, label]) => (
          <button key={val} onClick={() => setPeriod(val)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${period === val ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">⏳ Kraunama...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-6xl mb-3">📊</div>
          <p className="font-semibold">Pardavimų duomenų nėra</p>
          <p className="text-sm mt-1">Įkelkite Kitchen Force CSV failą</p>
          <button onClick={() => fileRef.current.click()}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition">
            📥 Įkelti CSV
          </button>
        </div>
      ) : (
        <>
          {/* Suvestinė */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-500 text-white rounded-2xl p-4 text-center">
              <p className="text-green-100 text-xs">Pajamos</p>
              <p className="text-2xl font-black">€{totalRevenue.toFixed(0)}</p>
            </div>
            <div className="bg-green-100 border border-green-200 rounded-2xl p-4 text-center">
              <p className="text-green-700 text-xs">Parduota</p>
              <p className="text-2xl font-black text-green-600">{totalItems}</p>
            </div>
            <div className="bg-green-100 border border-green-200 rounded-2xl p-4 text-center">
              <p className="text-green-700 text-xs">Vid./patiekalas</p>
              <p className="text-2xl font-black text-green-600">
                €{totalItems > 0 ? (totalRevenue / totalItems).toFixed(2) : '0'}
              </p>
            </div>
          </div>

          {/* Dienos grafas */}
          {dailyData.length > 1 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <h3 className="font-bold text-gray-700 mb-3">📈 Dienos pajamos</h3>
              <div className="space-y-1.5">
                {dailyData.map(({ date, amount }) => (
                  <div key={date} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-20 flex-shrink-0">{date.slice(5)}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                      <div className="h-full bg-green-400 rounded-full flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${(amount / maxDay) * 100}%` }}>
                        <span className="text-xs text-white font-bold">€{amount.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top patiekalai */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h3 className="font-bold text-gray-700 mb-3">🏆 Populiariausi patiekalai</h3>
            <div className="space-y-2">
              {topDishes.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="text-sm font-black text-gray-400 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{d.name}</div>
                    <div className="text-xs text-gray-400">{d.category}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-black text-gray-800">€{d.amount.toFixed(0)}</div>
                    <div className="text-xs text-gray-400">{d.qty}x</div>
                  </div>
                  <div className="w-16 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full"
                      style={{ width: `${(d.amount / topDishes[0].amount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagal kategoriją */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h3 className="font-bold text-gray-700 mb-3">📂 Pagal kategoriją</h3>
            <div className="space-y-2">
              {topCategories.map(({ cat, amount }) => (
                <div key={cat} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 flex-1 truncate">{cat}</span>
                  <div className="w-32 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${(amount / topCategories[0].amount) * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-16 text-right">€{amount.toFixed(0)}</span>
                  <span className="text-xs text-gray-400 w-8 text-right">
                    {totalRevenue > 0 ? `${((amount / totalRevenue) * 100).toFixed(0)}%` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pagal padavėją */}
          {topWaiters.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <h3 className="font-bold text-gray-700 mb-3">👤 Pagal padavėją</h3>
              <div className="space-y-2">
                {topWaiters.map(({ name, amount }) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      👤
                    </div>
                    <div className="flex-1 font-semibold text-gray-800">{name}</div>
                    <div className="text-lg font-black text-purple-600">€{amount.toFixed(0)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
