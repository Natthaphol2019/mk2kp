'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureWorkspace } from './workspace-actions'

export async function getAnalyticsData(monthOffset = 0) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const workspace_id = await ensureWorkspace()
  if (!workspace_id) return null

  // Calculate date ranges
  const now = new Date()
  
  // Current selected month
  const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString()
  const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59).toISOString()

  // Previous month (for comparison)
  const prevDate = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, 1)
  const startOfPrevMonth = new Date(prevDate.getFullYear(), prevDate.getMonth(), 1).toISOString()
  const endOfPrevMonth = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0, 23, 59, 59).toISOString()

  // Fetch this month's transactions
  const { data: currentTxs } = await supabase
    .from('transactions')
    .select('amount, category, from_account, to_account')
    .eq('workspace_id', workspace_id)
    .gte('created_at', startOfMonth)
    .lte('created_at', endOfMonth)

  // Fetch last month's transactions for comparison
  const { data: prevTxs } = await supabase
    .from('transactions')
    .select('amount, category')
    .eq('workspace_id', workspace_id)
    .gte('created_at', startOfPrevMonth)
    .lte('created_at', endOfPrevMonth)

  const currentExpenses = currentTxs?.filter(t => ['expense', 'food', 'fuel'].includes(t.category)) || []
  const currentIncomes = currentTxs?.filter(t => t.category === 'income') || []
  const prevExpenses = prevTxs?.filter(t => ['expense', 'food', 'fuel'].includes(t.category)) || []

  const totalExpense = currentExpenses.reduce((sum, t) => sum + Number(t.amount), 0)
  const totalIncome = currentIncomes.reduce((sum, t) => sum + Number(t.amount), 0)
  const prevTotalExpense = prevExpenses.reduce((sum, t) => sum + Number(t.amount), 0)

  // Fetch last 6 months trend
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()
  const { data: allTxs } = await supabase
    .from('transactions')
    .select('amount, category, created_at')
    .eq('workspace_id', workspace_id)
    .gte('created_at', sixMonthsAgo)

  const trendMap: Record<string, { income: number, expense: number }> = {}
  
  // Initialize last 6 months with 0
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = d.toLocaleDateString('th-TH', { month: 'short' })
    trendMap[monthKey] = { income: 0, expense: 0 }
  }

  if (allTxs) {
    allTxs.forEach(t => {
      const d = new Date(t.created_at)
      const monthKey = d.toLocaleDateString('th-TH', { month: 'short' })
      if (trendMap[monthKey] !== undefined) {
        if (t.category === 'income') {
          trendMap[monthKey].income += Number(t.amount)
        } else if (['expense', 'food', 'fuel'].includes(t.category)) {
          trendMap[monthKey].expense += Number(t.amount)
        }
      }
    })
  }

  const trendData = Object.keys(trendMap).map(k => ({ 
    name: k, 
    income: trendMap[k].income, 
    expense: trendMap[k].expense 
  }))

  // Group by category for charts & frequency
  const categoryMap: Record<string, number> = {}
  const categoryFreq: Record<string, number> = {}
  
  currentExpenses.forEach(t => {
    const cat = t.category || 'อื่นๆ'
    categoryMap[cat] = (categoryMap[cat] || 0) + Number(t.amount)
    categoryFreq[cat] = (categoryFreq[cat] || 0) + 1
  })

  const categoryData = Object.keys(categoryMap).map(k => ({
    name: k === 'food' ? 'อาหาร' : k === 'fuel' ? 'น้ำมัน' : k === 'expense' ? 'รายจ่ายอื่นๆ' : k,
    value: categoryMap[k],
    count: categoryFreq[k]
  })).sort((a, b) => b.value - a.value)

  // Find most frequent category
  let mostFrequent = { name: 'ไม่มีข้อมูล', count: 0 }
  Object.keys(categoryFreq).forEach(k => {
    if (categoryFreq[k] > mostFrequent.count) {
      mostFrequent = {
        name: k === 'food' ? 'อาหาร' : k === 'fuel' ? 'น้ำมัน' : k === 'expense' ? 'รายจ่ายอื่นๆ' : k,
        count: categoryFreq[k]
      }
    }
  })

  // AI Insights Logic
  let insightMessage = ''
  let insightType: 'good' | 'warning' | 'neutral' = 'neutral'
  
  const diff = prevTotalExpense - totalExpense

  if (prevTotalExpense === 0) {
    insightMessage = 'เริ่มต้นบันทึกรายรับรายจ่ายเดือนแรก เพื่อดูสถิติเปรียบเทียบในเดือนถัดไปครับ 🚀'
    insightType = 'neutral'
  } else if (totalExpense > prevTotalExpense) {
    const percent = Math.round(((totalExpense - prevTotalExpense) / prevTotalExpense) * 100)
    insightMessage = `⚠️ ระวัง! เดือนนี้คุณใช้เงินเยอะกว่าเดือนที่แล้ว ${percent}% (เพิ่มขึ้น ฿${Math.abs(diff).toLocaleString()})`
    insightType = 'warning'
  } else if (diff > 0) {
    const percent = Math.round((diff / prevTotalExpense) * 100)
    insightMessage = `🎉 ยอดเยี่ยม! เดือนนี้คุณประหยัดเงินได้มากกว่าเดือนที่แล้ว ${percent}% (ลดลง ฿${Math.abs(diff).toLocaleString()})`
    insightType = 'good'
  } else {
    insightMessage = 'การใช้จ่ายของคุณคงที่ เทียบเท่ากับเดือนที่แล้วเลยครับ 👏'
    insightType = 'good'
  }

  return {
    monthName: targetDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }),
    totalExpense,
    totalIncome,
    prevTotalExpense,
    categoryData,
    trendData,
    insightMessage,
    insightType,
    mostFrequent,
    totalTxCount: currentTxs?.length || 0
  }
}
