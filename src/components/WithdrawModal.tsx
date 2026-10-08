'use client'

import React, { useState } from 'react'
import { X, ArrowUpRight, Wallet, AlertCircle, CheckCircle2, Phone, CreditCard } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentBalance: number
  onWithdrawSuccess: (amountPkr: number) => void
}

export default function WithdrawModal({
  isOpen,
  onClose,
  userId,
  currentBalance,
  onWithdrawSuccess,
}: WithdrawModalProps) {
  const [method, setMethod] = useState<'JazzCash' | 'Easypaisa' | 'TRC20'>('JazzCash')
  const [accountNumber, setAccountNumber] = useState('')
  const [amountPkr, setAmountPkr] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const parsedAmount = parseFloat(amountPkr) || 0

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (parsedAmount < 100) {
      setError('Minimum withdrawal amount is Rs. 100 PKR.')
      return
    }

    if (parsedAmount > currentBalance) {
      setError('Insufficient PKR chip balance.')
      return
    }

    if (!accountNumber || accountNumber.trim().length < 8) {
      setError('Please enter a valid JazzCash, Easypaisa, or TRC20 account details.')
      return
    }

    setLoading(true)
    try {
      // 1. Insert transaction record in Supabase
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: userId,
        type: 'withdraw',
        amount_pkr: parsedAmount,
        payment_method: method,
        payment_details: accountNumber.trim(),
        status: 'pending',
      })

      if (txError) console.warn('Withdraw tx insert note:', txError)

      // 2. Update user balance
      const newBal = Math.max(0, currentBalance - parsedAmount)
      await supabase.from('users').update({ chip_balance: newBal }).eq('id', userId)

      setSubmitted(true)
      onWithdrawSuccess(parsedAmount)

      setTimeout(() => {
        setSubmitted(false)
        setAmountPkr('')
        setAccountNumber('')
        onClose()
      }, 2500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Withdrawal failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-[#1a1a1a] border border-red-500/40 rounded-2xl shadow-2xl shadow-red-950/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#121212]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/30">
              <ArrowUpRight className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white tracking-wide">
                Withdraw PKR
              </h3>
              <p className="text-xs text-red-400 font-semibold">JazzCash • Easypaisa • TRC20 USDT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleWithdraw} className="p-6 space-y-5">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 text-red-400 mx-auto animate-bounce" />
              <h4 className="text-xl font-extrabold text-white">Withdrawal Placed!</h4>
              <p className="text-xs text-gray-300">
                Your request of <span className="text-red-400 font-bold">Rs. {parsedAmount.toLocaleString()} PKR</span> to {method} ({accountNumber}) is pending approval.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Current Balance Display */}
              <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-gray-400 font-bold uppercase">
                  <Wallet className="w-4 h-4 text-[#00ff88]" />
                  <span>Available Balance:</span>
                </div>
                <span className="text-base font-extrabold text-[#00ff88]">
                  Rs. {currentBalance.toLocaleString()} PKR
                </span>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Select Payout Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['JazzCash', 'Easypaisa', 'TRC20'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition-all ${
                        method === m
                          ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-950/50'
                          : 'bg-[#0a0a0a] text-gray-400 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account/Wallet Details Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  {method === 'TRC20' ? 'TRC20 USDT Wallet Address' : `${method} Mobile Number`}
                </label>
                <div className="relative flex items-center">
                  {method === 'TRC20' ? (
                    <CreditCard className="absolute left-3.5 w-4 h-4 text-gray-500" />
                  ) : (
                    <Phone className="absolute left-3.5 w-4 h-4 text-gray-500" />
                  )}
                  <input
                    type="text"
                    required
                    placeholder={method === 'TRC20' ? 'TQk7X...' : '03001234567'}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full py-3 pl-10 pr-4 bg-[#0a0a0a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Amount (Rs. PKR)
                  </label>
                  <button
                    type="button"
                    onClick={() => setAmountPkr(currentBalance.toString())}
                    className="text-[11px] font-bold text-red-400 hover:underline"
                  >
                    Withdraw Max
                  </button>
                </div>
                <input
                  type="number"
                  required
                  min="100"
                  max={currentBalance}
                  placeholder="Min Rs. 100 PKR"
                  value={amountPkr}
                  onChange={(e) => setAmountPkr(e.target.value)}
                  className="w-full py-3 px-4 bg-[#0a0a0a] border border-gray-800 rounded-xl text-sm font-bold text-[#00ff88] focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-red-950/50 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
              >
                {loading ? (
                  <span>Processing Withdrawal...</span>
                ) : (
                  <span>Confirm PKR Withdrawal</span>
                )}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
