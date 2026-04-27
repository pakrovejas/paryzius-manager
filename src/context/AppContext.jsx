import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isConfigured } from '../lib/supabase'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  async function addXP(amount) {
    if (!profile) return
    const today = new Date().toISOString().split('T')[0]
    const lastActive = profile.last_active_date
    const newStreak = lastActive === today
      ? profile.streak
      : lastActive === getPrevDay(today)
        ? profile.streak + 1
        : 1

    const updated = {
      xp: (profile.xp || 0) + amount,
      streak: newStreak,
      last_active_date: today,
    }

    await supabase.from('profiles').update(updated).eq('id', profile.id)
    setProfile(prev => ({ ...prev, ...updated }))
  }

  function getPrevDay(dateStr) {
    const d = new Date(dateStr)
    d.setDate(d.getDate() - 1)
    return d.toISOString().split('T')[0]
  }

  return (
    <AppContext.Provider value={{ user, profile, loading, addXP, reloadProfile: () => loadProfile(user?.id) }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
