'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet, faMoneyBillWave, faArrowRightArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 })
  const display = useTransform(spring, (current) => {
    // Format to 2 decimal places with commas
    return Number(current.toFixed(2)).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  })

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span>{display}</motion.span>
}

export function WalletBalanceCard({ balances }: { balances: { main: number, pocket: number } }) {
  return (
    <div className="grid gap-4">
      {/* Main Account */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary to-sky-700 rounded-3xl p-6 shadow-md text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <FontAwesomeIcon icon={faWallet} className="text-8xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-sky-100">
            <FontAwesomeIcon icon={faWallet} />
            <p className="text-sm font-medium">กระเป๋าหลัก (เงินเดือน/รายได้รวม)</p>
          </div>
          <h2 className="text-4xl font-bold mb-1">
            ฿<AnimatedNumber value={balances.main} />
          </h2>
        </div>
      </motion.div>

      {/* Pocket Account & Quick Transfer Status */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-xl" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">กระเป๋าเงินสด (โควตากินใช้)</p>
            <p className="text-xl font-bold text-slate-800">
              ฿<AnimatedNumber value={balances.pocket} />
            </p>
          </div>
        </div>
        <motion.div 
          animate={{ rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="text-slate-300"
        >
          <FontAwesomeIcon icon={faArrowRightArrowLeft} />
        </motion.div>
      </motion.div>
    </div>
  )
}
