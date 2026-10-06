'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '../../lib/supabase'

type Message = {
  id: number
  body: string
  created_at: string
  sender_name: string | null
  sender_phone: string | null
}

type Conversation = {
  id: number
  ad_id: number
}

function getCurrentUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('qareeb_user')
    if (!raw) return null
    return JSON.parse(raw) as { phone?: string; name?: string }
  } catch {
    return null
  }
}

function MessagesContent() {
  const searchParams = useSearchParams()
  const adId = searchParams.get('ad')
  const supabase = createClient()

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [adTitle, setAdTitle] = useState('')
  const [user, setUser] = useState<{ phone?: string; name?: string } | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  useEffect(() => {
    async function init() {
      if (!adId) {
        setLoading(false)
        return
      }

      const { data: ad } = await supabase
        .from('ads')
        .select('title')
        .eq('id', adId)
        .single()
      if (ad) setAdTitle(ad.title)

      let { data: conv } = await supabase
        .from('conversations')
        .select('id, ad_id')
        .eq('ad_id', adId)
        .limit(1)
        .maybeSingle()

      if (!conv) {
        const { data: created } = await supabase
          .from('conversations')
          .insert({ ad_id: Number(adId) })
          .select('id, ad_id')
          .single()
        conv = created
      }

      if (conv) {
        setConversation(conv as Conversation)
        const { data: msgs } = await supabase
          .from('messages')
          .select('id, body, created_at, sender_name, sender_phone')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true })
        setMessages((msgs as Message[]) || [])
      }

      setLoading(false)
    }
    init()
  }, [adId])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !conversation) return

    const current = getCurrentUser()
    if (!current?.phone) {
      window.location.href = '/login'
      return
    }

    setSending(true)
    const body = text.trim()
    setText('')

    const displayName = current.name || current.phone

    const { data } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        body,
        sender_name: displayName,
        sender_phone: current.phone,
      })
      .select('id, body, created_at, sender_name, sender_phone')
      .single()

    if (data) {
      setMessages((prev) => [...prev, data as Message])
    }
    setSending(false)
  }

  if (!adId) {
    return (
      <main className="min-h-screen bg-[#fafaf7] text-slate-800 pb-24 md:pb-8" dir="rtl">
        <div className="max-w-lg mx-auto px-4 py-10">
          <h1 className="text-2xl font-extrabold text-[#005c45] mb-1">الرسائل</h1>
          <p className="text-sm text-slate-500 mb-8">محادثاتك مع البائعين والمشترين</p>
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center">
            <div className="text-4xl mb-3 text-slate-300">💬</div>
            <h3 className="font-extrabold text-slate-700 mb-2">مفيش محادثات لسه</h3>
            <p className="text-sm text-slate-500 mb-5">
              افتح أي إعلان واضغط «تواصل مع البائع» تبدأ المحادثة.
            </p>
            <Link href="/ads" className="inline-block bg-[#005c45] text-white px-5 py-2.5 rounded-xl font-bold text-sm">
              تصفح الإعلانات
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#fafaf7]" dir="rtl">
        <p className="text-slate-400">جاري فتح المحادثة...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fafaf7] text-slate-800 flex flex-col pb-20 md:pb-0" dir="rtl">
      <div className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href={'/ads/' + adId} className="text-[#005c45] font-bold text-sm">→</Link>
          <div>
            <p className="font-extrabold text-sm line-clamp-1">{adTitle || 'محادثة'}</p>
            <p className="text-[11px] text-slate-400">تواصل عبر قريب فقط · بدون رقم هاتف</p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 space-y-3 overflow-y-auto">
        {!user?.phone && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl p-3 text-center">
            لازم تسجّل دخول عشان تبعت رسالة.{' '}
            <Link href="/login" className="font-bold underline">تسجيل الدخول</Link>
          </div>
        )}

        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-10">
            ابدأ المحادثة مع البائع — اكتب أول رسالة
          </div>
        )}

        {messages.map((m) => {
          const mine = user?.phone && m.sender_phone === user.phone
          return (
            <div key={m.id} className={'flex ' + (mine ? 'justify-start' : 'justify-end')}>
              <div
                className={
                  'rounded-2xl px-4 py-2.5 max-w-[85%] shadow-sm ' +
                  (mine
                    ? 'bg-[#005c45] text-white rounded-tr-sm'
                    : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm')
                }
              >
                <p className={'text-[11px] font-bold mb-1 ' + (mine ? 'text-white/80' : 'text-[#005c45]')}>
                  {m.sender_name || m.sender_phone || 'مستخدم'}
                </p>
                <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                <p className={'text-[10px] mt-1 ' + (mine ? 'text-white/60' : 'text-slate-400')}>
                  {new Date(m.created_at).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <form
        onSubmit={sendMessage}
        className="sticky bottom-16 md:bottom-0 bg-white border-t border-slate-100 px-4 py-3"
      >
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={user?.phone ? 'اكتب رسالتك...' : 'سجّل دخول أولًا...'}
            disabled={!user?.phone}
            className="flex-1 border border-slate-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005c45]/20 disabled:bg-slate-50"
          />
          <button
            type="submit"
            disabled={sending || !text.trim() || !user?.phone}
            className="bg-[#005c45] text-white px-5 py-2.5 rounded-full text-sm font-bold disabled:opacity-50"
          >
            إرسال
          </button>
        </div>
      </form>
    </main>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center" dir="rtl">جاري التحميل...</div>}>
      <MessagesContent />
    </Suspense>
  )
}