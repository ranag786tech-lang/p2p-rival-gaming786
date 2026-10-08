'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Flame, PlusCircle, ArrowUpRight, Coins, ShieldCheck, Trophy, Sparkles, MessageCircle } from 'lucide-react'
import GameWidget from '@/components/GameWidget'
import DepositModal from '@/components/DepositModal'
import WithdrawModal from '@/components/WithdrawModal'
import { supabase, User } from '@/lib/supabaseClient'

export default function Home() {
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [balance, setBalance] = useState<number>(1000)
  const [loadingUser, setLoadingUser] = useState(true)

  // Initialize or fetch demo user from Supabase
  const initUser = useCallback(async () => {
    try {
      const demoEmail = 'player1@p2prival.com'
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', demoEmail)
        .single()

      if (error && error.code === 'PGRST116') {
        // Table exists, but record missing -> Insert demo user
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            email: demoEmail,
            chip_balance: 1000,
            tron_address: null,
          })
          .select()
          .single()

        if (!insertError && newUser) {
          setUser(newUser)
          setBalance(newUser.chip_balance)
        }
      } else if (data) {
        setUser(data)
        setBalance(data.chip_balance)
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

  const handleWithdrawSubmit = async (amount: number, address: string): Promise<boolean> => {
    try {
      if (user) {
        // Record transaction
        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'withdraw',
          amount: amount,
          status: 'pending',
        })

        // Update user balance
        const newBalance = Math.max(0, balance - amount)
        await supabase
          .from('users')
          .update({ chip_balance: newBalance, tron_address: address })
          .eq('id', user.id)

        setBalance(newBalance)
        return true
      }
    } catch (e) {
      console.error('Withdrawal error:', e)
    }

    // Fallback local update if Supabase table is not yet initialized in DB
    setBalance((prev) => Math.max(0, prev - amount))
    return true
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+1234567890'
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello! I have a question regarding my account/deposit.')}`

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">

      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 px-4 py-1.5 text-xs font-bold text-center tracking-wide shadow-md flex items-center justify-center space-x-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>INSTANT TRC20 USDT DEPOSITS & FAST WITHDRAWALS AVAILABLE NOW!</span>
        <Sparkles className="w-3.5 h-3.5" />
      </div>

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0d0f17]/90 backdrop-blur-md border-b border-gray-800/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo / Brand */}
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-[#090a0f] rounded-[10px] flex items-center justify-center">
                <Flame className="w-6 h-6 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider gold-gradient-text">
                APEX CASINO
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold text-amber-400/80 tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                VIP P2P
              </span>
            </div>
          </div>

          {/* Balance & Action Buttons */}
          <div className="flex items-center space-x-3 sm:space-x-4">

            {/* Chip Balance Display */}
            <div className="flex items-center space-x-2 bg-slate-900/90 border border-amber-500/30 px-3.5 py-1.5 rounded-full shadow-inner">
              <Coins className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <div className="text-xs sm:text-sm font-extrabold text-amber-300 tracking-wide">
                {loadingUser ? (
                  <span className="text-gray-500 animate-pulse">Loading...</span>
                ) : (
                  `${balance.toLocaleString()} Chips`
                )}
              </div>
            </div>

            {/* Deposit Button */}
            <button
              onClick={() => setIsDepositOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 active:scale-95 flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Deposit</span>
            </button>

            {/* Withdraw Button */}
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-purple-200 font-bold text-xs sm:text-sm rounded-xl border border-purple-500/30 transition-all duration-200 shadow-md active:scale-95 flex items-center space-x-1.5"
            >
              <ArrowUpRight className="w-4 h-4 text-purple-400" />
              <span>Withdraw</span>
            </button>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 space-y-8">

        {/* Hero Welcome Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-gray-800/80 p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5" />
              <span>#1 Next-Gen P2P Casino Platform</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Play <span className="gold-gradient-text">Doomsday Rampage</span> & Win Big
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              Experience non-stop casino action with instant TRC20 USDT deposits. Join thousands of real players in high-stakes action today!
            </p>
          </div>
        </div>

        {/* Game Widget Center Area */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center space-x-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>Live Game Arena</span>
            </h2>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Provably Fair Gaming</span>
            </div>
          </div>

          {/* Integrated Game Widget Component */}
          <GameWidget />
        </section>

        {/* Platform Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-2xl bg-[#0e1018] border border-gray-800/80 hover:border-amber-500/30 transition-all space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Instant TRC20 USDT</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Send USDT on TRON network and contact support on WhatsApp for instant chip credit to your balance.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e1018] border border-gray-800/80 hover:border-amber-500/30 transition-all space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Fast Withdrawals</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Request withdrawals anytime directly to your TRC20 USDT wallet address with zero hidden fees.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e1018] border border-gray-800/80 hover:border-amber-500/30 transition-all space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">24/7 WhatsApp Support</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Our support team is always active on WhatsApp to assist with deposits, payouts, or game queries.
            </p>
          </div>
        </section>

      </main>

      {/* Sticky Floating WhatsApp Support Bar on Mobile / Desktop */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-30 p-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl shadow-emerald-500/40 transition-all hover:scale-110 flex items-center justify-center group"
        title="Contact WhatsApp Support"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold pl-0 group-hover:pl-2">
          Contact Support
        </span>
      </a>

      {/* Footer */}
      <footer className="mt-12 bg-[#06070a] border-t border-gray-900 py-8 px-4 text-center text-xs text-gray-400 space-y-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-white">APEX CASINO</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6 text-gray-400">
            <button onClick={() => setIsDepositOpen(true)} className="hover:text-amber-400">
              Deposit
            </button>
            <button onClick={() => setIsWithdrawOpen(true)} className="hover:text-purple-400">
              Withdraw
            </button>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400">
              WhatsApp Help
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        currentBalance={balance}
        onWithdrawSubmit={handleWithdrawSubmit}
      />

    </div>
  )
}
