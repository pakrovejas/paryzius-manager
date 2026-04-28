import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import { getLevelForXP, getXPProgress, getNextLevel } from '../lib/gamification'

function fmtEur(n) {
  if (Math.abs(n) >= 1000) return `€${(n / 1000).toFixed(1)}k`
  return `€${n.toFixed(0)}`
}

export default function Dashboard() {
  const { profile } = useApp()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const xp = profile?.xp || 0
  const level = getLevelForXP(xp)
  const progress = getXPProgress(xp)
  const nextLevel = getNextLevel(xp)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const now = new Date()
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const yearStart = `${now.getFullYear()}-01-01`
    const today = now.toISOString().split('T')[0]

    const [salesRes, expRes, fixedRes, invRes, salesYearRes] = await Promise.all([
      // Šio mėnesio pardavimai (Kitchen Force)
      supabase.from('sales').select('amount, dish_name, category').gte('sale_date', monthStart),
      // Šio mėnesio kintamos išlaidos
      supabase.from('expenses').select('amount').gte('date', monthStart),
      // Fiksuotos išlaidos (mėnesio suma)
      supabase.from('fixed_expenses').select('amount, frequency'),
      // Sandėlis
      supabase.from('inventory').select('quantity, min_quantity, name, unit_cost'),
      // Metų pardavimai (6 mėnesių grafas)
      supabase.from('sales').select('sale_date, amount').gte('sale_date', yearStart),
    ])

    // Mėnesio pajamos
    const monthlySales = (salesRes.data || []).reduce((s, r) => s + Number(r.amount), 0)

    // Mėnesio kintamos išlaidos
    const varExpenses = (expRes.data || []).reduce((s, r) => s + Number(r.amount), 0)

    // Fiksuotos išlaidos → mėnesio ekvivalentas ('yearly' arba 'monthly')
    const fixedMonthly = (fixedRes.data || []).reduce((s, r) => {
      const amt = Number(r.amount)
      return s + (r.frequency === 'yearly' ? amt / 12 : amt)
    }, 0)

    const totalExpenses = varExpenses + fixedMonthly
    const profit = monthlySales - totalExpenses
    const margin = monthlySales > 0 ? (profit / monthlySales) * 100 : 0

    // Sandėlis
    const inv = invRes.data || []
    const lowStock = inv.filter(i => Number(i.quantity) <= Number(i.min_quantity) && Number(i.min_quantity) > 0).length
    const missingPrice = inv.filter(i => !Number(i.unit_cost) && i.category !== 'Receptūra').length

    // Top patiekalas šį mėnesį
    const byDish = {}
    for (const r of salesRes.data || []) {
      byDish[r.dish_name] = (byDish[r.dish_name] || 0) + Number(r.amount)
    }
    const topDish = Object.entries(byDish).sort((a, b) => b[1] - a[1])[0]

    // 6 mėnesių grafikas
    const byMonth = {}
    for (const r of salesYearRes.data || []) {
      const m = r.sale_date?.slice(0, 7)
      if (m) byMonth[m] = (byMonth[m] || 0) + Number(r.amount)
    }
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('lt-LT', { month: 'short' })
      months.push({ key, label, amount: byMonth[key] || 0 })
    }
    const maxMonth = Math.max(...months.map(m => m.amount), 1)

    setData({ monthlySales, varExpenses, fixedMonthly, totalExpenses, profit, margin, lowStock, missingPrice, topDish, months })
    setLoading(false)
  }

  if (loading) return <div className="text-center py-16 text-gray-400">⏳ Kraunama...</div>

  const { monthlySales, varExpenses, fixedMonthly, totalExpenses, profit, margin, lowStock, missingPrice, topDish, months } = data
  const monthName = new Date().toLocaleDateString('lt-LT', { month: 'long' })

  return (
    <div className="space-y-4">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Sveiki, {profile?.name || 'Šefe'}! 👋</h1>
        <p className="text-gray-400 text-sm">{new Date().toLocaleDateString('lt-LT', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* P&L kortelė */}
      <div className={`rounded-3xl p-5 text-white shadow-lg ${profit >= 0 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
        <p className="text-white/70 text-sm font-medium uppercase tracking-wide">{monthName} — pelnas / nuostolis</p>
        <p className="text-4xl font-black mt-1">{profit >= 0 ? '+' : ''}{fmtEur(profit)}</p>
        <p className="text-white/80 text-sm mt-1">
          {margin >= 0 ? `${margin.toFixed(1)}% marža` : `${Math.abs(margin).toFixed(1)}% nuostolis`}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/20 rounded-2xl p-3">
            <p className="text-white/70 text-xs">📈 Pardavimai</p>
            <p className="text-xl font-black">{fmtEur(monthlySales)}</p>
          </div>
          <div className="bg-white/20 rounded-2xl p-3">
            <p className="text-white/70 text-xs">💸 Išlaidos</p>
            <p className="text-xl font-black">{fmtEur(totalExpenses)}</p>
            <p className="text-white/60 text-xs">{fmtEur(varExpenses)} kint. + {fmtEur(fixedMonthly)} fiksuotų</p>
          </div>
        </div>
      </div>

      {/* 6 mėnesių grafikas */}
      {months.some(m => m.amount > 0) && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h3 className="font-bold text-gray-700 mb-3">📈 Pardavimai per 6 mėnesius</h3>
          <div className="flex items-end gap-2 h-24">
            {months.map(m => {
              const maxMonth = Math.max(...months.map(x => x.amount), 1)
              const h = Math.max((m.amount / maxMonth) * 100, m.amount > 0 ? 8 : 2)
              const isCurrent = m.key === new Date().toISOString().slice(0, 7)
              return (
                <div key={m.key} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-400">{m.amount > 0 ? fmtEur(m.amount) : ''}</span>
                  <div className="w-full flex items-end justify-center" style={{ height: '64px' }}>
                    <div
                      className={`w-full rounded-t-lg transition-all ${isCurrent ? 'bg-green-500' : 'bg-green-200'}`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isCurrent ? 'text-green-600' : 'text-gray-400'}`}>{m.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Išlaidų skaidymas */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <h3 className="font-bold text-gray-700 mb-3">💸 Išlaidų skaidymas ({monthName})</h3>
        <div className="space-y-2">
          {[
            { label: 'Fiksuotos (atlyginimai, nuoma...)', amount: fixedMonthly, color: 'bg-red-400' },
            { label: 'Kintamos (tiekėjai, kita)', amount: varExpenses, color: 'bg-orange-400' },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-44 flex-shrink-0">{row.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full ${row.color} rounded-full`}
                  style={{ width: totalExpenses > 0 ? `${(row.amount / totalExpenses) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-sm font-bold text-gray-700 w-16 text-right">{fmtEur(row.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top patiekalas */}
      {topDish && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-3xl">🏆</span>
          <div>
            <p className="text-xs text-yellow-700 font-medium">Populiariausias šį mėnesį</p>
            <p className="font-black text-gray-800">{topDish[0]}</p>
          </div>
          <span className="ml-auto font-black text-yellow-700">{fmtEur(topDish[1])}</span>
        </div>
      )}

      {/* Įspėjimai */}
      <div className="space-y-2">
        {lowStock > 0 && (
          <div onClick={() => navigate('/sandelis')} className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:bg-red-100 transition">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="font-bold text-red-700 text-sm">{lowStock} produktas baigiasi sandėlyje</p>
              <p className="text-red-500 text-xs">Papildyk sandėlį</p>
            </div>
            <span className="text-red-400">→</span>
          </div>
        )}
        {missingPrice > 0 && (
          <div onClick={() => navigate('/sandelis?filter=noprice')} className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:bg-orange-100 transition">
            <span className="text-2xl">💰</span>
            <div className="flex-1">
              <p className="font-bold text-orange-700 text-sm">{missingPrice} produktų trūksta kainos</p>
              <p className="text-orange-500 text-xs">Įvesk kainas → tikslesnis food cost</p>
            </div>
            <span className="text-orange-400">→</span>
          </div>
        )}
      </div>

      {/* XP + streak kompaktiškai */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-3 text-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold">{level.emoji} {level.name}</span>
            <span className="text-xs bg-white/30 px-2 py-0.5 rounded-full">Lv.{level.level}</span>
          </div>
          <div className="bg-white/30 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-amber-100 mt-1">{xp} XP {nextLevel ? `· dar ${nextLevel.minXP - xp} iki kito` : ''}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-3 flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="text-2xl font-black text-orange-500">{profile?.streak || 0}</p>
            <p className="text-xs text-gray-500">dienų iš eilės</p>
          </div>
        </div>
      </div>

    </div>
  )
}
