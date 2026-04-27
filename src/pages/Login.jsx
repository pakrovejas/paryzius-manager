import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Neteisingas el. paštas arba slaptažodis')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🍽️</div>
          <h1 className="text-3xl font-bold text-gray-800">Paryzius</h1>
          <p className="text-gray-500 mt-1">Restorano valdymo sistema</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">El. paštas</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vardas@gmail.com"
              required
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-amber-400 focus:outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Slaptažodis</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-amber-400 focus:outline-none transition"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-500 text-white font-bold text-xl py-4 rounded-xl transition shadow-md disabled:opacity-50"
          >
            {loading ? '⏳ Jungiamasi...' : '🚀 Prisijungti'}
          </button>
        </form>
      </div>
    </div>
  )
}
