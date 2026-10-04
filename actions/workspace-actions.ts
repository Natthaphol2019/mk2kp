'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function ensureWorkspace() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Check if they have an active workspace set in metadata
  const activeId = user.user_metadata?.active_workspace_id

  // Check if they are a member of the active workspace
  if (activeId) {
    const { data: activeMember } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .eq('workspace_id', activeId)
      .single()
      
    if (activeMember) return activeId
  }

  // If no active workspace or not a member, just get the first one they belong to
  const { data: members } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: true })
    .limit(1)

  if (members && members.length > 0) {
    const firstWsId = members[0].workspace_id
    await supabase.auth.updateUser({ data: { active_workspace_id: firstWsId } })
    return firstWsId
  }

  // If they have NO workspaces at all, create a default personal one
  const inviteCode = generateToken()
  const { data: ws, error: wsError } = await supabase
    .from('workspaces')
    .insert({
      name: 'กระเป๋าส่วนตัว',
      invite_code: inviteCode,
      owner_id: user.id
    })
    .select('id')
    .single()

  if (wsError) throw new Error(wsError.message)

  await supabase
    .from('workspace_members')
    .insert({
      workspace_id: ws.id,
      user_id: user.id
    })

  await supabase.auth.updateUser({ data: { active_workspace_id: ws.id } })
  return ws.id
}

function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let token = ''
  for (let i = 0; i < 8; i++) {
    if (i === 4) token += '-'
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export async function createNewWorkspace(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const inviteCode = generateToken()
  
  const { data: ws, error: wsError } = await supabase
    .from('workspaces')
    .insert({
      name,
      invite_code: inviteCode,
      owner_id: user.id
    })
    .select('id, invite_code')
    .single()

  if (wsError) throw new Error(wsError.message)

  await supabase
    .from('workspace_members')
    .insert({
      workspace_id: ws.id,
      user_id: user.id
    })

  // Set as active
  await supabase.auth.updateUser({ data: { active_workspace_id: ws.id } })
  revalidatePath('/')
  
  return ws
}

export async function getUserWorkspaces() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get all memberships
  const { data: members } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)

  if (!members || members.length === 0) return []
  
  const wsIds = members.map(m => m.workspace_id)

  // Get workspace details including deleted_at
  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('*')
    .in('id', wsIds)
    .order('created_at', { ascending: false })

  return workspaces || []
}

export async function switchWorkspace(workspaceId: string) {
  const supabase = await createClient()
  await supabase.auth.updateUser({ data: { active_workspace_id: workspaceId } })
  revalidatePath('/')
}

export async function joinWorkspace(inviteCode: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const cleanCode = inviteCode.trim().toUpperCase()

  // Find workspace by code
  const { data: ws, error: findError } = await supabase
    .from('workspaces')
    .select('id, name')
    .eq('invite_code', cleanCode)
    .single()

  if (findError || !ws) throw new Error('ไม่พบ Key Token นี้ หรือ Token ไม่ถูกต้อง')

  // Check if already a member
  const { data: existing } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .eq('workspace_id', ws.id)
    .single()

  if (!existing) {
    // Join new workspace
    const { error: joinError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: ws.id,
        user_id: user.id
      })
    if (joinError) throw new Error('เข้าร่วมกระเป๋าไม่สำเร็จ')
  }
  
  // Set as active
  await supabase.auth.updateUser({ data: { active_workspace_id: ws.id } })
  revalidatePath('/')
  return ws.name
}

export async function generateNewInviteCode(workspaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify ownership
  const { data: ws } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', workspaceId)
    .single()

  if (!ws || ws.owner_id !== user.id) {
    throw new Error('เฉพาะเจ้าของกระเป๋าเท่านั้นที่เปลี่ยน Token ได้')
  }

  const newCode = generateToken()
  await supabase
    .from('workspaces')
    .update({ invite_code: newCode })
    .eq('id', workspaceId)

  revalidatePath('/more')
}

export async function deleteWorkspace(workspaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify ownership
  const { data: ws } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', workspaceId)
    .single()

  if (!ws || ws.owner_id !== user.id) {
    throw new Error('???????????????????????????????????')
  }

  // Delete workspace (cascade deletes members and transactions)
  await supabase
    .from('workspaces')
    .delete()
    .eq('id', workspaceId)

  // Reset active workspace metadata if they deleted their active one
  const activeId = user.user_metadata?.active_workspace_id
  if (activeId === workspaceId) {
    await supabase.auth.updateUser({ data: { active_workspace_id: null } })
  }

  revalidatePath('/')
}

export async function leaveWorkspace(workspaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify NOT ownership (owners must delete, not leave)
  const { data: ws } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', workspaceId)
    .single()

  if (ws && ws.owner_id === user.id) {
    throw new Error('??????????????????????????????? (??????????????????)')
  }

  // Delete membership
  await supabase
    .from('workspace_members')
    .delete()
    .eq('user_id', user.id)
    .eq('workspace_id', workspaceId)

  // Reset active workspace metadata
  const activeId = user.user_metadata?.active_workspace_id
  if (activeId === workspaceId) {
    await supabase.auth.updateUser({ data: { active_workspace_id: null } })
  }

  revalidatePath('/')
}


export async function softDeleteWorkspace(workspaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: ws } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', workspaceId)
    .single()

  if (!ws || ws.owner_id !== user.id) throw new Error('???????????????????????????????????')

  // Set deleted_at to now
  await supabase
    .from('workspaces')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', workspaceId)

  // Clear active if it was this one
  const activeId = user.user_metadata?.active_workspace_id
  if (activeId === workspaceId) {
    await supabase.auth.updateUser({ data: { active_workspace_id: null } })
  }
  revalidatePath('/')
}

export async function restoreWorkspace(workspaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: ws } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', workspaceId)
    .single()

  if (!ws || ws.owner_id !== user.id) throw new Error('???????????????????????????????????????')

  await supabase
    .from('workspaces')
    .update({ deleted_at: null })
    .eq('id', workspaceId)

  revalidatePath('/')
}

