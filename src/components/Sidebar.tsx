'use client'

import React from 'react'
import { Flame, Lock, Zap, Shield } from 'lucide-react'

export interface GameItem {
  id: string
  slug: string
  name: string
  category: string
  isActive: boolean
  badge?: string
}

export const DUMMY_GAMES: GameItem[] = [
  { id: '1', slug: 'doomsday-rampage', name: 'Doomsday Rampage', category: 'Action Slot', isActive: true, badge: 'HOT' },
  { id: '2', slug: 'aviator-pro', name: 'Aviator Crash', category: 'Multiplier', isActive: false, badge: 'NEW' },
  { id: '3', slug: 'crypto-crash', name: 'Moon Crash 1000x', category: 'Crash', isActive: false },
  { id: '4', slug: 'neon-mines', name: 'Neon Mines', category: 'Instant', isActive: false },
  { id: '5', slug: 'plinko-p2p', name: 'Plinko VIP', category: 'Casual', isActive: false },
  { id: '6', slug: 'roulette-live', name: 'PKR Live Roulette', category: 'Table', isActive: false },
]

interface SidebarProps {
  activeGameSlug: string
  onSelectGame: (slug: string) => void
}

export default function Sidebar({ activeGameSlug, onSelectGame }: SidebarProps) {
  return (
    <aside className="w-full lg:w-64 bg-[#1a1a1a] border-r border-gray-800 p-4 flex flex-col space-y-4 shrink-0">

      {/* Section Title */}
      <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-[#00ff88]" />
          <span className="text-xs font-extrabold text-gray-300 uppercase tracking-widest">
            Games Hub (6)
          </span>
        </div>
        <span className="text-[10px] font-bold text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded border border-[#00ff88]/30">
          LIVE
        </span>
      </div>

      {/* Game List */}
      <div className="space-y-2">
        {DUMMY_GAMES.map((game) => {
          const isSelected = game.slug === activeGameSlug
          return (
            <button
              key={game.id}
              onClick={() => game.isActive && onSelectGame(game.slug)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                isSelected
                  ? 'bg-[#00ff88]/10 border-[#00ff88] text-white shadow-lg shadow-[#00ff88]/10'
                  : game.isActive
                  ? 'bg-[#121212] border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white'
                  : 'bg-[#0d0d0d] border-gray-900 text-gray-600 cursor-not-allowed opacity-75'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                    isSelected
                      ? 'bg-[#00ff88] text-black'
                      : game.isActive
                      ? 'bg-gray-800 text-gray-300 group-hover:bg-[#00ff88]/20 group-hover:text-[#00ff88]'
                      : 'bg-gray-900 text-gray-700'
                  }`}
                >
                  {game.isActive ? (
                    <Flame className="w-4 h-4 fill-current" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>
                <div className="truncate">
                  <div className="text-xs font-extrabold truncate flex items-center space-x-1.5">
                    <span>{game.name}</span>
                  </div>
                  <div className="text-[10px] text-gray-500">{game.category}</div>
                </div>
              </div>

              {game.badge && (
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    game.badge === 'HOT'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  }`}
                >
                  {game.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Info Card in Sidebar */}
      <div className="mt-auto p-3.5 rounded-xl bg-[#0a0a0a] border border-gray-800 space-y-2 text-xs">
        <div className="flex items-center space-x-1.5 text-[#00ff88] font-bold text-[11px]">
          <Shield className="w-3.5 h-3.5" />
          <span>PKR Guaranteed Payouts</span>
        </div>
        <p className="text-[10px] text-gray-400 leading-relaxed">
          1 Chip = Rs. 1 PKR. Deposits via TRC20 USDT automatically convert at 1 USDT = 280 PKR.
        </p>
      </div>

    </aside>
  )
}
