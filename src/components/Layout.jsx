import { NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getLevelForXP, getXPProgress, getNextLevel } from '../lib/gamification'
import { supabase } from '../lib/supabase'

const NAV_ITEMS = [
  { path: '/', label: 'Pradžia', emoji: '🏠' },
  { path: '/pardavimai', label: 'Pardavimai', emoji: '📊' },
  { path: '/sandelis', label: 'Sandėlis', emoji: '📦' },
  { path: '/islaidos', label: 'Išlaidos', emoji: '💸' },
  { path: '/meniu', label: 'Meniu', emoji: '🍽️' },
  { path: '/tekejai', label: 'Tiekėjai', emoji: '🚚' },
]

export default function Layout({ children }) {
  const { profile } = useApp()
  const xp = profile?.xp || 0
  const streak = profile?.streak || 0
  const level = getLevelForXP(xp)
  const progress = getXPProgress(xp)
  const nextLevel = getNextLevel(xp)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <span className="font-bold text-gray-800 text-lg">Paryzius</span>
        </div>

        {/* XP bar */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full">
            <span className="text-lg">{level.emoji}</span>
            <div>
              <div className="text-xs font-semibold text-orange-700">{level.name} · Lv.{level.level}</div>
              <div className="w-24 h-1.5 bg-orange-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <span className="text-xs font-bold text-orange-600">{xp} XP</span>
          </div>

          <div className="flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-full">
            <span className="text-lg">🔥</span>
            <span className="font-bold text-red-500">{streak}</span>
          </div>

          <button
            onClick={() => supabase.auth.signOut()}
            className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1 rounded-lg hover:bg-gray-100 transition"
          >
            Išeiti
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="bg-white border-t border-gray-200 sticky bottom-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-around">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-3 text-xs font-medium transition ${
                  isActive ? 'text-amber-600' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`text-2xl mb-0.5 ${isActive ? 'scale-110' : ''} transition-transform`}>
                    {item.emoji}
                  </span>
                  <span className={isActive ? 'text-amber-600' : ''}>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
