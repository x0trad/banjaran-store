'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        toast.error(data.error || 'Invalid credentials')
      }
    } catch {
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-white text-3xl font-bold tracking-[0.3em] uppercase mb-1">
            banjaran
          </p>
          <p className="text-stone-500 text-xs tracking-widest uppercase">Admin Dashboard</p>
        </div>
        <form onSubmit={handleLogin} className="bg-stone-900 p-6 sm:p-8 rounded-lg space-y-5">
          <div>
            <label className="text-xs text-stone-400 uppercase tracking-widest block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-stone-800 border border-stone-700 px-4 text-sm text-white outline-none focus:border-banjaran-500 transition-colors rounded-md touch-manipulation"
              required
              autoComplete="email"
              inputMode="email"
            />
          </div>
          <div>
            <label className="text-xs text-stone-400 uppercase tracking-widest block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-stone-800 border border-stone-700 px-4 text-sm text-white outline-none focus:border-banjaran-500 transition-colors rounded-md touch-manipulation"
              required
              autoComplete="current-password"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-sm bg-banjaran-700 hover:bg-banjaran-600 touch-manipulation"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  )
}
