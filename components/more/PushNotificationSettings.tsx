'use client'

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'sonner'

export function PushNotificationSettings() {
  const [loading, setLoading] = useState(false)
  const [isPushEnabled, setIsPushEnabled] = useState(false)

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      // Could also check if subscription exists
      setIsPushEnabled(true)
    }
  }, [])

  const handleEnablePush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('เบราว์เซอร์ของคุณไม่รองรับการแจ้งเตือนแบบ Push')
      return
    }

    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('กรุณาอนุญาตการแจ้งเตือนในเบราว์เซอร์ของคุณก่อนครับ')
        setLoading(false)
        return
      }

      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) throw new Error('VAPID key not found')

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      // Send to our API
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      })

      if (!res.ok) throw new Error('Failed to save subscription on server')

      setIsPushEnabled(true)
      toast.success('เปิดการแจ้งเตือนแบบแอปสำเร็จแล้ว! 🎉')
    } catch (e: any) {
      console.error(e)
      toast.error('เปิดการแจ้งเตือนไม่สำเร็จ')
    }
    setLoading(false)
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${isPushEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
          <FontAwesomeIcon icon={faBell} className={!isPushEnabled && !loading ? 'animate-bounce' : ''} />
        </div>
        <div>
          <h2 className="font-bold text-slate-800">การแจ้งเตือน</h2>
          <p className="text-xs text-slate-500">รับแจ้งเตือนเมื่อคนในกระเป๋าเบิกเงิน</p>
        </div>
      </div>
      <button 
        onClick={handleEnablePush}
        disabled={isPushEnabled || loading}
        className={`w-full font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 ${isPushEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      >
        {loading ? (
          <FontAwesomeIcon icon={faSpinner} spin />
        ) : isPushEnabled ? (
          <>
            <FontAwesomeIcon icon={faCheck} />
            เปิดใช้งานการแจ้งเตือนแล้ว
          </>
        ) : (
          'เปิดการแจ้งเตือน (Web Push)'
        )}
      </button>
    </div>
  )
}
