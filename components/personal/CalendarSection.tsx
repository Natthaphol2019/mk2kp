'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarAlt, faPlus, faHeart, faBirthdayCake, faBell, faCar } from '@fortawesome/free-solid-svg-icons'
import { createEvent } from '@/actions/personal-actions'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'

const COLORS = [
  { id: 'bg-pink-500', icon: faHeart, label: 'วันครบรอบ' },
  { id: 'bg-amber-500', icon: faBirthdayCake, label: 'วันเกิด' },
  { id: 'bg-blue-500', icon: faCar, label: 'จ่ายบิล/ค่างวด' },
  { id: 'bg-purple-500', icon: faBell, label: 'แจ้งเตือนอื่นๆ' },
]

export function CalendarSection({ events }: { events: any[] }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [selectedColor, setSelectedColor] = useState('bg-pink-500')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!title || !date) return
    setLoading(true)
    try {
      await createEvent({ title, event_date: date, color: selectedColor })
      toast.success('บันทึกวันสำคัญสำเร็จ!')
      setShowAddModal(false)
      setTitle('')
      setDate('')
    } catch (e: any) {
      toast.error('เกิดข้อผิดพลาด: ' + e.message)
    }
    setLoading(false)
  }

  // Group events by month
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date(new Date().setHours(0,0,0,0)))

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          <FontAwesomeIcon icon={faCalendarAlt} className="text-pink-500" /> วันสำคัญของฉัน
        </h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="text-sm font-bold text-pink-600 bg-pink-50 px-3 py-1.5 rounded-full hover:bg-pink-100 transition-colors flex items-center gap-1"
        >
          <FontAwesomeIcon icon={faPlus} /> เพิ่มวันสำคัญ
        </button>
      </div>

      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
        {upcomingEvents.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            ยังไม่มีวันสำคัญที่ใกล้จะถึง
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map(event => {
              const eDate = new Date(event.event_date)
              const today = new Date()
              const diffTime = Math.abs(eDate.getTime() - today.getTime())
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
              let countdown = `อีก ${diffDays} วัน`
              if (diffDays === 0) countdown = 'วันนี้!'
              else if (diffDays === 1) countdown = 'พรุ่งนี้!'

              const iconDef = COLORS.find(c => c.id === event.color)

              return (
                <div key={event.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${event.color} shadow-sm`}>
                      <FontAwesomeIcon icon={iconDef?.icon || faBell} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-[15px]">{event.title}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {eDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className={`text-xs font-bold px-2.5 py-1 rounded-lg ${diffDays <= 3 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                    {countdown}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
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
              <h3 className="text-lg font-bold text-slate-800 mb-6">บันทึกวันสำคัญ</h3>
              
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ชื่อวันสำคัญ (เช่น วันเกิดแฟน)"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 mb-4 font-medium focus:ring-2 focus:ring-pink-200 outline-none"
              />
              
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 mb-6 font-medium focus:ring-2 focus:ring-pink-200 outline-none text-slate-700"
              />

              <p className="text-xs font-bold text-slate-400 mb-3 uppercase">ประเภท/สีสัน</p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {COLORS.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => setSelectedColor(c.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${selectedColor === c.id ? `border-pink-500 bg-pink-50` : 'border-slate-100 bg-slate-50'}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] ${c.id}`}>
                      <FontAwesomeIcon icon={c.icon} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{c.label}</span>
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleCreate}
                disabled={loading || !title || !date}
                className="w-full bg-slate-800 text-white font-bold py-3.5 rounded-2xl disabled:opacity-50"
              >
                บันทึกวันสำคัญ
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
