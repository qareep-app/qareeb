'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

const DEV_OTP = '123456'
const DEV_MODE = true // خليه false بعد ربط Twilio

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  function fullPhone() {
    let p = phone.replace(/\D/g, '')
    if (p.startsWith('0')) p = p.slice(1)
    return '+20' + p
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (phone.replace(/\D/g, '').length < 10) {
      setError('اكتب رقم موبايل صحيح')
      return
    }

    setLoading(true)

    if (DEV_MODE) {
      // وضع التطوير: منغير SMS
      setInfo('وضع التطوير: استخدم الرمز 123456')
      setStep('otp')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhone(),
    })

    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setInfo('تم إرسال الرمز إلى ' + fullPhone())
    setStep('otp')
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (DEV_MODE) {
      if (otp !== DEV_OTP) {
        setError('الرمز غير صحيح')
        setLoading(false)
        return
      }
      // حفظ الجلسة محليًا للتطوير
      localStorage.setItem(
        'qareeb_user',
        JSON.stringify({ phone: fullPhone(), loggedInAt: Date.now() })
      )
      setLoading(false)
      router.push('/account')
      return
    }

    const { error } = await supabase.auth.verifyOtp({
      phone: fullPhone(),
      token: otp,
      type: 'sms',
    })

    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/account')
  }

  return (
    <main className="min-h-screen bg-[#f7faf8] flex items-center justify-center px-4 py-12" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#e8f5f0] flex items-center justify-center text-2xl mb-3">
            📱
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">تسجيل الدخول</h1>
          <p className="text-sm text-slate-500 mt-1 text-center">
            ادخل برقم الموبايل فقط – مفيش باسورد
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1.5">رقم الموبايل</label>
              <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                <span className="bg-slate-50 px-3 flex items-center text-sm font-bold text-slate-500 border-l border-slate-200">
                  +20
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10xxxxxxxx"
                  className="flex-1 px-4 py-3 text-sm outline-none"
                  dir="ltr"
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {info && <p className="text-emerald-600 text-sm">{info}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#005c45] text-white py-3.5 rounded-xl font-bold disabled:opacity-50"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <p className="text-sm text-slate-500 text-center">
              اكتب الرمز {DEV_MODE ? '(للتطوير: 123456)' : 'اللي وصلك على الموبايل'}
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="------"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-center text-lg tracking-widest outline-none"
              dir="ltr"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#005c45] text-white py-3.5 rounded-xl font-bold disabled:opacity-50"
            >
              {loading ? 'جاري التحقق...' : 'تأكيد الدخول'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('phone')
                setOtp('')
                setError(null)
              }}
              className="w-full text-sm text-slate-500 font-bold"
            >
              تغيير الرقم
            </button>
          </form>
        )}

        <div className="mt-6 bg-slate-50 rounded-xl p-3 text-xs text-slate-500 text-center">
          🔒 بنستخدم رقم الموبايل فقط للتحقق. مفيش كلمات مرور.
        </div>
        <p className="text-center mt-5">
          <Link href="/" className="text-sm font-bold text-[#005c45]">
            العودة للرئيسية
          </Link>
        </p>
      </div>
    </main>
  )
}