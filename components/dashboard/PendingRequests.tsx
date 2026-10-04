'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faCheck, faTimes, faUpload, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { updateTransactionStatus } from '@/actions/transaction-actions'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'
import { extractAmountFromSlip } from '@/lib/ocr'

export function PendingRequests({ requests, currentUserId }: { requests: any[], currentUserId: string }) {
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [file, setFile] = useState<File | null>(null)

  const handleApprove = async () => {
    if (!selectedRequest) return
    setLoading(true)
    setLoadingText('กำลังเตรียมข้อมูล...')
    
    try {
      let slipUrl = null

      if (file) {
        setLoadingText('🤖 AI กำลังอ่านรูปสลิป...')
        const ocrAmount = await extractAmountFromSlip(file)
        
        if (ocrAmount !== null) {
          if (ocrAmount !== Number(selectedRequest.amount)) {
            const proceed = window.confirm(`⚠️ AI ตรวจพบยอดโอน ฿${ocrAmount.toLocaleString()} \nแต่ยอดที่ขอเบิกคือ ฿${Number(selectedRequest.amount).toLocaleString()}\n\nคุณต้องการยืนยันอนุมัติรายการนี้หรือไม่?`)
            if (!proceed) {
              setLoading(false)
              setLoadingText('')
              return
            }
          } else {
            toast.success(`AI ตรวจสอบยอด ฿${ocrAmount} ถูกต้อง!`, { icon: '✅' })
          }
        } else {
          toast.info('AI อ่านตัวเลขไม่ได้ กรุณาตรวจสอบด้วยตาเปล่า', { icon: '👀' })
        }

        setLoadingText('กำลังบีบอัดรูปภาพ...')
        const compressedFile = await compressImage(file)
        
        setLoadingText('กำลังอัปโหลดสลิป...')
        const supabase = createClient()
        const fileExt = compressedFile.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `slips/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('slips')
          .upload(filePath, compressedFile)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('slips').getPublicUrl(filePath)
        slipUrl = data.publicUrl
      }

      await updateTransactionStatus(selectedRequest.id, 'completed', slipUrl || undefined)
      toast.success('อนุมัติรายการเรียบร้อยแล้ว')
      setSelectedRequest(null)
      setFile(null)
    } catch (e: any) {
      toast.error('เกิดข้อผิดพลาด: ' + e.message)
    }
    setLoading(false)
    setLoadingText('')
  }

  const handleReject = async (id: number) => {
    if (!window.confirm('ต้องการปฏิเสธคำขอนี้ใช่หรือไม่?')) return
    setLoading(true)
    try {
      await updateTransactionStatus(id, 'rejected')
      toast.success('ปฏิเสธรายการเรียบร้อย')
    } catch (e: any) {
      toast.error(e.message)
    }
    setLoading(false)
  }

  if (!requests || requests.length === 0) return null

  return (
    <div className="mb-6">
      <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
        <FontAwesomeIcon icon={faClock} className="text-amber-500" />
        รออนุมัติ ({requests.length})
      </h2>

      <div className="space-y-3">
        {requests.map((req) => (
          <div key={req.id} className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">{req.creator_name} ขอเบิกเงิน</p>
              <p className="text-xs text-slate-500">ยอด: <span className="font-bold text-red-500">฿{Number(req.amount).toLocaleString()}</span> • {req.category}</p>
            </div>
            
            {req.user_id !== currentUserId ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleReject(req.id)}
                  className="w-10 h-10 bg-white text-slate-400 rounded-xl hover:text-red-500 hover:bg-red-50 shadow-sm transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
                <button 
                  onClick={() => setSelectedRequest(req)}
                  className="px-4 h-10 bg-primary text-white rounded-xl shadow-sm text-sm font-bold hover:bg-primary-dark transition-colors"
                >
                  อนุมัติ
                </button>
              </div>
            ) : (
              <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-lg">รอแฟนโอนเงิน</span>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedRequest && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 z-[60] backdrop-blur-sm"
              onClick={() => !loading && setSelectedRequest(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-4 right-4 -translate-y-1/2 max-w-sm mx-auto bg-white rounded-3xl z-[70] p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-2">อนุมัติคำขอเบิกเงิน</h3>
              <p className="text-sm text-slate-500 mb-4">แนบสลิปเพื่อเป็นหลักฐานว่าโอนเงินให้ {selectedRequest.creator_name} แล้ว</p>
              
              <div className="mb-6">
                <label className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-xl mb-3">
                    <FontAwesomeIcon icon={faUpload} />
                  </div>
                  <p className="text-sm font-bold text-slate-700">{file ? file.name : 'เลือกไฟล์รูปสลิป (ถ้ามี)'}</p>
                </label>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedRequest(null)}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span className="text-xs">{loadingText || 'กำลังโหลด...'}</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} />
                      ยืนยันอนุมัติ
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 1200
        const MAX_HEIGHT = 1600
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            resolve(newFile)
          } else {
            resolve(file)
          }
        }, 'image/jpeg', 0.8) // 80% quality
      }
    }
  })
}
