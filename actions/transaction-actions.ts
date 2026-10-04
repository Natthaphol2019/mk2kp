
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ensureWorkspace } from './workspace-actions'
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:test@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

export async function createTransaction(data: {
  amount: number,
  from_account: 'main' | 'pocket' | 'external',
  to_account: 'main' | 'pocket' | 'external',
  category: string,
  note?: string,
  status?: string,
  slip_url?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const workspace_id = await ensureWorkspace()
  
  const username = user.email?.split('@')[0] || 'Unknown'
  const displayName = user.user_metadata?.display_name || username

  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      workspace_id,
      creator_name: displayName,
      status: data.status || 'completed',
      ...data
    })

  if (error) throw new Error(error.message)

  // Trigger Push Notification to other members
  try {
    const { data: members } = await supabase
      .from('workspace_members')
      .select('user_id')
      .eq('workspace_id', workspace_id)
      .neq('user_id', user.id)

    if (members && members.length > 0) {
      const memberIds = members.map(m => m.user_id)
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .in('user_id', memberIds)

      if (subs && subs.length > 0) {
        let action = data.status === 'pending' ? 'ขออนุมัติเบิกเงิน' : 'ใช้เงิน'
        if (data.status !== 'pending') {
          if (data.from_account === 'external' && (data.to_account === 'main' || data.to_account === 'pocket')) action = 'เติมเงิน'
          if (data.to_account === 'external' && data.from_account === 'pocket') action = 'จ่ายเงินสด'
          if (data.to_account === 'external' && data.from_account === 'main') action = 'โอนเงิน'
        }

        const payload = JSON.stringify({
          title: `RiderWallet: ${data.status === 'pending' ? 'คำขอเบิกเงินใหม่!' : 'แจ้งเตือนกระเป๋ากองกลาง'}`,
          body: `${displayName} เพิ่ง${action}จำนวน ฿${data.amount.toLocaleString()} หมวดหมู่: ${data.category}`
        })

        subs.forEach(sub => {
          webpush.sendNotification(sub.subscription, payload).catch(err => console.error(err))
        })
      }
    }
  } catch (e) {
    console.error('Push notification failed', e)
  }

  revalidatePath('/')
}

export async function getWalletBalances() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { main: 0, pocket: 0 }

  const workspace_id = await ensureWorkspace()

  // Only calculate completed transactions
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, from_account, to_account')
    .eq('workspace_id', workspace_id)
    .eq('status', 'completed')

  if (error || !data) return { main: 0, pocket: 0 }

  let main = 0
  let pocket = 0

  data.forEach((tx) => {
    const amt = Number(tx.amount)
    if (tx.from_account === 'main') main -= amt
    if (tx.from_account === 'pocket') pocket -= amt
    if (tx.to_account === 'main') main += amt
    if (tx.to_account === 'pocket') pocket += amt
  })

  return { main, pocket }
}

export async function getPendingTransactions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const workspace_id = await ensureWorkspace()

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('workspace_id', workspace_id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function updateTransactionStatus(id: number, status: 'completed' | 'rejected', slipUrl?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const updateData: any = { status }
  if (slipUrl) updateData.slip_url = slipUrl

  const { error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function getRecentTransactions(limit = 50) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const workspace_id = await ensureWorkspace()

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('workspace_id', workspace_id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data
}

