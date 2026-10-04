'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getGoals() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return []
  return data
}

export async function createGoal(data: { name: string; target_amount: number; color?: string; icon?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      ...data
    })

  if (error) throw new Error(error.message)
  revalidatePath('/personal')
}

export async function updateGoalAmount(id: number, addAmount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get current
  const { data: goal } = await supabase.from('goals').select('current_amount').eq('id', id).single()
  if (!goal) throw new Error('Goal not found')

  const { error } = await supabase
    .from('goals')
    .update({ current_amount: Number(goal.current_amount) + addAmount })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/personal')
}

export async function getEvents() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', user.id)
    .order('event_date', { ascending: true })

  if (error) return []
  return data
}

export async function createEvent(data: { title: string; event_date: string; color?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: user.id,
      ...data
    })

  if (error) throw new Error(error.message)
  revalidatePath('/personal')
}
