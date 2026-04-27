import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import { getLevelForXP, getXPProgress, getNextLevel, getStreakMessage } from '../lib/gamification'

const QUICK_LINKS = [
  { path: '/sandelis', emoji: '📦', label: 'Sandėlis', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { path: '/islaidos', emoji: '💸', label: 'Išlaidos', color: 'bg-red-50 border-red-200 hover:bg-red-100' },
  { path: '/pajamos', emoji: '💰', label: 'Pajamos', color: 'bg-green-50 border-green-200 hover:bg-green-100' },
  { path: '/meniu', emoji: '🍽️', label: 'Meniu', color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
  { path: '/tekejai', emoji: '🚚', label: 'Tiekėjai', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
]

export default function Dashboard() {
  const { profile } = useApp()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ todayRevenue: 0, todayExpenses: 0, lowStock: 0 })

  const xp = profile?.xp || 0
  const streak = profile?.streak || 0
  const level = getLevelForXP(xp)
  const nextLevel = getNextLevel(xp)
  const progress = getXPProgress(xp)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const today = new Date().toISOString().split('T')[0]

    const [revRes, expRes, invRes] = await Promise.all([
      supabase.from('revenue').select('amount').gte('date', today),
      supabase.from('expenses').select('amount').gte('date', today),
      supabase.from('inventory').select('quantity, min_quantity').lte('quantity', supabase.rpc),
    ])

    const todayRevenue = (revRes.data || []).reduce((s, r) => s + Number(r.amount), 0)
    const todayExpenses = (expRes.data || []).reduce((s, r) => s + Number(r.amount), 0)

    // Low stock: items where quantity <= min_quantity
    const { data: invData } = await supabase.from('inventory').select('quantity, min_quantity')
    const lowStock = (invData || []).filter(i => Number(i.quantity) <= Number(i.min_quantity)).length

    setStats({ todayRevenue, todayExpenses, lowStock })
  }

  const profit = stats.todayRevenue - stats.todayExpenses

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Sveiki, {profile?.name || 'Šefe'}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('lt-LT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Level / XP card */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-amber-100 text-sm font-medium">Jūsų lygis</p>
            <p className="text-2xl font-bold">{level.emoji} {level.name}</p>
            <p className="text-amber-100 text-sm">{xp} XP surinkta</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black">{level.level}</div>
            <div className="text-amber-100 text-xs">lygis</div>
          </div>
        </div>
        <div className="bg-amber-300/40 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {nextLevel && (
          <p className="text-amber-100 text-xs mt-1 text-right">
            {nextLevel.minXP - xp} XP iki „{nextLevel.name}"
          </p>
        )}
      </div>

      {/* Streak */}
      <div className="bg-white rounded-2xl border-2 border-orange-100 p-4 flex items-center gap-4">
        <div className="text-5xl">🔥</div>
        <div>
          <p className="text-2xl font-black text-orange-500">{streak} {streak === 1 ? 'diena' : streak < 10 ? 'dienos' : 'dienų'}</p>
          <p className="text-gray-500 text-sm">{getStreakMessage(streak)}</p>
        </div>
      </div>

      {/* Today stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-green-600">€{stats.todayRevenue.toFixed(0)}</p>
          <p className="text-xs text-green-700 font-medium mt-1">💰 Pajamos šiandien</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-red-500">€{stats.todayExpenses.toFixed(0)}</p>
          <p className="text-xs text-red-600 font-medium mt-1">💸 Išlaidos šiandien</p>
        </div>
        <div className={`border rounded-2xl p-4 text-center ${profit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
          <p className={`text-2xl font-black ${profit >= 0 ? 'text-blue-600' : 'text-gray-500'}`}>
            €{profit.toFixed(0)}
          </p>
          <p className={`text-xs font-medium mt-1 ${profit >= 0 ? 'text-blue-700' : 'text-gray-500'}`}>
            📊 Pelnas šiandien
          </p>
        </div>
      </div>

      {/* Low stock alert */}
      {stats.lowStock > 0 && (
        <div
          onClick={() => navigate('/sandelis')}
          className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-red-100 transition"
        >
          <span className="text-3xl">⚠️</span>
          <div>
            <p className="font-bold text-red-700">{stats.lowStock} produktas(-ų) baigiasi!</p>
            <p className="text-red-500 text-sm">Spustelėk norėdamas papildyti sandėlį</p>
          </div>
          <span className="ml-auto text-red-400 text-xl">→</span>
        </div>
      )}

      {/* Quick links */}
      <div>
        <h2 className="font-bold text-gray-700 mb-3">Greita prieiga</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK_LINKS.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`${item.color} border-2 rounded-2xl p-4 text-center transition font-semibold text-gray-700`}
            >
              <div className="text-4xl mb-1">{item.emoji}</div>
              <div>{item.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
