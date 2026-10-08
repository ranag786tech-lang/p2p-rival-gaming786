'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Flame, PlusCircle, ArrowUpRight, Coins, User as UserIcon } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import GameArea from '@/components/GameArea'
import DepositModal from '@/components/DepositModal'
import WithdrawModal from '@/components/WithdrawModal'
import AuthModal from '@/components/AuthModal'
import { supabase, UserProfile } from '@/lib/supabaseClient'

export default function Home() {
  const [activeGameSlug, setActiveGameSlug] = useState('doomsday-rampage')
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  const [user, setUser] = useState<UserProfile | null>(null)
  const [chipBalance, setChipBalance] = useState<number>(5000)
  const [sessionStartBalance, setSessionStartBalance] = useState<number>(5000)
  const [loadingUser, setLoadingUser] = useState(true)

  // Initialize active user profile
  const initUser = useCallback(async () => {
    try {
      const demoEmail = 'player1@p2phub.com'
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', demoEmail)
        .single()

      if (error && error.code === 'PGRST116') {
        // Create user
        const { data: newUser } = await supabase
          .from('users')
          .insert({
            email: demoEmail,
            chip_balance: 5000,
          })
          .select()
          .single()

        if (newUser) {
          setUser(newUser)
          setChipBalance(newUser.chip_balance)
          setSessionStartBalance(newUser.chip_balance)
        }
      } else if (data) {
        setUser(data)
        setChipBalance(data.chip_balance)
        setSessionStartBalance(data.chip_balance)
      } else {
        const fallbackUser: UserProfile = {
          id: 'demo-user-123',
          email: demoEmail,
          tron_address: null,
          chip_balance: 5000,
        }
        setUser(fallbackUser)
        setChipBalance(5000)
        setSessionStartBalance(5000)
      }
    } catch (e) {
      console.warn('Supabase fetch notice:', e)
    } finally {
      setLoadingUser(false)
    }
  }, [])

  useEffect(() => {
    initUser()
  }, [initUser])

  // Simulation Handlers
  const handleSimulateWin = async () => {
    const winAmount = 100
    const newBal = chipBalance + winAmount
    setChipBalance(newBal)

    if (user) {
      await supabase.from('users').update({ chip_balance: newBal }).eq('id', user.id)
      await supabase.from('transactions').insert({
        user_id: user.id,
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

    if (user) {
      await supabase.from('users').update({ chip_balance: newBal }).eq('id', user.id)
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'loss',
        amount_pkr: lossAmount,
        status: 'approved',
      })
    }
  }

  const handleDepositSuccess = (amountPkr: number) => {
    // Add pending PKR amount to session/balance
    const updated = chipBalance + amountPkr
    setChipBalance(updated)
    if (user) {
      supabase.from('users').update({ chip_balance: updated }).eq('id', user.id)
    }
  }

  const handleWithdrawSuccess = (amountPkr: number) => {
    const updated = Math.max(0, chipBalance - amountPkr)
    setChipBalance(updated)
  }

  const handleAuthSuccess = (loggedUser: UserProfile) => {
    setUser(loggedUser)
    setChipBalance(loggedUser.chip_balance)
    setSessionStartBalance(loggedUser.chip_balance)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 flex flex-col font-sans selection:bg-[#00ff88] selection:text-black">

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#1a1a1a] border-b border-gray-800 px-4 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo / Brand */}
          <div className="flex items-center space-x-3 cursor-pointer">
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
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">

            {/* PKR Balance Display */}
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

            {/* Deposit Button (Green) */}
            <button
              onClick={() => setIsDepositOpen(true)}
              className="px-4 py-2 bg-[#00ff88] hover:bg-[#00e67a] text-black font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#00ff88]/20 active:scale-95 flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Deposit</span>
            </button>

            {/* Withdraw Button (Red) */}
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-red-950/30 active:scale-95 flex items-center space-x-1.5"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw</span>
            </button>

            {/* Login / Profile Trigger */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="p-2 bg-[#0a0a0a] hover:bg-gray-900 border border-gray-800 rounded-xl text-gray-300 hover:text-[#00ff88] transition-colors"
              title={user ? user.email : 'Login'}
            >
              <UserIcon className="w-5 h-5" />
            </button>

          </div>
        </div>
      </header>

      {/* Main Layout: Sidebar (20%) + Center (80%) */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">

        {/* Left Sidebar (20% approx) */}
        <Sidebar
          activeGameSlug={activeGameSlug}
          onSelectGame={(slug) => setActiveGameSlug(slug)}
        />

        {/* Center Main Game Area (80% approx) */}
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
            <span>&copy; {new Date().getFullYear()} All PKR transactions guaranteed.</span>
          </div>
          <div className="flex items-center space-x-4 text-gray-400">
            <span>Rate: 1 USDT = 280 PKR</span>
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
        userId={user?.id || 'demo-user-123'}
        onDepositSuccess={handleDepositSuccess}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        userId={user?.id || 'demo-user-123'}
        currentBalance={chipBalance}
        onWithdrawSuccess={handleWithdrawSuccess}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  )
}
