import { getRecentTransactions } from '@/actions/transaction-actions'
import { HistoryList } from '@/components/history/HistoryList'

export default async function HistoryPage() {
  const transactions = await getRecentTransactions(50)

  // Filter out pending transactions, or keep them if you want.
  // We'll filter out pending so history only shows completed.
  const completedTransactions = transactions.filter((tx: any) => tx.status === 'completed')

  return (
    <div className="min-h-screen bg-slate-50 p-4 space-y-6 pb-24">
      <header className="pt-4 pb-2">
        <h1 className="text-xl font-bold text-slate-800">ประวัติการทำรายการ</h1>
        <p className="text-sm text-slate-500">ตรวจสอบรายจ่ายและสลิปย้อนหลังได้ที่นี่</p>
      </header>
      
      <HistoryList transactions={completedTransactions} />
    </div>
  )
}
