
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getMonthlyBudgetStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1. Get limit from metadata (default 9000)
  const monthlyLimit = user.user_metadata?.monthly_limit || 9000

  // 2. Calculate expenses for current month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const { data: expenses } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', user.id)
    .eq('category', 'expense')
    .gte('created_at', startOfMonth)
    .lte('created_at', endOfMonth)

  const totalUsed = expenses?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0
  const remaining = monthlyLimit - totalUsed

  // 3. Calculate daily average
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysLeft = daysInMonth - now.getDate() + 1 // including today
  const dailyAverage = remaining > 0 ? remaining / daysLeft : 0

  return {
    monthlyLimit,
    totalUsed,
    remaining,
    dailyAverage,
    daysLeft,
    percentUsed: (totalUsed / monthlyLimit) * 100
  }
}

export async function setMonthlyLimit(formData: FormData) {
  const limit = Number(formData.get('limit'))
  if (!limit || limit <= 0) throw new Error('Invalid limit')

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    data: { monthly_limit: limit }
  })

  if (error) throw new Error(error.message)
  revalidatePath('/allowance')
}

