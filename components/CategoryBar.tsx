'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const categories = [
  { name: 'الرئيسية', icon: '🏠', slug: '', subs: [] as string[] },
  {
    name: 'سيارات وموتسيكلات',
    icon: '🚗',
    slug: 'سيارات',
    subs: ['الكل', 'تويوتا', 'هيونداي', 'نيسان', 'كيا', 'شيفروليه', 'مرسيدس', 'BMW', 'أودي'],
  },
  {
    name: 'قطع غيار وزيوت',
    icon: '🔧',
    slug: 'قطع-غيار',
    subs: ['الكل', 'زيوت', 'فلاتر', 'إطارات', 'بطاريات'],
  },
  {
    name: 'أجهزة كهربائية',
    icon: '🔌',
    slug: 'أجهزة',
    subs: ['الكل', 'ثلاجات', 'غسالات', 'تكييفات', 'شاشات'],
  },
  {
    name: 'عقارات',
    icon: '🏢',
    slug: 'عقارات',
    subs: ['الكل', 'شقق للبيع', 'شقق للإيجار', 'فلل', 'أراضي'],
  },
  {
    name: 'موبايلات وتابلت',
    icon: '📱',
    slug: 'موبايلات',
    subs: ['الكل', 'Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Huawei'],
  },
  {
    name: 'أثاث ومفروشات',
    icon: '🛋️',
    slug: 'أثاث',
    subs: ['الكل', 'غرف نوم', 'صالة', 'مطبخ'],
  },
  {
    name: 'ملابس وأحذية',
    icon: '👕',
    slug: 'ملابس',
    subs: ['الكل', 'رجالي', 'حريمي', 'أطفال'],
  },
  {
    name: 'حيوانات أليفة',
    icon: '🐾',
    slug: 'حيوانات',
    subs: ['الكل', 'قطط', 'كلاب', 'طيور'],
  },
  {
    name: 'وظائف وخدمات',
    icon: '💼',
    slug: 'وظائف',
    subs: ['الكل', 'وظائف', 'خدمات', 'صيانة'],
  },
  { name: 'أخرى', icon: '📦', slug: 'أخرى', subs: ['الكل'] },
]

const governorates = [
  'الكل', 'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية',
  'القليوبية', 'الغربية', 'المنوفية', 'البحيرة', 'أسيوط',
  'سوهاج', 'قنا', 'الأقصر', 'أسوان',
]

export default function CategoryBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [active, setActive] = useState(0)
  const [sub, setSub] = useState('الكل')
  const [showGov, setShowGov] = useState(false)

  const currentGov = searchParams.get('gov') || 'الكل'
  const sort = searchParams.get('sort') || ''

  const current = categories[active]

  function go(params: Record<string, string>) {
    const q = new URLSearchParams()
    const cat = params.cat ?? searchParams.get('cat') ?? ''
    const brand = params.brand ?? searchParams.get('brand') ?? ''
    const gov = params.gov ?? searchParams.get('gov') ?? ''
    const s = params.sort ?? searchParams.get('sort') ?? ''
    if (cat) q.set('cat', cat)
    if (brand && brand !== 'الكل') q.set('brand', brand)
    if (gov && gov !== 'الكل') q.set('gov', gov)
    if (s) q.set('sort', s)
    const qs = q.toString()
    router.push(qs ? '/ads?' + qs : '/ads')
  }

  function selectCategory(index: number) {
    setActive(index)
    setSub('الكل')
    const cat = categories[index]
    if (!cat.slug) {
      router.push('/')
      return
    }
    go({ cat: cat.slug, brand: '' })
  }

  function selectSub(s: string) {
    setSub(s)
    const cat = categories[active]
    if (!cat.slug) return
    go({ cat: cat.slug, brand: s === 'الكل' ? '' : s })
  }

  function selectGov(g: string) {
    setShowGov(false)
    go({ gov: g === 'الكل' ? '' : g })
  }

  function selectSort(s: string) {
    go({ sort: s })
  }

  function nearMe() {
    if (!navigator.geolocation) {
      alert('المتصفح لا يدعم تحديد الموقع')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const q = new URLSearchParams(searchParams.toString())
        q.set('sort', 'near')
        q.set('lat', String(pos.coords.latitude))
        q.set('lng', String(pos.coords.longitude))
        router.push('/ads?' + q.toString())
      },
      () => alert('اسمح بالوصول للموقع من المتصفح')
    )
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-end gap-2 mb-3 flex-wrap relative">
        <div className="relative">
          <button
            onClick={() => setShowGov(!showGov)}
            className={
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ' +
              (currentGov !== 'الكل'
                ? 'bg-[#005c45] text-white border-[#005c45]'
                : 'bg-white text-slate-600 border-slate-200')
            }
          >
            المنطقة {currentGov !== 'الكل' ? '· ' + currentGov : ''} ▼
          </button>
          {showGov && (
            <div className="absolute left-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto min-w-[140px]">
              {governorates.map((g) => (
                <button
                  key={g}
                  onClick={() => selectGov(g)}
                  className="block w-full text-right px-4 py-2 text-xs hover:bg-slate-50 font-bold"
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={nearMe}
          className={
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ' +
            (sort === 'near'
              ? 'bg-[#005c45] text-white border-[#005c45]'
              : 'bg-white text-slate-600 border-slate-200')
          }
        >
          القريب
        </button>

        <button
          onClick={() => selectSort('new')}
          className={
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ' +
            (sort === 'new' || !sort
              ? 'bg-[#005c45] text-white border-[#005c45]'
              : 'bg-white text-slate-600 border-slate-200')
          }
        >
          جديد
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat, i) => (
          <button
            key={cat.name}
            onClick={() => selectCategory(i)}
            className={
              'flex flex-col items-center min-w-[72px] p-2.5 rounded-2xl border transition shrink-0 ' +
              (active === i
                ? 'bg-[#e8f5f0] border-[#005c45] text-[#005c45]'
                : 'bg-white border-slate-100 text-slate-600')
            }
          >
            <span className="text-xl mb-1">{cat.icon}</span>
            <span className="text-[10px] font-bold leading-tight text-center">{cat.name}</span>
          </button>
        ))}
      </div>

      {current.subs.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pt-3 pb-1">
          {current.subs.map((s) => (
            <button
              key={s}
              onClick={() => selectSub(s)}
              className={
                'px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border ' +
                (sub === s
                  ? 'bg-[#005c45] text-white border-[#005c45]'
                  : 'bg-white text-slate-600 border-slate-200')
              }
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}