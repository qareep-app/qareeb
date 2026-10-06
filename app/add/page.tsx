'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

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

const paymentOptions = ['فودافون كاش', 'إنستاباي', 'Visa', 'Mastercard']

export default function AddAdPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [governorate, setGovernorate] = useState('القاهرة')
  const [city, setCity] = useState('')
  const [area, setArea] = useState('')
  const [payments, setPayments] = useState<string[]>(['فودافون كاش'])
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [locating, setLocating] = useState(false)
  const [locationLabel, setLocationLabel] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const priceNum = parseFloat(price) || 0
  const commission = Math.round(priceNum * 0.02)
  const net = priceNum - commission

  function togglePayment(p: string) {
    setPayments((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []).slice(0, 5)
    setFiles(selected)
    setPreviews(selected.map((f) => URL.createObjectURL(f)))
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setError('المتصفح لا يدعم تحديد الموقع')
      return
    }
    setLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        setLocationLabel(
          pos.coords.latitude.toFixed(5) + ', ' + pos.coords.longitude.toFixed(5)
        )
        setLocating(false)
      },
      () => {
        setError('تعذر الحصول على الموقع. اسمح بالوصول للموقع من المتصفح.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  async function uploadImages(): Promise<string[]> {
    const urls: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage.from('ads').upload(path, file)
      if (upErr) throw upErr
      const { data } = supabase.storage.from('ads').getPublicUrl(path)
      urls.push(data.publicUrl)
    }
    return urls
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim() || !priceNum || !category || !governorate) {
      setError('املأ الحقول المطلوبة (*)')
      return
    }
    if (lat === null || lng === null) {
      setError('حدد موقعك الجغرافي')
      return
    }
    if (files.length === 0) {
      setError('أضف صورة واحدة على الأقل')
      return
    }

    setLoading(true)

    try {
      const imageUrls = await uploadImages()
      const { data: { user } } = await supabase.auth.getUser()

      let ownerPhone: string | null = null
      try {
        const raw = localStorage.getItem('qareeb_user')
        if (raw) ownerPhone = (JSON.parse(raw) as { phone?: string }).phone || null
      } catch {}

      const { error: insertError } = await supabase.from('ads').insert({
        title: title.trim(),
        description: description.trim() || null,
        price: priceNum,
        category,
        governorate,
        area: [city, area].filter(Boolean).join(' - ') || null,
        status: 'published',
        user_id: user?.id || null,
        latitude: lat,
        longitude: lng,
        images: imageUrls,
        owner_phone: ownerPhone,
      })

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => router.push('/ads'), 1500)
    } catch (err: unknown) {
      console.error(err)
      let msg = 'حصل خطأ أثناء النشر'
      if (err instanceof Error) msg = err.message
      else if (typeof err === 'object' && err && 'message' in err) {
        msg = String((err as { message: string }).message)
      }
      setError(msg)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#fafaf7] px-4" dir="rtl">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100 max-w-sm">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="text-xl font-extrabold text-[#005c45] mb-2">تم نشر الإعلان</h2>
          <p className="text-slate-500 text-sm">جاري التحويل لصفحة الإعلانات...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fafaf7] text-slate-800 pb-24 md:pb-10" dir="rtl">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#005c45]">أضف إعلانك مجانًا</h1>
          <p className="text-sm text-slate-500 mt-1">3 إعلانات مجانية يوميًا</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <p className="text-sm font-bold mb-3">صور السلعة * (حتى 5)</p>
            <label className="border-2 border-dashed border-slate-200 rounded-xl h-28 flex flex-col items-center justify-center text-slate-400 text-sm cursor-pointer hover:border-[#005c45]">
              <span>+ اختر صور من الجهاز</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={onFilesChange} />
            </label>
            {previews.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-20 h-20 rounded-xl object-cover border shrink-0" />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            <div>
              <label className="block text-sm font-bold mb-1">عنوان الإعلان *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: آيفون 13 حالة ممتازة"
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
                <option value="">اختر الفئة</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">الوصف *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">السعر (ج.م) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50"
              />
              {priceNum > 0 && (
                <div className="mt-2 bg-[#f0f7f4] border border-[#c6e0d6] rounded-xl p-3 text-sm">
                  عمولة 2%: <strong>{commission.toLocaleString()}</strong> ج.م
                  <br />
                  صافي: <strong>{net.toLocaleString()}</strong> ج.م
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            <h2 className="font-extrabold text-[#005c45]">الموقع</h2>
            <div>
              <label className="block text-sm font-bold mb-1">المحافظة *</label>
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
              <label className="block text-sm font-bold mb-1">المدينة / القسم</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">الحي / الشارع</label>
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50"
              />
            </div>
            <button
              type="button"
              onClick={detectLocation}
              disabled={locating}
              className="w-full border border-[#005c45] text-[#005c45] py-3 rounded-xl font-bold text-sm disabled:opacity-50"
            >
              {locating ? 'جاري تحديد الموقع...' : 'استخدام موقعي الحالي'}
            </button>
            {locationLabel && (
              <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                تم حفظ الموقع: {locationLabel}
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <p className="text-sm font-bold mb-2">طرق الدفع</p>
            <div className="flex flex-wrap gap-2">
              {paymentOptions.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePayment(p)}
                  className={
                    'px-3 py-1.5 rounded-full text-xs font-bold border ' +
                    (payments.includes(p)
                      ? 'bg-[#005c45] text-white border-[#005c45]'
                      : 'bg-white text-slate-600 border-slate-200')
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#005c45] text-white py-3.5 rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? 'جاري النشر...' : 'نشر الإعلان'}
          </button>
        </form>
      </div>
    </main>
  )
}