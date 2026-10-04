import { getMonthlyBudgetStats } from '@/actions/budget-actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartPie, faExclamationTriangle, faCheckCircle, faCalendarDay, faEdit } from '@fortawesome/free-solid-svg-icons'
import { BudgetClientView } from '@/components/allowance/BudgetClientView'

export default async function AllowancePage() {
  const stats = await getMonthlyBudgetStats()
  if (!stats) return null

  const isWarning = stats.percentUsed >= 80
  const isDanger = stats.percentUsed >= 100

  return (
    <div className="min-h-screen bg-slate-50 p-4 space-y-6 pb-24">
      <header className="pt-4 pb-2">
        <h1 className="text-xl font-bold text-slate-800">โควตากินใช้รายเดือน</h1>
        <p className="text-sm text-slate-500">จัดการงบประมาณและคุมค่าใช้จ่าย</p>
      </header>

      {/* Overview Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">งบประมาณเดือนนี้</p>
            <div className="flex items-baseline gap-1">
              <h2 className="text-3xl font-bold text-slate-800">฿{stats.monthlyLimit.toLocaleString('th-TH')}</h2>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDanger ? 'bg-red-50 text-red-500' : isWarning ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
            <FontAwesomeIcon icon={faChartPie} className="text-xl" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span className="text-slate-500">ใช้ไปแล้ว ฿{stats.totalUsed.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
            <span className={isDanger ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'}>
              {stats.percentUsed.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(stats.percentUsed, 100)}%` }}
            />
          </div>
        </div>

        {/* Warning Message */}
        {isDanger ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex gap-3 items-start">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mt-0.5" />
            <div>
              <p className="font-bold text-sm">ทะลุงบประมาณแล้ว!</p>
              <p className="text-xs mt-1 opacity-90">คุณใช้เงินเกินโควตาที่ตั้งไว้ โปรดระมัดระวังการใช้จ่าย</p>
            </div>
          </div>
        ) : isWarning ? (
          <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl flex gap-3 items-start">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mt-0.5" />
            <div>
              <p className="font-bold text-sm">งบใกล้หมดแล้ว!</p>
              <p className="text-xs mt-1 opacity-90">คุณใช้เงินไปกว่า 80% ของงบประมาณแล้ว</p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl flex gap-3 items-start">
            <FontAwesomeIcon icon={faCheckCircle} className="mt-0.5" />
            <div>
              <p className="font-bold text-sm">การใช้จ่ายอยู่ในเกณฑ์ดี</p>
              <p className="text-xs mt-1 opacity-90">คุณยังมีงบเหลือเฟือสำหรับเดือนนี้</p>
            </div>
          </div>
        )}
      </div>

      {/* Daily Average Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 shadow-md text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <FontAwesomeIcon icon={faCalendarDay} className="text-6xl" />
        </div>
        <div className="relative z-10">
          <p className="text-slate-300 text-sm font-medium mb-1">งบที่ใช้ได้ต่อวัน (เหลืออีก {stats.daysLeft} วัน)</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold text-emerald-400">฿{stats.dailyAverage.toLocaleString('th-TH', { maximumFractionDigits: 0 })}</h2>
            <span className="text-slate-400 text-sm">/ วัน</span>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            *คำนวณจากยอดคงเหลือ (฿{stats.remaining.toLocaleString('th-TH', { maximumFractionDigits: 0 })}) หารด้วยจำนวนวันที่เหลือในเดือนนี้
          </p>
        </div>
      </div>

      {/* Settings (Client Component) */}
      <BudgetClientView currentLimit={stats.monthlyLimit} />
    </div>
  )
}
