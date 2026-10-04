'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ensureWorkspace } from './workspace-actions'

export async function login(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const email = `${username.toLowerCase()}@riderwallet.com`

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  await ensureWorkspace()
  redirect('/')
}

export async function register(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const email = `${username.toLowerCase()}@riderwallet.com`

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  await ensureWorkspace()
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function updateProfile(formData: FormData) {
  const displayName = formData.get('displayName') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    data: { display_name: displayName }
  })

  if (error) {
    throw new Error(error.message)
  }
}


export async function updatePassword(formData: FormData) {
  const newPassword = formData.get('password') as string
  const supabase = await createClient()

  if (newPassword.length < 6) {
    throw new Error('??????????????????????? 6 ???')
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    throw new Error(error.message)
  }
}

