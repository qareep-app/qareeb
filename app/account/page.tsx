'use client'

import Link from 'next/link'

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-[#fafaf7] text-slate-800 pb-24 md:pb-8" dir="rtl">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
          <div className="w-16 h-16 bg-[#005c45] text-white rounded-2xl flex items-center justify-center text-2xl font-extrabold mx-auto mb-3">
            ق
          </div>
          <h2 className="font-extrabold text-lg">زائر</h2>
          <p className="text-sm text-slate-500">سجّل دخول عشان تدير إعلاناتك</p>
          <Link
            href="/login"
            className="inline-block mt-4 bg-[#005c45] text-white px-5 py-2 rounded-xl text-sm font-bold"
          >
            تسجيل الدخول
          </Link>
        </div>

        <Link href="/add" className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 p-4 hover:border-[#005c45] transition">
          <div>
            <p className="font-bold">أضف إعلان جديد</p>
            <p className="text-xs text-slate-500">مجانًا – 3 إعلانات يوميًا</p>
          </div>
          <span className="text-[#e27d18] text-xl">★</span>
        </Link>

        <Link href="/ads" className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 p-4 hover:border-[#005c45] transition">
          <div>
            <p className="font-bold">إعلاناتي</p>
            <p className="text-xs text-slate-500">إدارة ومتابعة إعلاناتك</p>
          </div>
          <span>🏪</span>
        </Link>

        <Link href="/messages" className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 p-4 hover:border-[#005c45] transition">
          <div>
            <p className="font-bold">الرسائل</p>
            <p className="text-xs text-slate-500">محادثاتك مع البائعين والمشترين</p>
          </div>
          <span>💬</span>
        </Link>

        <p className="text-center text-xs text-slate-400 pt-4">
          قريب – دكانك قريب · صنع للسوق المصري
        </p>
      </div>
    </main>
  )
}