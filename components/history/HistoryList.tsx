'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDown, faArrowUp, faUtensils, faGasPump, faMoneyBillWave, faRightLeft, faTimes, faReceipt } from '@fortawesome/free-solid-svg-icons'
import { AnimatePresence, motion } from 'framer-motion'

export function HistoryList({ transactions }: { transactions: any[] }) {
  const [viewSlip, setViewSlip] = useState<string | null>(null)

  const getTransactionDetails = (tx: any) => {
    if (tx.from_account === 'external' && tx.to_account === 'main') {
      return { icon: faMoneyBillWave, color: 'text-emerald-500 bg-emerald-100', title: 'รับเงินเดือน/รายได้', sign: '+' }
    }
    if (tx.from_account === 'pocket' && tx.to_account === 'external') {
      let icon = faUtensils
      if (tx.category === 'fuel') icon = faGasPump
      return { icon, color: 'text-orange-500 bg-orange-100', title: 'จ่ายเงินสด (Pocket)', sign: '-' }
    }
    if (tx.from_account === 'main' && tx.to_account === 'pocket') {
      return { icon: faArrowDown, color: 'text-blue-500 bg-blue-100', title: 'ถอนมาใช้', sign: '' }
    }
    if (tx.from_account === 'pocket' && tx.to_account === 'main') {
      return { icon: faArrowUp, color: 'text-indigo-500 bg-indigo-100', title: 'ฝากเงินคืน', sign: '' }
    }
    return { icon: faRightLeft, color: 'text-slate-500 bg-slate-200', title: 'ทำรายการ', sign: '' }
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce((acc: any, tx: any) => {
    const date = new Date(tx.created_at)
    const dateKey = date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(tx)
    return acc
  }, {})

  const groupKeys = Object.keys(groupedTransactions)

  return (
    <div className="space-y-6">
      {groupKeys.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center text-slate-500 shadow-sm border border-slate-100">
          ยังไม่มีประวัติการทำรายการ
        </div>
      ) : (
        groupKeys.map((dateKey) => (
          <div key={dateKey}>
            <h3 className="text-sm font-bold text-slate-500 mb-3 ml-2 sticky top-4 z-10 bg-slate-50/80 backdrop-blur-sm inline-block px-3 py-1 rounded-full">
              {dateKey}
            </h3>
            
            <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 flex flex-col gap-1">
              {groupedTransactions[dateKey].map((tx: any) => {
                const details = getTransactionDetails(tx)
                const date = new Date(tx.created_at)
                
                return (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${details.color}`}>
                        <FontAwesomeIcon icon={details.icon} className="text-xl" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 flex items-center gap-2 text-[15px]">
                          {details.title}
                          {tx.slip_url && (
                            <button 
                              onClick={() => setViewSlip(tx.slip_url)}
                              className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg flex items-center gap-1.5 hover:bg-indigo-100 transition-colors font-medium border border-indigo-100 shadow-sm"
                            >
                              <FontAwesomeIcon icon={faReceipt} /> ดูสลิป
                            </button>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-500 font-medium">
                            {tx.note || tx.category} 
                          </p>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <p className="text-xs text-slate-400">
                            {date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {tx.creator_name && (
                          <div className="mt-1">
                            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500 border border-slate-200">
                              ทำรายการโดย {tx.creator_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`font-bold text-lg pr-2 tracking-tight ${details.sign === '+' ? 'text-emerald-500' : details.sign === '-' ? 'text-slate-800' : 'text-blue-600'}`}>
                      {details.sign}฿{Number(tx.amount).toLocaleString('th-TH')}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}

      {/* Slip Image Viewer Modal */}
      <AnimatePresence>
        {viewSlip && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewSlip(null)}
              className="fixed inset-0 bg-slate-900/80 z-[80] backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: '-50%', x: '-50%' }}
              animate={{ scale: 1, opacity: 1, y: '-50%', x: '-50%' }}
              exit={{ scale: 0.95, opacity: 0, y: '-50%', x: '-50%' }}
              className="fixed top-1/2 left-1/2 w-[90%] max-w-sm max-h-[85vh] z-[90] flex flex-col items-center"
            >
              <button 
                onClick={() => setViewSlip(null)}
                className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
              
              <img 
                src={viewSlip} 
                alt="Slip" 
                className="w-full object-contain rounded-2xl shadow-2xl bg-white"
                style={{ maxHeight: 'calc(85vh - 60px)' }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
