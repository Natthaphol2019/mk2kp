'use client'

import { useState } from 'react'
import { register } from '@/actions/auth-actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate username (no spaces or special chars to avoid email format issues)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('ชื่อผู้ใช้ต้องเป็นตัวอักษรภาษาอังกฤษ, ตัวเลข หรือ _ เท่านั้น')
      return
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      return
    }

    if (password.length < 6) {
      setError('รหัสผ่าน (PIN) ต้องมีอย่างน้อย 6 ตัว')
      return
    }

    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)

    const result = await register(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      localStorage.setItem('rider_wallet_username', username)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faWallet} className="text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">สร้างบัญชีใหม่</h1>
          <p className="text-slate-500 text-sm mt-1">เริ่มต้นจัดการเงินของคุณ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center">
              {error}
            </div>
          )}

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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน (PIN 6 หลัก)</label>
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ยืนยันรหัสผ่าน (PIN)</label>
            <input
              type="password"
              required
              inputMode="numeric"
              pattern="[0-9]*"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors tracking-widest text-lg"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-sky-700 text-white font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-6"
          >
            {loading ? 'กำลังสมัครสมาชิก...' : (
              <>
                สมัครสมาชิก <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  )
}
