'use client'

import { useState, useEffect } from 'react'
import { login } from '@/actions/auth-actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet, faUserCircle, faArrowRight, faTimes } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

export default function LoginPage() {
  const [savedUsername, setSavedUsername] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('rider_wallet_username')
    if (stored) {
      setSavedUsername(stored)
      setUsername(stored)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)

    localStorage.setItem('rider_wallet_username', username)
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error === 'Invalid login credentials' ? 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' : result.error)
      setLoading(false)
    } else {
      localStorage.setItem('rider_wallet_username', username)
      // Redirect happens in server action
    }
  }

  const handleClearSaved = () => {
    localStorage.removeItem('rider_wallet_username')
    setSavedUsername(null)
    setUsername('')
    setPassword('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faWallet} className="text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Rider Wallet</h1>
          <p className="text-slate-500 text-sm mt-1">จัดการเงินงานและเงินส่วนตัว</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center">
              {error}
            </div>
          )}

          {savedUsername ? (
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-3 overflow-hidden">
                <FontAwesomeIcon icon={faUserCircle} className="text-slate-400 text-2xl" />
                <div className="truncate">
                  <p className="text-xs text-slate-400">เข้าสู่ระบบด้วย</p>
                  <p className="text-sm font-medium text-slate-700 truncate">{savedUsername}</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={handleClearSaved}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้ (Username)</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="rider01"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน (PIN)</label>
            <input
              type="password"
              required
              inputMode="numeric"
              pattern="[0-9]*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors tracking-widest text-lg"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-sky-700 text-white font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-6"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : (
              <>
                เข้าสู่ระบบ <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
              </>
            )}
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-500 mt-6">
          ยังไม่มีบัญชีใช่ไหม?{' '}
          <Link href="/register" className="text-primary font-medium hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  )
}
