'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faPlus, faBullseye, faPlane, faCar, faHeart, faHome, faGamepad, faGift } from '@fortawesome/free-solid-svg-icons'
import { createGoal, updateGoalAmount } from '@/actions/personal-actions'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'

const ICONS = [
  { id: 'faStar', icon: faStar },
  { id: 'faPlane', icon: faPlane },
  { id: 'faCar', icon: faCar },
  { id: 'faHome', icon: faHome },
  { id: 'faHeart', icon: faHeart },
  { id: 'faGamepad', icon: faGamepad },
  { id: 'faGift', icon: faGift },
]

const COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-indigo-500'
]

export function GoalSection({ goals }: { goals: any[] }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('faStar')
  const [selectedColor, setSelectedColor] = useState('bg-blue-500')
  const [loading, setLoading] = useState(false)

  // Add Money Modal
  const [addMoneyGoalId, setAddMoneyGoalId] = useState<number | null>(null)
  const [addAmount, setAddAmount] = useState('')

  const handleCreate = async () => {
    if (!name || !target) return
    setLoading(true)
    try {
      await createGoal({ name, target_amount: Number(target), icon: selectedIcon, color: selectedColor })
      toast.success('สร้างเป้าหมายสำเร็จ!')
      setShowAddModal(false)
      setName('')
      setTarget('')
    } catch (e: any) {
      toast.error('เกิดข้อผิดพลาด: ' + e.message)
    }
    setLoading(false)
  }

  const handleAddMoney = async () => {
    if (!addMoneyGoalId || !addAmount) return
    setLoading(true)
    try {
      await updateGoalAmount(addMoneyGoalId, Number(addAmount))
      
      const goal = goals.find(g => g.id === addMoneyGoalId)
      if (goal && (Number(goal.current_amount) + Number(addAmount)) >= Number(goal.target_amount)) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
        toast.success(`ยินดีด้วย! คุณถึงเป้าหมาย "${goal.name}" แล้ว! 🎉`, { duration: 5000 })
      } else {
        toast.success('หยอดกระปุกสำเร็จ!')
      }
      
      setAddMoneyGoalId(null)
      setAddAmount('')
    } catch (e: any) {
      toast.error(e.message)
    }
    setLoading(false)
  }

  const getIcon = (id: string) => ICONS.find(i => i.id === id)?.icon || faStar

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          <FontAwesomeIcon icon={faBullseye} className="text-blue-500" /> เป้าหมายของฉัน
        </h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors flex items-center gap-1"
        >
          <FontAwesomeIcon icon={faPlus} /> เพิ่มเป้าหมาย
        </button>
      </div>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center text-slate-400 border border-slate-100 shadow-sm border-dashed">
            ยังไม่มีเป้าหมาย ลองสร้าง "เก็บเงินเที่ยว" ดูสิ!
          </div>
        ) : (
          goals.map(goal => {
            const current = Number(goal.current_amount)
            const target = Number(goal.target_amount)
            const percent = Math.min(100, Math.round((current / target) * 100))
            const isCompleted = current >= target

            return (
              <div key={goal.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden">
                {isCompleted && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">
                    สำเร็จแล้ว! 🎉
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl shadow-md ${goal.color}`}>
                    <FontAwesomeIcon icon={getIcon(goal.icon)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate text-lg">{goal.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      ฿{current.toLocaleString()} <span className="text-slate-300 mx-1">/</span> ฿{target.toLocaleString()}
                    </p>
                  </div>
                  {!isCompleted && (
                    <button 
                      onClick={() => setAddMoneyGoalId(goal.id)}
                      className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-center shrink-0 border border-slate-100"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  )}
                </div>

                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${goal.color}`}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] font-bold text-slate-400">{percent}%</span>
                  <span className="text-[10px] font-bold text-slate-400">เหลืออีก ฿{(target - current > 0 ? target - current : 0).toLocaleString()}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-slate-900/40 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl z-[70] p-6 pb-safe"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-6">สร้างเป้าหมายใหม่</h3>
              
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อเป้าหมาย (เช่น เที่ยวญี่ปุ่น)"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 mb-4 font-medium focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <div className="flex gap-2 mb-6">
                <input
                  type="number"
                  inputMode="numeric"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="จำนวนเงินเป้าหมาย..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-lg focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <span className="flex items-center text-slate-500 font-medium px-2">บาท</span>
              </div>

              <p className="text-xs font-bold text-slate-400 mb-2 uppercase">เลือกไอคอน</p>
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                {ICONS.map(i => (
                  <button 
                    key={i.id}
                    onClick={() => setSelectedIcon(i.id)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shrink-0 transition-colors ${selectedIcon === i.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}
                  >
                    <FontAwesomeIcon icon={i.icon} />
                  </button>
                ))}
              </div>

              <p className="text-xs font-bold text-slate-400 mb-2 uppercase">เลือกสีสัน</p>
              <div className="flex gap-3 mb-8">
                {COLORS.map(c => (
                  <button 
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-8 h-8 rounded-full ${c} ${selectedColor === c ? 'ring-4 ring-offset-2 ring-slate-300' : ''} transition-all`}
                  />
                ))}
              </div>
              
              <button
                onClick={handleCreate}
                disabled={loading || !name || !target}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl disabled:opacity-50"
              >
                สร้างเป้าหมาย
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Money Modal */}
      <AnimatePresence>
        {addMoneyGoalId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddMoneyGoalId(null)}
              className="fixed inset-0 bg-slate-900/60 z-[80] backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-4 right-4 -translate-y-1/2 max-w-sm mx-auto bg-white rounded-3xl z-[90] p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-2">หยอดกระปุก</h3>
              <p className="text-sm text-slate-500 mb-6">ระบุจำนวนเงินที่ต้องการเพิ่มเข้าเป้าหมายนี้</p>
              
              <input
                type="number"
                inputMode="numeric"
                autoFocus
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="จำนวนเงิน..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 mb-6 font-bold text-2xl text-center focus:ring-2 focus:ring-primary/20 outline-none"
              />
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setAddMoneyGoalId(null)}
                  className="flex-1 py-3 rounded-xl font-medium text-slate-500 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleAddMoney}
                  disabled={loading || !addAmount}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark"
                >
                  ยืนยัน
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
