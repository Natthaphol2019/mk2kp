import { createClient } from '@/lib/supabase/server'
import { logout } from '@/actions/auth-actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt, faChevronRight, faCog, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { ProfileSection } from '@/components/more/ProfileSection'
import { PushNotificationSettings } from '@/components/more/PushNotificationSettings'

import { getUserWorkspaces } from '@/actions/workspace-actions'
import { WorkspaceSection } from '@/components/more/WorkspaceSection'

export default async function MorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const username = user?.email?.split('@')[0] || 'Rider'
  const displayName = user?.user_metadata?.display_name || username
  const activeWorkspaceId = user?.user_metadata?.active_workspace_id || ''
  
  const workspaces = await getUserWorkspaces()

  return (
    <div className="min-h-screen bg-slate-50 p-4 space-y-6 pb-24">
      <header className="pt-4 pb-2">
        <h1 className="text-xl font-bold text-slate-800">อื่นๆ</h1>
        <p className="text-sm text-slate-500">การตั้งค่าและบัญชีผู้ใช้</p>
      </header>
      
      <ProfileSection initialUsername={username} initialDisplayName={displayName} />

      <WorkspaceSection 
        workspaces={workspaces} 
        activeWorkspaceId={activeWorkspaceId} 
        currentUserId={user?.id || ''} 
      />

      <PushNotificationSettings />

      {/* Menu List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <button className="w-full flex items-center justify-between p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faCog} />
            </div>
            <span className="font-medium text-slate-700">การตั้งค่าแอป</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} className="text-slate-300 text-sm" />
        </button>
        
        <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faQuestionCircle} />
            </div>
            <span className="font-medium text-slate-700">ช่วยเหลือ & ติดต่อ</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} className="text-slate-300 text-sm" />
        </button>
      </div>

      {/* Logout Form */}
      <div className="pt-4">
        <form action={logout}>
          <button 
            type="submit" 
            className="w-full bg-red-50 text-red-600 hover:bg-red-100 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            ออกจากระบบ
          </button>
        </form>
      </div>
    </div>
  )
}
