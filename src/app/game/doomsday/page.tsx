import React from 'react'
import PhaserGameCanvas from '@/components/PhaserGameCanvas'

export default function GameDoomsdayPage() {
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-[#00ff88]">Custom Game Area (/game/doomsday)</h1>
        <span className="text-xs text-gray-400">Phaser 3 Engine Connected</span>
      </div>
      <PhaserGameCanvas />
    </div>
  )
}
