'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle, faPen, faCheck, faTimes, faKey } from '@fortawesome/free-solid-svg-icons'
import { updateProfile, updatePassword } from '@/actions/auth-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function ProfileSection({ initialUsername, initialDisplayName }: { initialUsername: string, initialDisplayName: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [loading, setLoading] = useState(false)
  
  // Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const router = useRouter()

  const handleSaveName = async () => {
    if (!displayName.trim()) {
      toast.error('กรุณากรอกชื่อ')
      return
    }
    
    // Confirm dialog before saving
    if (!window.confirm(`ยืนยันการเปลี่ยนชื่อเป็น "${displayName.trim()}" หรือไม่?`)) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('displayName', displayName.trim())
      await updateProfile(formData)
      toast.success('อัปเดตชื่อโปรไฟล์สำเร็จ')
      setIsEditing(false)
      router.refresh()
    } catch (error: any) {
      toast.error('เกิดข้อผิดพลาด', { description: error.message })
    }
    setLoading(false)
  }

  const handleSavePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('รหัสผ่าน (PIN) ต้องมีอย่างน้อย 6 หลัก')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน')
      return
    }
    
    // Confirm dialog for password
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะเปลี่ยนรหัสผ่าน (PIN)?\n(หากลืมจะไม่สามารถกู้คืนได้)')) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('password', newPassword)
      await updatePassword(formData)
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ!')
      setShowPasswordModal(false)
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast.error('เกิดข้อผิดพลาด', { description: error.message })
    }
    setLoading(false)
  }

  return (
    <>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faUserCircle} className="text-4xl" />
          </div>
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800"
                  placeholder="ชื่อแสดงผล..."
                />
                <button 
                  onClick={handleSaveName} 
                  disabled={loading}
                  className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
                <button 
                  onClick={() => { setIsEditing(false); setDisplayName(initialDisplayName) }}
                  disabled={loading}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-800 truncate">{displayName || initialUsername}</h2>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-slate-400 hover:text-primary transition-colors"
                  >
                    <FontAwesomeIcon icon={faPen} className="text-sm" />
                  </button>
                </div>
                <p className="text-sm text-slate-500 truncate">@{initialUsername}</p>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Button */}
        <button 
          onClick={() => setShowPasswordModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-medium py-2.5 rounded-xl transition-colors border border-slate-200"
        >
          <FontAwesomeIcon icon={faKey} />
          เปลี่ยนรหัสผ่าน (PIN)
        </button>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setShowPasswordModal(false)}
              className="fixed inset-0 bg-slate-900/40 z-[60] max-w-md mx-auto backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-4 right-4 -translate-y-1/2 max-w-sm mx-auto bg-white rounded-3xl z-[70] p-6 shadow-2xl"
            >
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                <FontAwesomeIcon icon={faKey} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-1">ตั้งค่ารหัสผ่านใหม่</h3>
              <p className="text-sm text-slate-500 text-center mb-6">กรอก PIN 6 หลักเพื่อใช้ในการเข้าสู่ระบบครั้งหน้า</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">รหัสผ่านใหม่ (PIN)</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 text-center"
                    placeholder="••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 text-center"
                    placeholder="••••••"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  disabled={loading}
                  className="flex-1 bg-slate-100 text-slate-600 font-medium py-3 rounded-xl disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSavePassword}
                  disabled={loading || !newPassword}
                  className="flex-1 bg-primary text-white font-medium py-3 rounded-xl disabled:opacity-50"
                >
                  บันทึกรหัสผ่าน
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
