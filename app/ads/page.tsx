'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '../../lib/supabase'

type Ad = {
  id: number
  title: string
  description: string | null
  price: number
  category: string
  governorate: string
  area: string | null
  images?: string[] | null
}

function AdsContent() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const cat = searchParams.get('cat') || ''
    if (cat) setCategory(cat)

    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('ads')
        .select('id, title, description, price, category, governorate, area, images')
        .order('created_at', { ascending: false })

      if (error) {
        console.error(error)
        setAds([])
      } else {
        setAds((data as Ad[]) || [])
      }
      setLoading(false)
    }
    load()
  }, [searchParams])

  const filtered = ads.filter((ad) => {
    if (category && !(ad.category || '').includes(category)) return false
    if (
      search &&
      !(ad.title || '').toLowerCase().includes(search.toLowerCase()) &&
      !(ad.description || '').toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }
    return true
  })

  return (
    <main className="min-h-screen bg-[#fafaf7] text-slate-800 pb-24 md:pb-8" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold mb-5 text-[#005c45]">كل الإعلانات</h1>

        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm"
          >
            <option value="">كل الفئات</option>
            <option value="موبايلات">موبايلات وتابلت</option>
            <option value="عقارات">عقارات</option>
            <option value="سيارات">سيارات وموتسيكلات</option>
            <option value="ملابس">ملابس وأحذية</option>
            <option value="أثاث">أثاث ومفروشات</option>
            <option value="أجهزة">أجهزة كهربائية</option>
            <option value="وظائف">وظائف وخدمات</option>
            <option value="حيوانات">حيوانات أليفة</option>
            <option value="أخرى">أخرى</option>
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث..."
            className="flex-1 min-w-[160px] px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm"
          />
        </div>

        {loading ? (
          <p className="text-center text-slate-400 py-16">جاري التحميل...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <h3 className="text-lg font-bold text-slate-700 mb-2">مفيش إعلانات حالياً</h3>
            <Link
              href="/add"
              className="inline-block bg-[#005c45] text-white px-5 py-2.5 rounded-xl font-bold text-sm"
            >
              + أضف إعلانك
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ad) => (
              <Link
                key={ad.id}
                href={'/ads/' + ad.id}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-[#005c45] transition block"
              >
                {ad.images && ad.images[0] ? (
                  <img
                    src={ad.images[0]}
                    alt={ad.title}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="h-40 bg-[#eef5f1] flex items-center justify-center text-slate-400 text-sm">
                    لا توجد صورة
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-bold text-sm mb-1 line-clamp-2">{ad.title}</h2>
                  <p className="text-[#005c45] font-extrabold text-lg mb-1">
                    {Number(ad.price).toLocaleString()} ج.م
                  </p>
                  <p className="text-xs text-slate-500">
                    {ad.governorate}
                    {ad.area ? ' • ' + ad.area : ''} • {ad.category}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default function AdsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center" dir="rtl">جاري التحميل...</div>}>
      <AdsContent />
    </Suspense>
  )
}