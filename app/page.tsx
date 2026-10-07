'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '../lib/supabase'
import CategoryBar from '../components/CategoryBar'

export const dynamic = 'force-dynamic'

type Ad = {
  id: number
  title: string
  price: number
  governorate: string
  area: string | null
  images?: string[] | null
}

export default function Home() {
  const [ads, setAds] = useState<Ad[]>([])
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('ads')
      .select('id, title, price, governorate, area, images')
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => setAds((data as Ad[]) || []))
  }, [])

  return (
    <main className="bg-[#f7faf8] text-slate-800 pb-24 md:pb-0" dir="rtl">
      <section className="max-w-6xl mx-auto px-4 py-8 md:py-12 grid md:grid-cols-2 gap-8 items-center">
        <div className="order-2 md:order-1 text-center md:text-right">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-snug mb-4">
            بتدور على ايه؟
            <br />
            <span className="text-[#e27d18]">دكانك قريب منك</span>
          </h1>
          <p className="text-slate-500 mb-6 max-w-md mx-auto md:mx-0">
            بيع واشتري من الناس اللي حواليك - من غير توصيل غالي ولا مشاوير بعيدة
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <Link href="/ads" className="bg-[#e27d18] text-white px-6 py-3 rounded-full font-bold text-sm">
              وريني اللي قريب مني
            </Link>
            <Link href="/ads" className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-full font-bold text-sm">
              تصفح كل الإعلانات
            </Link>
          </div>
        </div>
        <div className="order-1 md:order-2 rounded-3xl overflow-hidden shadow-lg">
          <img src="/qareep.jpeg" alt="قريب" className="w-full h-56 md:h-80 object-cover" />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-6">
        <Suspense fallback={<div className="h-24 bg-white rounded-2xl animate-pulse" />}>
          <CategoryBar />
        </Suspense>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-10 grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
          <div className="text-3xl mb-2">🛡️</div>
          <h3 className="font-extrabold mb-1">آمن وموثوق</h3>
          <p className="text-sm text-slate-500">تواصل داخل قريب فقط</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
          <div className="text-3xl mb-2">📍</div>
          <h3 className="font-extrabold mb-1">قريب منك</h3>
          <p className="text-sm text-slate-500">إعلانات في حيك</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="font-extrabold mb-1">عمولة 2% فقط</h3>
          <p className="text-sm text-slate-500">أقل عمولة على البائع</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-5">
          <Link href="/ads" className="text-sm font-bold text-[#005c45]">عرض الكل</Link>
          <h2 className="text-xl font-extrabold">أحدث الإعلانات</h2>
        </div>
        {ads.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <p className="font-bold mb-2">مفيش إعلانات لسه</p>
            <Link href="/add" className="inline-block bg-[#e27d18] text-white px-5 py-2.5 rounded-full text-sm font-bold">
              أضف إعلانك
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ads.map((ad) => (
              <Link key={ad.id} href={'/ads/' + ad.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                {ad.images && ad.images[0] ? (
                  <img src={ad.images[0]} alt={ad.title} className="h-32 w-full object-cover" />
                ) : (
                  <div className="h-32 bg-[#eef5f1] flex items-center justify-center text-slate-400 text-xs">لا صورة</div>
                )}
                <div className="p-3">
                  <p className="text-[#005c45] font-extrabold">{Number(ad.price).toLocaleString()} ج.م</p>
                  <h3 className="font-bold text-sm">{ad.title}</h3>
                  <p className="text-xs text-slate-500">{ad.governorate}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="rounded-3xl bg-[#005c45] text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-right">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">عندك حاجة للبيع؟</h2>
            <p className="text-white/80 text-sm mb-4">وصل إعلانك للناس اللي حواليك في دقائق</p>
            <Link href="/add" className="inline-block bg-white text-[#005c45] px-6 py-3 rounded-full font-bold text-sm">
              + أضف إعلانك الآن
            </Link>
          </div>
          <div className="w-28 h-44 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center p-3">
            <img src="/icon.png" alt="قريب" className="w-20 h-20 rounded-[22px] object-cover shadow-lg" />
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-slate-100 pt-10 pb-24 md:pb-10" dir="rtl">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/icon.png" alt="قريب" className="w-8 h-8 rounded-full object-cover" />
              <div>
                <div className="font-extrabold text-[#005c45]">قريب</div>
                <div className="text-[10px] text-[#e27d18] font-bold">دكانك قريب</div>
              </div>
            </div>
            <p className="text-slate-500 text-xs">منصة الإعلانات المبوبة اللي بتخلي الدكان قريب منك.</p>
          </div>
          <div>
            <h4 className="font-extrabold mb-3">قريب</h4>
            <ul className="space-y-2 text-slate-500 text-xs">
              <li><Link href="/about">عن قريب</Link></li>
              <li><Link href="/how-it-works">كيف يعمل؟</Link></li>
              <li><Link href="/privacy">سياسة الخصوصية</Link></li>
              <li><Link href="/terms">الشروط والأحكام</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-extrabold mb-3">المساعدة</h4>
            <ul className="space-y-2 text-slate-500 text-xs">
              <li><Link href="/faq">الأسئلة الشائعة</Link></li>
              <li><Link href="/safety">دليل الأمان</Link></li>
              <li><Link href="/contact">تواصل معنا</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-extrabold mb-3">للشركاء</h4>
            <ul className="space-y-2 text-slate-500 text-xs">
              <li><Link href="/partners">تاجر قريب</Link></li>
              <li><Link href="/partners-terms">الشروط للشركاء</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          2026 قريب. جميع الحقوق محفوظة
        </div>
      </footer>
    </main>
  )
}