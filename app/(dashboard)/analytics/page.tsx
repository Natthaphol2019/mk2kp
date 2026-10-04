import { getAnalyticsData } from '@/actions/analytics-actions'
import { AnalyticsClientView } from '@/components/analytics/AnalyticsClientView'

export default async function AnalyticsPage({ searchParams }: { searchParams: { offset?: string } }) {
  const offset = parseInt(searchParams.offset || '0', 10)
  const data = await getAnalyticsData(offset)

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pb-24">
        <p className="text-slate-500 text-center">ไม่สามารถโหลดข้อมูลได้ โปรดลองเข้าสู่ระบบใหม่</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 space-y-6 pb-24">
      <header className="pt-4 pb-2">
        <h1 className="text-xl font-bold text-slate-800">สรุปยอด</h1>
        <p className="text-sm text-slate-500">วิเคราะห์พฤติกรรมการใช้เงิน</p>
      </header>
      
      <AnalyticsClientView data={data} offset={offset} />
    </div>
  )
}
