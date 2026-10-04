'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faList, faWallet, faChartPie, faBars, faStar } from '@fortawesome/free-solid-svg-icons'

export function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    { name: 'หน้าหลัก', href: '/', icon: faHome },
    { name: 'ประวัติ', href: '/history', icon: faList },
    { name: 'ส่วนตัว', href: '/personal', icon: faStar },
    { name: 'วิเคราะห์', href: '/analytics', icon: faChartPie },
    { name: 'อื่นๆ', href: '/more', icon: faBars },
  ]

  return (
    <div className="fixed bottom-0 w-full max-w-md mx-auto bg-white border-t border-slate-100 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname?.startsWith(tab.href))
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`flex items-center justify-center w-12 h-8 rounded-full transition-all duration-300 ${isActive ? 'bg-primary/10' : 'bg-transparent'}`}>
                <FontAwesomeIcon icon={tab.icon} className={`text-lg ${isActive ? 'scale-110' : ''} transition-transform`} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
