'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  activeWorkspaceId: string
  allWorkspaceIds: string[]
  workspaces: any[]
}

export function RealtimeProvider({ activeWorkspaceId, allWorkspaceIds, workspaces }: Props) {
  const router = useRouter()
  const myUserId = useRef<string | null>(null)

  useEffect(() => {
    if (allWorkspaceIds.length === 0) return

    const supabase = createClient()
    
    // Get current user to ignore our own transactions in toast
    supabase.auth.getUser().then(({ data }) => {
      myUserId.current = data.user?.id || null
    })

    console.log('RealtimeProvider watching workspaces:', allWorkspaceIds)

    const channel = supabase
      .channel('realtime:transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `workspace_id=in.(${allWorkspaceIds.join(',')})`
        },
        (payload) => {
          console.log('REALTIME PAYLOAD RECEIVED!', payload)
          
          const tx = payload.new
          // Don't toast if I am the one who made the transaction (unless testing)
          if (tx.user_id !== myUserId.current) {
            const wsName = workspaces.find(w => w.id === tx.workspace_id)?.name || 'กระเป๋า'
            
            toast.info(`กระเป๋า "${wsName}" มีรายการใหม่! 🔔`, {
              description: `${tx.creator_name} เพิ่งบันทึกยอด ฿${tx.amount.toLocaleString()} (หมวดหมู่: ${tx.category})`,
              duration: 5000,
            })
          }

          // If the transaction happened in the wallet we are currently viewing, update the screen!
          if (tx.workspace_id === activeWorkspaceId) {
            router.refresh()
          }
        }
      )
      .subscribe((status) => {
        console.log('Supabase Realtime Status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeWorkspaceId, allWorkspaceIds.join(','), workspaces, router])

  return null
}
