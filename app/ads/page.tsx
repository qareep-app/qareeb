'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '../../lib/supabase'

import CategoryBar from '../../components/CategoryBar'

type Ad = {
  id: number
  title: string
  description: string | null
  price: number
  category: string
  governorate: string
  area: string | null
  images?: string[] | null
  latitude?: number | null
  longitude?: number | null
  created_at?: string
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function AdsContent() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const searchParams = useSearchParams()
  const supabase = createClient()

  const cat = searchParams.get('cat') || ''
  const brand = searchParams.get('brand') || ''
  const gov = searchParams.get('gov') || ''
  const sort = searchParams.get('sort') || 'new'
  const lat = parseFloat(searchParams.get('lat') || '')
  const lng = parseFloat(searchParams.get('lng') || '')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('ads')
        .select('id, title, description, price, category, governorate, area, images, latitude, longitude, created_at')
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

  let filtered = ads.filter((ad) => {
    if (cat && !(ad.category || '').includes(cat)) return false
    if (brand && !(ad.title || '').includes(brand) && !(ad.description || '').includes(brand)) return false
    if (gov && ad.governorate !== gov) return false
    if (
      search &&
      !(ad.title || '').toLowerCase().includes(search.toLowerCase()) &&
      !(ad.description || '').toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }
    return true
  })

  if (sort === 'near' && !isNaN(lat) && !isNaN(lng)) {
    filtered = [...filtered].sort((a, b) => {
      const da =
        a.latitude != null && a.longitude != null
          ? distanceKm(lat, lng, a.latitude, a.longitude)
          : 99999
      const db =
        b.latitude != null && b.longitude != null
          ? distanceKm(lat, lng, b.latitude, b.longitude)
          : 99999
      return da - db
    })
  }

  return (
    <main className="min-h-screen bg-[#fafaf7] text-slate-800 pb-24 md:pb-8" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold mb-2 text-[#005c45]">كل الإعلانات</h1>
        <p className="text-xs text-slate-500 mb-5">
        <div className="mb-6">
        <CategoryBar />
</div>
          {cat && <span>فئة: {cat} · </span>}
          {gov && <span>منطقة: {gov} · </span>}
          {sort === 'near' ? 'الأقرب لك' : 'الأحدث'}
        </p>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث..."
          className="w-full mb-6 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm"
        />

        {loading ? (
          <p className="text-center text-slate-400 py-16">جاري التحميل...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <h3 className="text-lg font-bold mb-2">مفيش إعلانات حالياً</h3>
            <Link href="/add" className="inline-block bg-[#005c45] text-white px-5 py-2.5 rounded-xl font-bold text-sm">
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
                  <img src={ad.images[0]} alt={ad.title} className="h-40 w-full object-cover" />
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