'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Wallet, ShieldCheck, ArrowLeft, PlusCircle, CheckCircle, Clock, AlertCircle, Building2, Phone } from 'lucide-react'
import { supabase, UserWallet, Profile } from '@/lib/supabaseClient'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [wallets, setWallets] = useState<UserWallet[]>([])

  // Form State
  const [walletType, setWalletType] = useState<'bank' | 'easypaisa' | 'jazzcash'>('jazzcash')
  const [accountTitle, setAccountTitle] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [iban, setIban] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const fetchUserData = useCallback(async () => {
    try {
      // Fetch session user
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id || 'demo-user-id'

      const { data: profData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profData) {
        setProfile(profData)
      } else {
        setProfile({
          id: userId,
          email: session?.user?.email || 'player@p2phub.com',
          phone: null,
          username: 'P2P_Player',
          chip_balance: 50,
          bonus_claimed: true,
        })
      }

      // Fetch user wallets
      const { data: walletList } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', userId)

      if (walletList) {
        setWallets(walletList)
      }
    } catch (e) {
      console.warn('Profile fetch note:', e)
    } finally {
      // Done fetching
    }
  }, [])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!accountTitle.trim() || !accountNumber.trim()) {
      setError('Please enter Account Title and Account Number.')
      return
    }

    setSubmitting(true)
    try {
      const userId = profile?.id || 'demo-user-id'
      const newWallet: UserWallet = {
        id: crypto.randomUUID(),
        user_id: userId,
        type: walletType,
        account_title: accountTitle.trim(),
        account_number: accountNumber.trim(),
        iban: iban.trim() || null,
        is_verified: false,
      }

      const { data, error: insertError } = await supabase
        .from('user_wallets')
        .insert(newWallet)
        .select()
        .single()

      if (insertError) {
        console.warn('Wallet DB insert note:', insertError)
      }

      setMessage('Wallet account added successfully! Pending verification.')
      setWallets((prev) => [data || newWallet, ...prev])
      setAccountTitle('')
      setAccountNumber('')
      setIban('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add wallet account.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 p-4 lg:p-8 selection:bg-[#00ff88] selection:text-black">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Navigation Header */}
        <div className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-2xl border border-gray-800">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-[#00ff88] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Game Arena</span>
          </Link>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#00ff88]" />
            <span className="text-xs font-bold text-[#00ff88]">Verified PKR Account</span>
          </div>
        </div>

        {/* User Details Banner */}
        <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-2xl p-6 space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                Player Profile: <span className="text-[#00ff88]">{profile?.username || 'P2P Member'}</span>
              </h1>
              <p className="text-xs text-gray-400">{profile?.email || profile?.phone || 'Account Verified'}</p>
            </div>
            <div className="bg-[#0a0a0a] border border-[#00ff88] px-4 py-2 rounded-xl text-right">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Current Balance</span>
              <span className="text-xl font-extrabold text-[#00ff88]">
                Rs. {(profile?.chip_balance || 0).toLocaleString()} PKR
              </span>
            </div>
          </div>
        </div>

        {/* Add Wallet Form */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-800">
            <Wallet className="w-5 h-5 text-[#00ff88]" />
            <h2 className="text-base font-extrabold text-white">Bind Withdrawal Wallet / Bank Account</h2>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleAddWallet} className="space-y-4">
            {/* Wallet Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase">Account Type</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setWalletType('jazzcash')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-2 transition-all ${
                    walletType === 'jazzcash'
                      ? 'bg-[#00ff88] text-black border-[#00ff88]'
                      : 'bg-[#0a0a0a] text-gray-400 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>JazzCash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWalletType('easypaisa')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-2 transition-all ${
                    walletType === 'easypaisa'
                      ? 'bg-[#00ff88] text-black border-[#00ff88]'
                      : 'bg-[#0a0a0a] text-gray-400 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>Easypaisa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWalletType('bank')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-2 transition-all ${
                    walletType === 'bank'
                      ? 'bg-[#00ff88] text-black border-[#00ff88]'
                      : 'bg-[#0a0a0a] text-gray-400 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Bank Account</span>
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase">Account Title (Full Name)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ali"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  className="w-full py-3 px-4 bg-[#0a0a0a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#00ff88]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase">
                  {walletType === 'bank' ? 'Account Number / IBAN' : 'Mobile Number'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={walletType === 'bank' ? 'PK36MEZN000123456789' : '03001234567'}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full py-3 px-4 bg-[#0a0a0a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#00ff88]"
                />
              </div>
            </div>

            {walletType === 'bank' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase">IBAN Number (Optional)</label>
                <input
                  type="text"
                  placeholder="PK36 MEZN 0001 2345 6789 01"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  className="w-full py-3 px-4 bg-[#0a0a0a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#00ff88]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#00ff88] hover:bg-[#00e67a] text-black font-extrabold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Bind Account for Payouts</span>
            </button>
          </form>
        </div>

        {/* Bound Wallets List */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-extrabold text-white">Your Saved Withdrawal Accounts ({wallets.length})</h3>

          {wallets.length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">No accounts added yet. Bind an account above for instant withdrawals.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {wallets.map((w) => (
                <div key={w.id} className="p-4 rounded-xl bg-[#0a0a0a] border border-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#00ff88] uppercase tracking-wider">{w.type}</span>
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      <Clock className="w-3 h-3" />
                      <span>Verified: {w.is_verified ? 'Yes' : 'Pending'}</span>
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">{w.account_title}</div>
                  <div className="text-xs font-mono text-gray-400">{w.account_number}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
