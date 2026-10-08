'use client'

import React, { useEffect } from 'react'
import Script from 'next/script'
import { PlusCircle, MinusCircle, Info, Sparkles, TrendingUp, TrendingDown } from 'lucide-react'

interface GameAreaProps {
  chipBalance: number
  sessionStartBalance: number
  onSimulateWin: () => void
  onSimulateLoss: () => void
}

export default function GameArea({
  chipBalance,
  sessionStartBalance,
  onSimulateWin,
  onSimulateLoss,
}: GameAreaProps) {
  const sessionPL = chipBalance - sessionStartBalance

  useEffect(() => {
    // Dynamic script reload check if widget container mounts
    const scriptSrc = 'https://api.freedemo.games/assets/widget/v1/js/game.widget.js?v=1.1.0'
    let script = document.querySelector(`script[src="${scriptSrc}"]`) as HTMLScriptElement
    if (!script) {
      script = document.createElement('script')
      script.src = scriptSrc
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  return (
    <div className="w-full space-y-4">

      {/* 1. PKR JUGAD STICKY BAR DIRECTLY ABOVE WIDGET */}
      <div className="sticky top-[65px] z-30 bg-black border-2 border-[#00ff88] rounded-xl p-3 sm:p-4 shadow-xl shadow-[#00ff88]/10 space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

          {/* PKR Balance & Session P/L */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Real PKR Balance */}
            <div className="flex items-center space-x-2 bg-[#121212] px-3.5 py-1.5 rounded-lg border border-[#00ff88]/30">
              <span className="text-xs text-gray-400 uppercase font-bold">Balance:</span>
              <span className="text-base sm:text-lg font-extrabold text-[#00ff88] tracking-wide">
                Rs. {chipBalance.toLocaleString()} PKR
              </span>
            </div>

            {/* Session P/L */}
            <div className={`flex items-center space-x-2 bg-[#121212] px-3.5 py-1.5 rounded-lg border ${
              sessionPL >= 0 ? 'border-emerald-500/40' : 'border-red-500/40'
            }`}>
              <span className="text-xs text-gray-400 uppercase font-bold">Session P/L:</span>
              <div className={`flex items-center space-x-1 text-sm sm:text-base font-extrabold ${
                sessionPL >= 0 ? 'text-[#00ff88]' : 'text-red-400'
              }`}>
                {sessionPL >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>
                  {sessionPL >= 0 ? `+Rs. ${sessionPL.toLocaleString()}` : `-Rs. ${Math.abs(sessionPL).toLocaleString()}`} PKR
                </span>
              </div>
            </div>
          </div>

          {/* Info Badge */}
          <div className="flex items-center space-x-1.5 text-[11px] font-medium text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30">
            <Info className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>Game in DEMO mode. Real balance is above. 1 Chip = 1 PKR</span>
          </div>

        </div>
      </div>

      {/* 2. GAME WIDGET CONTAINER WITH USD OVERLAY COVER JUGAD */}
      <div className="relative w-full bg-[#0a0a0a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">

        {/* Top Cover Overlay to obscure iframe internal header USD if present */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-black to-transparent pointer-events-none z-10" />

        {/* Embedded Freedemo Widget */}
        <div className="relative w-full min-h-[520px] flex items-center justify-center bg-black">
          <div
            className="freedemo-game-widget w-full min-h-[520px]"
            data-game-slug="doomsday-rampage"
            data-publisher-id="7"
          />
        </div>

        <Script
          src="https://api.freedemo.games/assets/widget/v1/js/game.widget.js?v=1.1.0"
          strategy="lazyOnload"
        />
      </div>

      {/* 3. SIMULATION TESTING CONTROLS BELOW GAME */}
      <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#00ff88]" />
            <span className="text-xs font-extrabold text-white uppercase tracking-wider">
              Real-time P2P Balance Simulator
            </span>
          </div>
          <span className="text-[10px] text-gray-400">Updates Supabase & P/L Bar Instantaneously</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Win Simulation Button */}
          <button
            onClick={onSimulateWin}
            className="py-3 px-4 bg-[#00ff88]/15 hover:bg-[#00ff88]/25 text-[#00ff88] border border-[#00ff88]/50 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 active:scale-95 shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Simulate Win + Rs. 100 PKR</span>
          </button>

          {/* Loss Simulation Button */}
          <button
            onClick={onSimulateLoss}
            className="py-3 px-4 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/50 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 active:scale-95 shadow-md"
          >
            <MinusCircle className="w-4 h-4" />
            <span>Simulate Loss - Rs. 50 PKR</span>
          </button>
        </div>
      </div>

    </div>
  )
}
