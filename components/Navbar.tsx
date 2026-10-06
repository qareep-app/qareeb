'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'الرئيسية' },
    { href: '/ads', label: 'التصنيفات' },
    { href: '/ads', label: 'الأحياء' },
    { href: '/how-it-works', label: 'كيف يعمل؟' },
    { href: '/about', label: 'عن قريب' },
    { href: '/contact', label: 'تواصل معنا' },
  ]

  return (
    <>
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50" dir="rtl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <div className="text-lg font-extrabold text-[#005c45] leading-tight">قريب</div>
              <div className="text-[10px] font-bold text-[#e27d18]">دكانك قريب</div>
            </div>
            <img
  src="/icon.png"
  alt="قريب"
  className="w-10 h-10 rounded-full object-cover shadow-sm"
/>
          </Link>

          <div className="order-last md:order-none w-full md:flex-1 md:max-w-md">
            <div className="relative">
              <input
                type="search"
                placeholder="دور على أي حاجة..."
                className="w-full bg-slate-50 border border-slate-100 rounded-full py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#005c45]/20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex rounded-full border border-slate-200 overflow-hidden text-xs font-bold">
              <Link href="/" className="px-3 py-2 bg-[#005c45] text-white">
                AR
              </Link>
              <Link href="/en" className="px-3 py-2 text-slate-500 hover:bg-slate-50">
                EN
              </Link>
            </div>

            <Link
              href="/messages"
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#005c45]"
            >
              💬
            </Link>

            <Link
              href="/account"
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#005c45]"
            >
              👤
            </Link>

            <Link
              href="/add"
              className="bg-[#005c45] hover:bg-[#004a38] text-white px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap"
            >
              + أضف إعلانك
            </Link>
          </div>
        </div>

        <nav className="hidden md:flex max-w-6xl mx-auto px-4 pb-3 gap-5 text-sm font-bold text-slate-500">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={pathname === l.href ? 'text-[#005c45]' : 'hover:text-[#005c45]'}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>

      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        dir="rtl"
      >
        <Link href="/" className={pathname === '/' ? 'text-[#005c45] flex flex-col items-center' : 'text-slate-400 flex flex-col items-center'}>
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-bold">الرئيسية</span>
        </Link>
        <Link href="/ads" className={pathname === '/ads' ? 'text-[#005c45] flex flex-col items-center' : 'text-slate-400 flex flex-col items-center'}>
          <span className="text-xl">🔍</span>
          <span className="text-[10px] font-bold">البحث</span>
        </Link>
        <Link href="/add" className="flex flex-col items-center -mt-5">
          <span className="w-14 h-14 rounded-full bg-[#e27d18] text-white text-2xl font-bold flex items-center justify-center shadow-lg">
            +
          </span>
          <span className="text-[10px] font-bold text-[#e27d18] mt-1">أضف</span>
        </Link>
        <Link href="/messages" className={pathname === '/messages' ? 'text-[#005c45] flex flex-col items-center' : 'text-slate-400 flex flex-col items-center'}>
          <span className="text-xl">💬</span>
          <span className="text-[10px] font-bold">الرسائل</span>
        </Link>
        <Link href="/account" className={pathname === '/account' ? 'text-[#005c45] flex flex-col items-center' : 'text-slate-400 flex flex-col items-center'}>
          <span className="text-xl">👤</span>
          <span className="text-[10px] font-bold">حسابي</span>
        </Link>
      </nav>
    </>
  )
}