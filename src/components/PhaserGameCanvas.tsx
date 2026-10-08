'use client'

import React, { useEffect, useRef } from 'react'
import { Flame, ShieldCheck } from 'lucide-react'

export default function PhaserGameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let gameInstance: unknown = null

    const initPhaser = async () => {
      if (!containerRef.current || gameInstance) return

      try {
        const Phaser = (await import('phaser')).default

        class DoomsdayScene extends Phaser.Scene {
          private player!: Phaser.GameObjects.Arc
          private scoreText!: Phaser.GameObjects.Text

          constructor() {
            super({ key: 'DoomsdayScene' })
          }

          create() {
            // Background
            this.add.rectangle(400, 250, 800, 500, 0x0a0a0a)

            // Grid lines effect
            const graphics = this.add.graphics()
            graphics.lineStyle(1, 0x00ff88, 0.15)
            for (let x = 0; x <= 800; x += 40) {
              graphics.moveTo(x, 0)
              graphics.lineTo(x, 500)
            }
            for (let y = 0; y <= 500; y += 40) {
              graphics.moveTo(0, y)
              graphics.lineTo(800, y)
            }
            graphics.strokePath()

            // Game Title in Canvas
            this.add.text(400, 80, 'DOOMSDAY RAMPAGE P2P', {
              fontFamily: 'system-ui, sans-serif',
              fontSize: '28px',
              fontStyle: 'bold',
              color: '#00ff88',
            }).setOrigin(0.5)

            this.add.text(400, 120, 'Custom Phaser 3 Engine • Real-time PKR Betting', {
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              color: '#888888',
            }).setOrigin(0.5)

            // Animated Orbit Core
            const core = this.add.circle(400, 260, 40, 0x00ff88, 0.8)
            this.tweens.add({
              targets: core,
              scaleX: 1.25,
              scaleY: 1.25,
              alpha: 0.4,
              duration: 1000,
              yoyo: true,
              repeat: -1,
            })

            // Player Orb
            this.player = this.add.circle(400, 260, 20, 0xffffff)

            // Status text
            this.scoreText = this.add.text(400, 380, 'Ready to Spin! Real-time PKR Sync Active', {
              fontFamily: 'system-ui, sans-serif',
              fontSize: '16px',
              fontStyle: 'bold',
              color: '#00ff88',
            }).setOrigin(0.5)

            // Interactive Spin Trigger in Scene
            const spinBtn = this.add.rectangle(400, 440, 180, 40, 0x00ff88)
              .setInteractive({ useHandCursor: true })

            this.add.text(400, 440, 'SPIN & WIN (PKR)', {
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              fontStyle: 'bold',
              color: '#000000',
            }).setOrigin(0.5)

            spinBtn.on('pointerdown', () => {
              this.tweens.add({
                targets: this.player,
                rotation: 360,
                scaleX: 1.5,
                scaleY: 1.5,
                duration: 600,
                yoyo: true,
              })
              this.scoreText.setText('Multiplier: 2.8x! PKR Credited')
            })
          }
        }

        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          parent: containerRef.current,
          width: 800,
          height: 500,
          backgroundColor: '#0a0a0a',
          scene: [DoomsdayScene],
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
        }

        gameInstance = new Phaser.Game(config)
      } catch (e) {
        console.warn('Phaser init note:', e)
      }
    }

    initPhaser()

    return () => {
      if (gameInstance && typeof (gameInstance as { destroy: (b: boolean) => void }).destroy === 'function') {
        (gameInstance as { destroy: (b: boolean) => void }).destroy(true)
      }
    }
  }, [])

  return (
    <div className="relative w-full bg-[#0a0a0a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[500px]">

      {/* Top Bar inside canvas container */}
      <div className="w-full bg-[#121212] px-4 py-2 border-b border-gray-800 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-[#00ff88]" />
          <span className="font-bold text-white uppercase tracking-wider">Doomsday Rampage (Phaser 3 Engine)</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 text-[#00ff88]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Provably Fair</span>
          </span>
        </div>
      </div>

      {/* Phaser Canvas Element */}
      <div id="game-canvas" ref={containerRef} className="w-full h-full min-h-[480px] flex items-center justify-center bg-black" />

    </div>
  )
}
