'use client'

import { useEffect, useState } from 'react'

export default function Splash({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(true)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    // هل اتفرج على الـ splash في الجلسة دي؟
    const seen = sessionStorage.getItem('qareeb_splash_seen')
    if (seen) {
      setShow(false)
      return
    }

    const t1 = setTimeout(() => setFade(true), 1200)
    const t2 = setTimeout(() => {
      setShow(false)
      sessionStorage.setItem('qareeb_splash_seen', '1')
    }, 1800)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <>
      {show && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0b3d36] transition-opacity duration-500 ${
            fade ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="animate-pulse">
            <img
              src="/icon.png"
              alt="قريب"
              className="w-28 h-28 rounded-[28px] shadow-2xl object-cover"
            />
          </div>
          <div className="mt-6 text-center">
            <div className="text-white text-2xl font-extrabold tracking-wide">قريب</div>
            <div className="text-[#e27d18] text-sm font-bold mt-1">دكانك قريب</div>
          </div>
          <div className="mt-8 w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      <div className={show ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}>
        {children}
      </div>
    </>
  )
}