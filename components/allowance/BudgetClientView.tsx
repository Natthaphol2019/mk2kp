'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import { setMonthlyLimit } from '@/actions/budget-actions'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function BudgetClientView({ currentLimit }: { currentLimit: number }) {
  const [isEditing, setIsEditing] = useState(false)
  const [limit, setLimit] = useState(currentLimit.toString())
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    const numLimit = Number(limit)
    if (!numLimit || numLimit <= 0) {
      toast.error('กรุณาระบุจำนวนเงินที่ถูกต้อง')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('limit', numLimit.toString())
      await setMonthlyLimit(formData)
      toast.success('ตั้งค่างบประมาณสำเร็จ')
      setIsEditing(false)
    } catch (error: any) {
      toast.error('เกิดข้อผิดพลาด', { description: error.message })
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800">ตั้งค่างบประมาณ (รายเดือน)</h3>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
          >
            <FontAwesomeIcon icon={faEdit} /> แก้ไข
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="flex gap-3">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                autoFocus
                className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800"
                placeholder="เช่น 9000"
              />
              <span className="flex items-center text-slate-500 font-medium px-2 shrink-0">บาท</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-emerald-50 text-emerald-600 font-medium py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faCheck} /> บันทึก
              </button>
              <button
                onClick={() => { setIsEditing(false); setLimit(currentLimit.toString()) }}
                disabled={loading}
                className="flex-1 bg-slate-100 text-slate-600 font-medium py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faTimes} /> ยกเลิก
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100"
          >
            <p className="text-sm text-slate-500 mb-1">งบเป้าหมายปัจจุบัน</p>
            <p className="text-2xl font-bold text-slate-800">฿{currentLimit.toLocaleString('th-TH')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
