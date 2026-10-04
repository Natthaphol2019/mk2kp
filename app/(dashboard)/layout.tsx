import { BottomNav } from '@/components/shared/BottomNav'
import { RealtimeProvider } from '@/components/shared/RealtimeProvider'
import { ensureWorkspace, getUserWorkspaces } from '@/actions/workspace-actions'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const activeWorkspaceId = await ensureWorkspace()
  const workspaces = await getUserWorkspaces()
  const allWorkspaceIds = workspaces.map(w => w.id)

  return (
    <div className="flex-1 flex flex-col">
      <RealtimeProvider activeWorkspaceId={activeWorkspaceId} allWorkspaceIds={allWorkspaceIds} workspaces={workspaces} />
      <div className="flex-1 pb-24">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
