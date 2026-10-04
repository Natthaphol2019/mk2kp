import { getGoals, getEvents } from '@/actions/personal-actions'
import { GoalSection } from '@/components/personal/GoalSection'
import { CalendarSection } from '@/components/personal/CalendarSection'

export default async function PersonalPage() {
  const goals = await getGoals()
  const events = await getEvents()

  return (
    <div className="min-h-screen bg-slate-50 p-4 space-y-2 pb-24">
      <header className="pt-4 pb-4">
        <h1 className="text-xl font-bold text-slate-800">พื้นที่ส่วนตัว</h1>
        <p className="text-sm text-slate-500">เป้าหมายการออมและวันสำคัญของคุณเท่านั้น</p>
      </header>
      
      <GoalSection goals={goals} />
      <CalendarSection events={events} />
    </div>
  )
}
