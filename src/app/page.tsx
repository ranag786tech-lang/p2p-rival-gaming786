'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Flame, PlusCircle, ArrowUpRight, Coins, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import GameArea from '@/components/GameArea'
import DepositModal from '@/components/DepositModal'
import WithdrawModal from '@/components/WithdrawModal'
import RealAuthModal from '@/components/RealAuthModal'
import { supabase, Profile } from '@/lib/supabaseClient'

export default function Home() {
  const [activeGameSlug, setActiveGameSlug] = useState('doomsday-rampage')
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [chipBalance, setChipBalance] = useState<number>(0)
  const [sessionStartBalance, setSessionStartBalance] = useState<number>(0)
  const [loadingUser, setLoadingUser] = useState(true)

  // Initialize or Listen to Realtime Balance Updates
  const initUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (prof) {
          setProfile(prof)
          setChipBalance(prof.chip_balance)
          setSessionStartBalance(prof.chip_balance)
        }
      } else {
        // Auto show Auth Modal for first visit / unregistered
        setIsAuthOpen(true)
      }
    } catch (e) {
      console.warn('Init user note:', e)
    } finally {
      setLoadingUser(false)
    }
  }, [])

  useEffect(() => {
    initUser()
  }, [initUser])

  // Supabase Realtime Subscription for chip_balance updates
  useEffect(() => {
    if (!profile?.id) return

    const channel = supabase
      .channel(`profile-${profile.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${profile.id}` },
        (payload) => {
          if (payload.new && typeof payload.new.chip_balance === 'number') {
            setChipBalance(payload.new.chip_balance)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id])

  // Real Simulation Handlers
  const handleSimulateWin = async () => {
    const winAmount = 100
    const newBal = chipBalance + winAmount
    setChipBalance(newBal)

    if (profile) {
      await supabase.from('profiles').update({ chip_balance: newBal }).eq('id', profile.id)
      await supabase.from('transactions').insert({
        user_id: profile.id,
        type: 'win',
        amount_pkr: winAmount,
        status: 'approved',
      })
    }
  }

  const handleSimulateLoss = async () => {
    const lossAmount = 50
    const newBal = Math.max(0, chipBalance - lossAmount)
    setChipBalance(newBal)

    if (profile) {
      await supabase.from('profiles').update({ chip_balance: newBal }).eq('id', profile.id)
      await supabase.from('transactions').insert({
        user_id: profile.id,
        type: 'loss',
        amount_pkr: lossAmount,
        status: 'approved',
      })
    }
  }

  const handleDepositSuccess = (amountPkr: number) => {
    const updated = chipBalance + amountPkr
    setChipBalance(updated)
    if (profile) {
      supabase.from('profiles').update({ chip_balance: updated }).eq('id', profile.id)
    }
  }

  const handleWithdrawSuccess = (amountPkr: number) => {
    const updated = Math.max(0, chipBalance - amountPkr)
    setChipBalance(updated)
  }

  const handleAuthSuccess = (loggedProfile: Profile) => {
    setProfile(loggedProfile)
    setChipBalance(loggedProfile.chip_balance)
    setSessionStartBalance(loggedProfile.chip_balance)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 flex flex-col font-sans selection:bg-[#00ff88] selection:text-black">

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#1a1a1a] border-b border-gray-800 px-4 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo / Brand */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#00ff88] p-0.5 shadow-lg shadow-[#00ff88]/20 flex items-center justify-center">
              <Flame className="w-6 h-6 text-black fill-black" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider text-[#00ff88] neon-text">
                P2P HUB
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold text-gray-400 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
                PKR Gaming
              </span>
            </div>
          </Link>

          {/* Balance & Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">

            {/* Realtime PKR Balance */}
            <div className="flex items-center space-x-2 bg-[#0a0a0a] border border-[#00ff88]/40 px-3.5 py-1.5 rounded-xl shadow-inner">
              <Coins className="w-4 h-4 text-[#00ff88]" />
              <div className="text-xs sm:text-sm font-extrabold text-[#00ff88]">
                {loadingUser ? (
                  <span className="text-gray-500">Loading...</span>
                ) : (
                  `Rs. ${chipBalance.toLocaleString()} PKR`
                )}
              </div>
            </div>

            {/* Deposit */}
            <button
              onClick={() => setIsDepositOpen(true)}
              className="px-4 py-2 bg-[#00ff88] hover:bg-[#00e67a] text-black font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#00ff88]/20 active:scale-95 flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Deposit</span>
            </button>

            {/* Withdraw */}
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-red-950/30 active:scale-95 flex items-center space-x-1.5"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw</span>
            </button>

            {/* Profile Link */}
            <Link
              href="/profile"
              className="p-2 bg-[#0a0a0a] hover:bg-gray-900 border border-gray-800 rounded-xl text-gray-300 hover:text-[#00ff88] transition-colors"
              title="Manage Profile & Wallets"
            >
              <UserIcon className="w-5 h-5" />
            </Link>

          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">

        {/* Left Sidebar */}
        <Sidebar
          activeGameSlug={activeGameSlug}
          onSelectGame={(slug) => setActiveGameSlug(slug)}
        />

        {/* Center Game Area */}
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          <GameArea
            chipBalance={chipBalance}
            sessionStartBalance={sessionStartBalance}
            onSimulateWin={handleSimulateWin}
            onSimulateLoss={handleSimulateLoss}
          />
        </main>

      </div>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] border-t border-gray-800 py-6 px-4 text-center text-xs text-gray-400 space-y-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-[#00ff88]" />
            <span className="font-extrabold text-[#00ff88]">P2P HUB</span>
            <span>&copy; {new Date().getFullYear()} Real-time PKR Gaming Hub.</span>
          </div>
          <div className="flex items-center space-x-4 text-gray-400">
            <Link href="/profile" className="hover:text-[#00ff88]">
              Bind Wallet
            </Link>
            <span>•</span>
            <button onClick={() => setIsDepositOpen(true)} className="hover:text-[#00ff88]">
              Deposit
            </button>
            <span>•</span>
            <button onClick={() => setIsWithdrawOpen(true)} className="hover:text-red-400">
              Withdraw
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        userId={profile?.id || 'demo-user-123'}
        onDepositSuccess={handleDepositSuccess}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        userId={profile?.id || 'demo-user-123'}
        currentBalance={chipBalance}
        onWithdrawSuccess={handleWithdrawSuccess}
      />

      <RealAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  )
}
