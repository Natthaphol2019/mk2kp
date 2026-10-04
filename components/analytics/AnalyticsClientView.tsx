'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb, faArrowRight, faArrowLeft, faChartSimple, faUtensils, faGasPump, faReceipt, faMoneyBillWave, faTrophy } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const COLORS = ['#0284c7', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6']

const getCategoryIcon = (name: string) => {
  if (name.includes('อาหาร')) return faUtensils
  if (name.includes('น้ำมัน')) return faGasPump
  if (name.includes('รายรับ')) return faMoneyBillWave
  return faReceipt
}

export function AnalyticsClientView({ data, offset }: { data: any, offset: number }) {
  const router = useRouter()

  const navigateMonth = (diff: number) => {
    router.push(`/analytics?offset=${offset + diff}`)
  }

  const { monthName, totalExpense, totalIncome, prevTotalExpense, categoryData, trendData, insightMessage, insightType, mostFrequent, totalTxCount } = data

  const isGood = insightType === 'good'
  const isWarning = insightType === 'warning'

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Month Navigator */}
      <motion.div variants={itemVariants} className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <button onClick={() => navigateMonth(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-600 transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div className="text-center">
          <h2 className="font-bold text-slate-800 text-lg">{monthName}</h2>
          {offset === 0 && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">เดือนปัจจุบัน</span>}
        </div>
        <button onClick={() => navigateMonth(1)} disabled={offset >= 0} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-30">
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </motion.div>

      {/* AI Insight Box */}
      <motion.div variants={itemVariants} className={`rounded-3xl p-5 border shadow-sm ${isGood ? 'bg-emerald-50 border-emerald-100' : isWarning ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}>
        <div className="flex items-start gap-3">
          <motion.div 
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ duration: 1, delay: 0.5 }}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isGood ? 'bg-emerald-100 text-emerald-600' : isWarning ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}
          >
            <FontAwesomeIcon icon={faLightbulb} className="text-xl" />
          </motion.div>
          <div>
            <h3 className={`font-bold text-sm mb-1 ${isGood ? 'text-emerald-800' : isWarning ? 'text-amber-800' : 'text-blue-800'}`}>
              Insight อัจฉริยะ
            </h3>
            <p className={`text-xs leading-relaxed ${isGood ? 'text-emerald-700' : isWarning ? 'text-amber-700' : 'text-blue-700'}`}>
              {insightMessage}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-50 rounded-full opacity-50"></div>
          <p className="text-xs text-slate-500 mb-1 font-medium relative z-10">รายจ่ายรวม (Expense)</p>
          <p className="text-2xl font-bold text-red-500 relative z-10">฿{totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full opacity-50"></div>
          <p className="text-xs text-slate-500 mb-1 font-medium relative z-10">รายรับรวม (Income)</p>
          <p className="text-2xl font-bold text-emerald-500 relative z-10">฿{totalIncome.toLocaleString()}</p>
        </div>
      </motion.div>

      {/* Frequency & Top Category */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-xl">
            <FontAwesomeIcon icon={faTrophy} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium mb-0.5">จ่ายบ่อยที่สุด (Top Frequent)</p>
            <p className="font-bold text-slate-800">{mostFrequent.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-600">{mostFrequent.count}</p>
          <p className="text-[10px] text-slate-400 font-medium">ครั้งในเดือนนี้</p>
        </div>
      </motion.div>

      {/* Category Chart */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800">สัดส่วนค่าใช้จ่าย</h3>
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-lg font-bold">{totalTxCount} รายการ</span>
        </div>

        {categoryData.length > 0 ? (
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                  animationBegin={200}
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => `฿${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend inside the donut or below */}
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center bg-slate-50 rounded-2xl mb-4">
            <p className="text-sm text-slate-400">ยังไม่มีรายการใช้จ่ายในเดือนนี้</p>
          </div>
        )}

        {/* Custom Legend List with Icons */}
        {categoryData.length > 0 && (
          <div className="mt-4 space-y-3">
            {categoryData.map((cat: any, index: number) => (
              <div key={cat.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                    <FontAwesomeIcon icon={getCategoryIcon(cat.name)} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-700">{cat.name}</p>
                    <p className="text-[10px] text-slate-400">{cat.count} รายการ</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-slate-800">฿{cat.value.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-slate-400">{Math.round((cat.value / totalExpense) * 100)}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Trend Chart (Income vs Expense) */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <FontAwesomeIcon icon={faChartSimple} className="text-indigo-500" />
          แนวโน้มย้อนหลัง 6 เดือน
        </h3>
        {trendData && trendData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `฿${val >= 1000 ? val/1000 + 'k' : val}`} />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value: number, name: string) => [
                    `฿${value.toLocaleString()}`, 
                    name === 'income' ? 'รายรับ' : 'รายจ่าย'
                  ]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} formatter={(val) => val === 'income' ? 'รายรับ' : 'รายจ่าย'} />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={1500} />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center bg-slate-50 rounded-2xl">
            <p className="text-sm text-slate-400">ไม่มีข้อมูลแนวโน้มย้อนหลัง</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
