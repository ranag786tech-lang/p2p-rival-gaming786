'use client'

import React, { useEffect } from 'react'

export default function GameWidget() {
  useEffect(() => {
    const scriptSrc = 'https://api.freedemo.games/assets/widget/v1/js/game.widget.js?v=1.1.0'

    // Check if script already exists to avoid duplicate injections
    let script = document.querySelector(`script[src="${scriptSrc}"]`) as HTMLScriptElement
    if (!script) {
      script = document.createElement('script')
      script.src = scriptSrc
      script.async = true
      document.body.appendChild(script)
    }

    return () => {
      // Cleanup script on unmount if needed
    }
  }, [])

  return (
    <div className="relative w-full max-w-5xl mx-auto my-6 bg-slate-950 border border-amber-500/30 rounded-2xl p-2 md:p-4 shadow-2xl shadow-amber-900/20 overflow-hidden">
      {/* Visual Header / Glow */}
      <div className="flex items-center justify-between pb-3 px-2 border-b border-gray-800 mb-3">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
            FEATURED GAME: DOOMSDAY RAMPAGE
          </span>
        </div>
        <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          Free Demo Mode
        </span>
      </div>

      {/* Game Widget Container */}
      <div className="relative w-full min-h-[500px] flex items-center justify-center bg-black/60 rounded-xl overflow-hidden">
        <div
          className="freedemo-game-widget w-full h-full min-h-[500px]"
          data-game-slug="doomsday-rampage"
          data-publisher-id="7"
        />
      </div>
    </div>
  )
}
