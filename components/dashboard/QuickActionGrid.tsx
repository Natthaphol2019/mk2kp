'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUtensils, faGasPump, faArrowDown, faArrowUp, faBriefcase, faPlus, faSpinner, faImage } from '@fortawesome/free-solid-svg-icons'
import { createTransaction } from '@/actions/transaction-actions'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { extractAmountFromSlip } from '@/lib/ocr'

export function QuickActionGrid() {
  const [loading, setLoading] = useState<string | null>(null)
  
  // Drawer state
  const [showDrawer, setShowDrawer] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'income' | 'expense' | 'transfer_pocket' | 'transfer_main'>('expense')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [isPending, setIsPending] = useState(false)
  
  // OCR state
  const [isScanning, setIsScanning] = useState(false)

  const handleScanSlip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsScanning(true)
    try {
      const ocrAmount = await extractAmountFromSlip(file)
      if (ocrAmount !== null) {
        setAmount(ocrAmount.toString())
        toast.success(`AI สแกนยอด ฿${ocrAmount} สำเร็จ!`, { icon: '🤖' })
      } else {
        toast.error('AI หาตัวเลขไม่เจอ กรุณากรอกเองครับ', { icon: '❌' })
      }
    } catch (err: any) {
      toast.error('เกิดข้อผิดพลาดในการอ่านรูป: ' + err.message)
    }
    setIsScanning(false)
  }

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50)
    }
  }

  const triggerConfetti = () => {
    const duration = 2000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22c55e', '#3b82f6', '#fef08a']
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22c55e', '#3b82f6', '#fef08a']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }

  const openDrawer = (mode: 'income' | 'expense' | 'transfer_pocket' | 'transfer_main') => {
    triggerHaptic()
    setDrawerMode(mode)
    setShowDrawer(true)
    setAmount('')
    setNote('')
    setIsPending(false)
  }

  const handleTransaction = async () => {
    const numAmount = Number(amount)
    if (!numAmount || numAmount <= 0) return

    setLoading(drawerMode)
    try {
      let from_account: 'main' | 'pocket' | 'external' = 'main'
      let to_account: 'main' | 'pocket' | 'external' = 'external'
      let category = 'misc'

      if (drawerMode === 'income') {
        from_account = 'external'
        to_account = 'main'
        category = 'income'
      } else if (drawerMode === 'expense') {
        from_account = 'pocket'
        to_account = 'external'
        category = 'expense'
      } else if (drawerMode === 'transfer_pocket') {
        from_account = 'main'
        to_account = 'pocket'
        category = 'transfer'
      } else if (drawerMode === 'transfer_main') {
        from_account = 'pocket'
        to_account = 'main'
        category = 'transfer'
      }

      await createTransaction({
        amount: numAmount,
        from_account,
        to_account,
        category,
        note: note || getModeTitle(drawerMode),
        status: isPending ? 'pending' : 'completed'
      })

      toast.success('บันทึกรายการสำเร็จ', {
        icon: drawerMode === 'income' ? '🎉' : drawerMode === 'transfer_pocket' ? '⬇️' : '💸'
      })

      if (drawerMode === 'income') {
        triggerConfetti()
      }

      setShowDrawer(false)
      setIsPending(false)
      setAmount('')
      setNote('')
    } catch (error: any) {
      toast.error('เกิดข้อผิดพลาด', { description: error.message })
    }
    setLoading(null)
  }

  const handleQuickExpense = async (cat: string, amt: number, label: string) => {
    if (!window.confirm(`ยืนยันการจ่าย ${label} ฿${amt}?`)) return
    triggerHaptic()
    setLoading(cat)
    try {
      await createTransaction({
        amount: amt,
        from_account: 'pocket',
        to_account: 'external',
        category: cat,
        note: label
      })
      toast.success(`บันทึกรายจ่าย ${label} สำเร็จ`, { icon: '🍽️' })
    } catch (error: any) {
      toast.error('เกิดข้อผิดพลาด', { description: error.message })
    }
    setLoading(null)
  }

  const getModeTitle = (mode: string) => {
    switch (mode) {
      case 'income': return 'รับเงินเดือน/รายได้ (เข้า Main)'
      case 'expense': return 'บันทึกรายจ่าย (จ่ายจาก Pocket)'
      case 'transfer_pocket': return 'ถอนมาใช้ (Main -> Pocket)'
      case 'transfer_main': return 'ฝากเงินคืน (Pocket -> Main)'
      default: return 'ทำรายการ'
    }
  }

  return (
    <div>
      <h3 className="font-bold text-slate-800 mb-3 px-1">จัดการเงิน (Actions)</h3>
      
      {/* Main Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => openDrawer('transfer_pocket')}
          className="flex flex-col items-center p-4 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:shadow-md transition-shadow"
        >
          <FontAwesomeIcon icon={faArrowDown} className="text-xl mb-2" />
          <span className="text-sm font-bold">ถอนมาใช้</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => openDrawer('transfer_main')}
          className="flex flex-col items-center p-4 rounded-3xl bg-blue-50 text-blue-600 border border-blue-100 hover:shadow-md transition-shadow"
        >
          <FontAwesomeIcon icon={faArrowUp} className="text-xl mb-2" />
          <span className="text-sm font-bold">ฝากเงินคืน</span>
        </motion.button>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => openDrawer('income')}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-3xl bg-primary text-white font-bold mb-6 shadow-md hover:bg-primary-dark transition-colors"
      >
        <FontAwesomeIcon icon={faBriefcase} />
        บันทึกรับเงินเดือน / รายได้
      </motion.button>

      {/* Quick Expenses */}
      <h3 className="font-bold text-slate-800 mb-3 px-1">รายจ่ายด่วน (หักจาก Pocket)</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleQuickExpense('food', 50, 'ข้าว')}
          disabled={loading !== null}
          className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faUtensils} />
          <span className="text-sm font-bold">ข้าว 50฿</span>
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleQuickExpense('fuel', 100, 'น้ำมัน')}
          disabled={loading !== null}
          className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-100 text-slate-600 border border-slate-200 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faGasPump} />
          <span className="text-sm font-bold">น้ำมัน 100฿</span>
        </motion.button>
      </div>
      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={() => openDrawer('expense')}
        className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 bg-white border border-dashed border-slate-300 rounded-2xl hover:bg-slate-50 transition-colors"
      >
        <FontAwesomeIcon icon={faPlus} className="text-xs" />
        บันทึกรายจ่ายอื่นๆ
      </motion.button>

      {/* Transaction Drawer */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 bg-slate-900/40 z-[60] max-w-md mx-auto backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl z-[70] p-6 pb-safe"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
              
              <h3 className="font-bold text-slate-800 text-lg mb-6">{getModeTitle(drawerMode)}</h3>
              
              <div className="flex gap-3 mb-4">
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="จำนวนเงิน..."
                  autoFocus
                  className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800"
                />
                <span className="flex items-center text-slate-500 font-medium px-2 shrink-0">บาท</span>
              </div>

              {drawerMode === 'expense' && (
                <div className="mb-4">
                  <label className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl cursor-pointer transition-colors border border-indigo-100 shadow-sm text-sm font-bold">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleScanSlip}
                    />
                    {isScanning ? (
                      <span className="flex items-center gap-2"><FontAwesomeIcon icon={faSpinner} spin /> AI กำลังอ่านตัวเลข...</span>
                    ) : (
                      <span className="flex items-center gap-2"><FontAwesomeIcon icon={faImage} /> สแกนสลิปโอนเงิน (Auto-fill)</span>
                    )}
                  </label>
                </div>
              )}

              <div className="mb-6">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="บันทึกช่วยจำ (ตัวเลือก)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {drawerMode === 'transfer_pocket' && (
                <div className="mb-6 flex items-center gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                  <input 
                    type="checkbox" 
                    id="pending-check" 
                    checked={isPending}
                    onChange={(e) => setIsPending(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                  <label htmlFor="pending-check" className="text-sm font-bold text-amber-800 select-none cursor-pointer flex-1">
                    ส่งคำขอเบิกเงินกองกลาง (รอโอนให้)
                  </label>
                </div>
              )}
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleTransaction}
                disabled={!amount || loading !== null}
                className="w-full bg-slate-800 text-white font-medium py-3.5 rounded-2xl disabled:opacity-50 shadow-lg"
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึกรายการ'}
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
