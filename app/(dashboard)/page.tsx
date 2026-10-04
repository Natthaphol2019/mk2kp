import { WalletBalanceCard } from '@/components/dashboard/WalletBalanceCard'
import { QuickActionGrid } from '@/components/dashboard/QuickActionGrid'
import { getWalletBalances, getPendingTransactions } from '@/actions/transaction-actions'
import { PendingRequests } from '@/components/dashboard/PendingRequests'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const balances = await getWalletBalances()
  const pendingRequests = await getPendingTransactions()

  return (
    <div className="min-h-screen bg-slate-50 p-4 space-y-6 pb-24">
      <header className="pt-4 pb-2">
        <h1 className="text-xl font-bold text-slate-800">กระเป๋าเงินของคุณ</h1>
        <p className="text-sm text-slate-500">{new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>
      
      <WalletBalanceCard balances={balances} />
      <PendingRequests requests={pendingRequests} currentUserId={user?.id || ''} />
      <QuickActionGrid />
    </div>
  )
}
