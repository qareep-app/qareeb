'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '../../../../lib/supabase'

const categories = [
  'موبايلات وتابلت',
  'عقارات (بيع وإيجار)',
  'سيارات وموتسيكلات',
  'ملابس وأحذية',
  'أثاث ومفروشات',
  'أجهزة كهربائية ومنزلية',
  'وظائف وخدمات',
  'حيوانات أليفة',
  'أخرى',
]

const governorates = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية',
  'القليوبية', 'الغربية', 'المنوفية', 'البحيرة', 'أسيوط',
  'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'أخرى',
]

function getUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('qareeb_user')
    return raw ? (JSON.parse(raw) as { phone?: string }) : null
  } catch {
    return null
  }
}

export default function EditAdPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const adId = Number(params.id)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allowed, setAllowed] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [governorate, setGovernorate] = useState('')
  const [area, setArea] = useState('')

  useEffect(() => {
    async function load() {
      const user = getUser()
      if (!user?.phone) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('ads')
        .select('title, description, price, category, governorate, area, owner_phone')
        .eq('id', adId)
        .single()

      if (error || !data) {
        setError('الإعلان غير موجود')
        setLoading(false)
        return
      }

      // يسمح بالتعديل لو المعلن هو نفس رقم الدخول، أو لو مفيش owner_phone قديم
      if (data.owner_phone && data.owner_phone !== user.phone) {
        setError('مش مسموح تعدّل إعلان غيرك')
        setAllowed(false)
        setLoading(false)
        return
      }

      setAllowed(true)
      setTitle(data.title || '')
      setDescription(data.description || '')
      setPrice(String(data.price || ''))
      setCategory(data.category || '')
      setGovernorate(data.governorate || 'القاهرة')
      setArea(data.area || '')
      setLoading(false)
    }
    load()
  }, [adId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const priceNum = parseFloat(price) || 0
    if (!title.trim() || !priceNum || !category) {
      setError('املأ العنوان والسعر والفئة')
      return
    }

    setSaving(true)
    const user = getUser()

    const { error: upErr } = await supabase
      .from('ads')
      .update({
        title: title.trim(),
        description: description.trim() || null,
        price: priceNum,
        category,
        governorate,
        area: area.trim() || null,
        owner_phone: user?.phone || null,
      })
      .eq('id', adId)

    setSaving(false)

    if (upErr) {
      setError(upErr.message)
      return
    }

    router.push('/ads/' + adId)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#fafaf7]" dir="rtl">
        <p className="text-slate-400">جاري التحميل...</p>
      </main>
    )
  }

  if (!allowed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#fafaf7] px-4" dir="rtl">
        <p className="font-bold mb-4 text-red-600">{error || 'غير مسموح'}</p>
        <Link href={'/ads/' + adId} className="text-[#005c45] font-bold">رجوع للإعلان</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fafaf7] text-slate-800 pb-24 md:pb-10" dir="rtl">
      <div className="max-w-lg mx-auto px-4 py-6">
        <Link href={'/ads/' + adId} className="text-sm text-[#005c45] font-bold mb-4 inline-block">
          → رجوع للإعلان
        </Link>
        <h1 className="text-2xl font-extrabold text-[#005c45] mb-6">تعديل الإعلان</h1>

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">العنوان *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">الفئة *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">الوصف</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">السعر *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">المحافظة</label>
            <select
              value={governorate}
              onChange={(e) => setGovernorate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50"
            >
              {governorates.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">المنطقة</label>
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#005c45] text-white py-3.5 rounded-xl font-bold disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </form>
      </div>
    </main>
  )
}