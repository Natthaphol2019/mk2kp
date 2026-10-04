'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet, faPlus, faLink, faCopy, faCheckCircle, faSpinner, faCheck, faRefresh } from '@fortawesome/free-solid-svg-icons'
import { joinWorkspace, createNewWorkspace, switchWorkspace, generateNewInviteCode, softDeleteWorkspace, restoreWorkspace, leaveWorkspace } from '@/actions/workspace-actions'
import { toast } from 'sonner'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { faTrash, faSignOutAlt, faUndo, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

export function WorkspaceSection({ workspaces, activeWorkspaceId, currentUserId }: { workspaces: any[], activeWorkspaceId: string, currentUserId: string }) {
  const [loading, setLoading] = useState(false)
  
  // Modals
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Form State
  const [inviteCode, setInviteCode] = useState('')
  const [newWalletName, setNewWalletName] = useState('')

  // Calculate remaining time for deleted workspaces
  const getRemainingHours = (deletedAt: string) => {
    if (!deletedAt) return 0
    const deleteTime = new Date(deletedAt).getTime()
    const now = new Date().getTime()
    const diff = (deleteTime + 24 * 60 * 60 * 1000) - now
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)))
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('คัดลอก Key Token แล้ว', { icon: <FontAwesomeIcon icon={faCopy} /> })
  }

  const handleSwitch = async (id: string, isDeleted: boolean) => {
    if (id === activeWorkspaceId || isDeleted) return
    setLoading(true)
    try {
      await switchWorkspace(id)
      toast.success('สลับกระเป๋าสำเร็จ', { icon: '🔄' })
    } catch (e: any) {
      toast.error('สลับกระเป๋าไม่สำเร็จ')
    }
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!newWalletName.trim()) return
    setLoading(true)
    try {
      await createNewWorkspace(newWalletName.trim())
      toast.success(`สร้างกระเป๋า "${newWalletName}" สำเร็จ!`, { icon: '🎉' })
      setShowCreateModal(false)
      setNewWalletName('')
    } catch (e: any) {
      toast.error(e.message)
    }
    setLoading(false)
  }

  const handleJoin = async () => {
    if (!inviteCode) return
    setLoading(true)
    try {
      const name = await joinWorkspace(inviteCode)
      toast.success(`เข้าร่วมกระเป๋า "${name}" สำเร็จ!`, { icon: '🙌' })
      setShowJoinModal(false)
      setInviteCode('')
    } catch (e: any) {
      toast.error(e.message)
    }
    setLoading(false)
  }

  const handleRegenerateToken = async (wsId: string) => {
    if (!window.confirm('หากสร้าง Key Token ใหม่ รหัสเก่าจะใช้งานไม่ได้ ยืนยันหรือไม่?')) return
    setLoading(true)
    try {
      await generateNewInviteCode(wsId)
      toast.success('สร้าง Key Token ใหม่สำเร็จ')
    } catch (e: any) {
      toast.error(e.message)
    }
    setLoading(false)
  }

  const handleDelete = async (wsId: string) => {
    if (!window.confirm('กระเป๋าจะถูกย้ายไปถังขยะและลบถาวรใน 24 ชั่วโมง (สามารถกู้คืนได้) ยืนยันหรือไม่?')) return
    setLoading(true)
    try {
      await softDeleteWorkspace(wsId)
      toast.success('ย้ายกระเป๋าไปถังขยะแล้ว')
    } catch (e: any) {
      toast.error(e.message)
    }
    setLoading(false)
  }

  const handleRestore = async (wsId: string) => {
    setLoading(true)
    try {
      await restoreWorkspace(wsId)
      toast.success('กู้คืนกระเป๋าสำเร็จ')
    } catch (e: any) {
      toast.error(e.message)
    }
    setLoading(false)
  }

  const handleLeave = async (wsId: string) => {
    if (!window.confirm('ยืนยันที่จะออกจากกระเป๋าใบนี้หรือไม่?')) return
    setLoading(true)
    try {
      await leaveWorkspace(wsId)
      toast.success('ออกจากกระเป๋าสำเร็จ')
    } catch (e: any) {
      toast.error(e.message)
    }
    setLoading(false)
  }

  return (
    <>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faWallet} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">จัดการกระเป๋าเงิน</h2>
              <p className="text-xs text-slate-500">ปัดซ้าย (Swipe) ที่กระเป๋าเพื่อลบ</p>
            </div>
          </div>
        </div>

        {/* List of Wallets */}
        <div className="space-y-4 mb-6">
          {(workspaces || []).filter(Boolean).map((ws: any) => {
            const isActive = ws.id === activeWorkspaceId
            const isOwner = ws.owner_id === currentUserId
            const isDeleted = !!ws.deleted_at
            const hoursLeft = getRemainingHours(ws.deleted_at)
            
            return (
              <div key={ws.id} className="relative group">
                {/* Background Actions (Swipe to Delete Reveal) */}
                <div className="absolute inset-y-0 right-0 w-24 bg-red-500 rounded-2xl flex items-center justify-end pr-6 text-white font-bold">
                  <FontAwesomeIcon icon={faTrash} className="text-xl" />
                </div>

                {/* Foreground Card */}
                <motion.div 
                  drag={isOwner && !isDeleted ? "x" : false}
                  dragConstraints={{ left: -100, right: 0 }}
                  onDragEnd={(e, info) => {
                    if (info.offset.x < -80) {
                      handleDelete(ws.id)
                    }
                  }}
                  whileDrag={{ scale: 0.98 }}
                  onClick={() => !isActive && handleSwitch(ws.id, isDeleted)}
                  className={`relative z-10 overflow-hidden rounded-2xl p-4 transition-all ${isDeleted ? 'bg-slate-100 opacity-80 border border-slate-200' : isActive ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 text-slate-700'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isDeleted ? 'text-slate-500 line-through' : ''}`}>{ws?.name || 'Unnamed Wallet'}</span>
                      {!isOwner && <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>Shared</span>}
                      {isOwner && <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isActive ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-600'}`}>Owner</span>}
                    </div>
                    {isActive && !isDeleted && (
                      <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                        <FontAwesomeIcon icon={faCheckCircle} /> ใช้งานอยู่
                      </div>
                    )}
                  </div>

                  {isDeleted ? (
                    <div className="mt-3 bg-red-50 text-red-600 rounded-xl p-3 flex items-center justify-between border border-red-100">
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        จะลบถาวรใน {hoursLeft} ชั่วโมง
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRestore(ws.id) }}
                        className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                      >
                        <FontAwesomeIcon icon={faUndo} className="mr-1" /> กู้คืน
                      </button>
                    </div>
                  ) : isActive && (
                    <div className="mt-3 bg-black/20 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-white/60 mb-0.5 font-medium uppercase tracking-wider">Key Token</p>
                        <p className="font-mono font-bold tracking-widest text-lg">{ws?.invite_code || 'N/A'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCopy(ws.invite_code) }}
                          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </button>
                        {isOwner && (
                          <>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleRegenerateToken(ws.id) }}
                              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                              title="เปลี่ยน Key"
                            >
                              <FontAwesomeIcon icon={faRefresh} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(ws.id) }}
                              className="w-10 h-10 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg flex items-center justify-center transition-colors"
                              title="ลบกระเป๋า"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </>
                        )}
                        {!isOwner && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleLeave(ws.id) }}
                            className="w-10 h-10 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 rounded-lg flex items-center justify-center transition-colors"
                            title="ออกจากกระเป๋า"
                          >
                            <FontAwesomeIcon icon={faSignOutAlt} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex-1 bg-slate-100 text-slate-700 font-medium py-3 rounded-xl text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            สร้างกระเป๋าใหม่
          </button>
          <button 
            onClick={() => setShowJoinModal(true)}
            className="flex-1 bg-indigo-50 text-indigo-600 font-medium py-3 rounded-xl text-sm hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faLink} />
            เข้าร่วมด้วย Token
          </button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(showJoinModal || showCreateModal) && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !loading && (setShowJoinModal(false), setShowCreateModal(false))}
            className="fixed inset-0 bg-slate-900/60 z-[60] max-w-md mx-auto backdrop-blur-sm"
          />
        )}

        {/* Join Modal */}
        {showJoinModal && (
          <motion.div
            key="join-modal"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed top-1/2 left-4 right-4 -translate-y-1/2 max-w-sm mx-auto bg-white rounded-3xl z-[70] p-6 shadow-2xl"
          >
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
              <FontAwesomeIcon icon={faLink} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center mb-1">เข้าร่วมกระเป๋าผู้อื่น</h3>
            <p className="text-sm text-slate-500 text-center mb-6">กรอก Key Token 9 หลัก (รวมขีด) ที่ได้รับมา</p>
            
            <div className="mb-6">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-2xl font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-center uppercase"
                placeholder="XXXX-XXXX"
                maxLength={9}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                disabled={loading}
                className="flex-1 bg-slate-100 text-slate-600 font-medium py-3 rounded-xl disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleJoin}
                disabled={loading || inviteCode.length < 9}
                className="flex-1 bg-indigo-600 text-white font-medium py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'เข้าร่วมเลย'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <motion.div
            key="create-modal"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed top-1/2 left-4 right-4 -translate-y-1/2 max-w-sm mx-auto bg-white rounded-3xl z-[70] p-6 shadow-2xl"
          >
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
              <FontAwesomeIcon icon={faPlus} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center mb-1">สร้างกระเป๋าเงินใหม่</h3>
            <p className="text-sm text-slate-500 text-center mb-6">สร้างกระเป๋าใหม่เพื่อใช้งานส่วนตัวหรือแชร์กับทีม</p>
            
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อกระเป๋าเงิน</label>
              <input
                type="text"
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                placeholder="เช่น กองกลางครอบครัว, ค่าใช้จ่ายทริป..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={loading}
                className="flex-1 bg-slate-100 text-slate-600 font-medium py-3 rounded-xl disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCreate}
                disabled={loading || !newWalletName.trim()}
                className="flex-1 bg-emerald-600 text-white font-medium py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'สร้างกระเป๋า'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
