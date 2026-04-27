import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { isConfigured } from './lib/supabase'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Sandelis from './pages/Sandelis'
import Islaidos from './pages/Islaidos'
import Pajamos from './pages/Pajamos'
import Meniu from './pages/Meniu'
import Tekejai from './pages/Tekejai'

function AppRoutes() {
  const { user, loading } = useApp()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-gray-500 text-lg">Kraunama...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sandelis" element={<Sandelis />} />
        <Route path="/islaidos" element={<Islaidos />} />
        <Route path="/pajamos" element={<Pajamos />} />
        <Route path="/meniu" element={<Meniu />} />
        <Route path="/tekejai" element={<Tekejai />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}

function SetupScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">🍽️</div>
          <h1 className="text-3xl font-bold text-gray-800">Paryzius Manager</h1>
          <p className="text-gray-500 mt-2">Pirma reikia sukonfigūruoti Supabase</p>
        </div>

        <div className="space-y-4 text-left">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <h2 className="font-bold text-blue-800 mb-2">📋 Nustatymo žingsniai:</h2>
            <ol className="space-y-2 text-sm text-blue-700 list-decimal list-inside">
              <li>Eikite į <strong>supabase.com</strong> → sukurkite naują projektą</li>
              <li>SQL Editor → įklijuokite <code className="bg-blue-100 px-1 rounded">supabase_schema.sql</code> → Run</li>
              <li>Authentication → Users → sukurkite 2 vartotojus</li>
              <li>Project Settings → API → nukopijuokite URL ir anon key</li>
              <li>Atidarykite failą <code className="bg-blue-100 px-1 rounded">.env</code> ir įrašykite reikšmes</li>
            </ol>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 font-mono text-sm">
            <p className="text-gray-500 mb-1"># .env failas:</p>
            <p className="text-green-700">VITE_SUPABASE_URL=<span className="text-orange-500">https://xxxxx.supabase.co</span></p>
            <p className="text-green-700">VITE_SUPABASE_ANON_KEY=<span className="text-orange-500">eyJhbGc...</span></p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm text-amber-700">
            ⚡ Po <code className="bg-amber-100 px-1 rounded">.env</code> pakeitimo — perkraukite serverį: <strong>npm run dev</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  if (!isConfigured) return <SetupScreen />

  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}
