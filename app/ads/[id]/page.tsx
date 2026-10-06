'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

type Ad = {
  id: number
  title: string
  description: string | null
  price: number
  category: string
  governorate: string
  area: string | null
  images?: string[] | string | null
  owner_phone?: string | null
}

type Message = {
  id: number
  body: string
  created_at: string
  sender_name: string | null
  sender_phone: string | null
  ad_id: number
}

function getImages(images: Ad['images']): string[] {
  if (!images) return []
  if (Array.isArray(images)) return images.filter(Boolean)
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed)) return parsed.filter(Boolean)
    } catch {
      if (images.startsWith('http')) return [images]
    }
  }
  return []
}

function getUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('qareeb_user')
    return raw ? (JSON.parse(raw) as { phone?: string; name?: string }) : null
  } catch {
    return null
  }
}

export default function AdDetailsPage() {
  const params = useParams()
  const supabase = createClient()
  const adId = Number(params.id)

  const [ad, setAd] = useState<Ad | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ phone?: string; name?: string } | null>(null)

  async function loadMessages() {
    const { data } = await supabase
      .from('messages')
      .select('id, body, created_at, sender_name, sender_phone, ad_id')
      .eq('ad_id', adId)
      .order('created_at', { ascending: true })
    setMessages((data as Message[]) || [])
  }

  useEffect(() => {
    setUser(getUser())
    async function load() {
      const { data } = await supabase
        .from('ads')
        .select('id, title, description, price, category, governorate, area, images, owner_phone')
        .eq('id', adId)
        .single()
      setAd((data as Ad) || null)
      await loadMessages()
      setLoading(false)
    }
    load()
  }, [adId])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const current = getUser()
    if (!current?.phone) {
      window.location.href = '/login'
      return
    }
    if (!text.trim()) return

    setSending(true)
    const body = text.trim()

    const { data, error: insErr } = await supabase
      .from('messages')
      .insert({
        ad_id: adId,
        body,
        sender_name: current.name || current.phone,
        sender_phone: current.phone,
      })
      .select('id, body, created_at, sender_name, sender_phone, ad_id')
      .single()

    setSending(false)

    if (insErr) {
      setError(insErr.message)
      return
    }

    setText('')
    if (data) setMessages((prev) => [...prev, data as Message])
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#fafaf7]" dir="rtl">
        <p className="text-slate-400">جاري التحميل...</p>
      </main>
    )
  }

  if (!ad) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#fafaf7]" dir="rtl">
        <p className="font-bold mb-4">الإعلان غير موجود</p>
        <Link href="/ads" className="text-[#005c45] font-bold">العودة للإعلانات</Link>
      </main>
    )
  }

  const imgs = getImages(ad.images)
  const cover = imgs[0] || null
  const canEdit =
    !!user?.phone && (!ad.owner_phone || ad.owner_phone === user.phone)

  return (
    <main className="min-h-screen bg-[#fafaf7] text-slate-800 pb-28 md:pb-10" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link href="/ads" className="text-sm text-[#005c45] font-bold mb-4 inline-block">
          → رجوع للإعلانات
        </Link>

        {cover ? (
          <img src={cover} alt={ad.title} className="h-56 md:h-80 w-full object-cover rounded-3xl mb-5" />
        ) : (
          <div className="h-56 bg-[#eef5f1] rounded-3xl flex items-center justify-center text-slate-400 mb-5">
            لا توجد صورة
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-100 p-5 md:p-7 space-y-4 mb-6">
          <div>
            <p className="text-[#005c45] font-extrabold text-2xl mb-1">
              {Number(ad.price).toLocaleString()} ج.م
            </p>
            <h1 className="text-xl font-extrabold">{ad.title}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {ad.governorate}
              {ad.area ? ' · ' + ad.area : ''} · {ad.category}
            </p>

            {canEdit && (
              <div className="flex gap-2 mt-3">
                <Link
                  href={'/ads/' + ad.id + '/edit'}
                  className="text-sm font-bold text-[#005c45] border border-[#005c45] px-4 py-2 rounded-full hover:bg-[#f0f7f4]"
                >
                  تعديل الإعلان
                </Link>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h2 className="font-extrabold mb-2">الوصف</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
              {ad.description || 'لا يوجد وصف'}
            </p>
          </div>

          <div className="bg-[#f0f7f4] border border-[#c6e0d6] rounded-2xl p-4 text-sm">
            <p className="font-bold text-[#005c45] mb-1">نظام قريب الآمن</p>
            <p>التواصل والتعليقات داخل الموقع فقط · عمولة 2%</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-5 md:p-7">
          <h2 className="font-extrabold text-lg mb-4">
            المحادثة على الإعلان ({messages.length})
          </h2>

          <div className="space-y-3 mb-5 max-h-80 overflow-y-auto">
            {messages.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">
                مفيش رسائل لسه — كن أول واحد يتواصل مع البائع
              </p>
            )}
            {messages.map((m) => (
              <div key={m.id} className="bg-slate-50 rounded-2xl px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-[#005c45]">
                    {m.sender_name || m.sender_phone || 'مستخدم'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(m.created_at).toLocaleString('ar-EG')}
                  </span>
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-wrap">{m.body}</p>
              </div>
            ))}
          </div>

          {user?.phone ? (
            <form onSubmit={sendMessage} className="space-y-2">
              <p className="text-xs text-slate-500">
                تكتب كـ <strong className="text-[#005c45]">{user.name || user.phone}</strong>
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="اكتب رسالتك للبائع أو رد على مشتري..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 resize-none focus:outline-none focus:ring-2 focus:ring-[#005c45]"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="w-full bg-[#005c45] text-white py-3 rounded-xl font-bold disabled:opacity-50"
              >
                {sending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
              </button>
            </form>
          ) : (
            <div className="text-center bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-600 mb-3">سجّل دخول عشان تراسل البائع أو ترد</p>
              <Link
                href="/login"
                className="inline-block bg-[#005c45] text-white px-5 py-2.5 rounded-xl text-sm font-bold"
              >
                تسجيل الدخول
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}