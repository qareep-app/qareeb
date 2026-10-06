'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

export default function CategoryBar() {
  const router = useRouter()
  const [active, setActive] = useState(0)
  const [sub, setSub] = useState('الكل')

  const current = categories[active]

  function selectCategory(index: number) {
    setActive(index)
    setSub('الكل')
    const cat = categories[index]
    if (!cat.slug) {
      router.push('/')
      return
    }
    router.push('/ads?cat=' + encodeURIComponent(cat.slug))
  }

  function selectSub(s: string) {
    setSub(s)
    const cat = categories[active]
    if (!cat.slug) return
    if (s === 'الكل') {
      router.push('/ads?cat=' + encodeURIComponent(cat.slug))
    } else {
      router.push(
        '/ads?cat=' + encodeURIComponent(cat.slug) + '&brand=' + encodeURIComponent(s)
      )
    }
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-end gap-2 mb-3 flex-wrap">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-600">
          المنطقة ▼
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-600">
          القريب
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-600">
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
                'px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition ' +
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