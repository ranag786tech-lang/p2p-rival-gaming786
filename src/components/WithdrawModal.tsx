'use client'

import React, { useState } from 'react'
import { X, ArrowDownRight, Wallet, AlertCircle, CheckCircle } from 'lucide-react'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  currentBalance: number
  onWithdrawSubmit: (amount: number, address: string) => Promise<boolean>
}

export default function WithdrawModal({
  isOpen,
  onClose,
  currentBalance,
  onWithdrawSubmit,
}: WithdrawModalProps) {
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const numAmount = parseFloat(amount)
    if (!address || address.length < 10) {
      setError('Please enter a valid TRC20 wallet address.')
      return
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid chip withdrawal amount.')
      return
    }
    if (numAmount > currentBalance) {
      setError('Insufficient chip balance.')
      return
    }

    setLoading(true)
    try {
      const ok = await onWithdrawSubmit(numAmount, address)
      if (ok) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          setAddress('')
          setAmount('')
          onClose()
        }, 2000)
      } else {
        setError('Withdrawal request failed. Please try again.')
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred during withdrawal.'
      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-[#12141d] border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800/80 bg-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-md">
              <ArrowDownRight className="w-6 h-6 text-white font-bold" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-wide">Withdraw Chips</h3>
              <p className="text-xs text-purple-400 font-medium">Payouts sent in USDT (TRC20)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleWithdraw} className="p-6 space-y-5">
          {success ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
              <CheckCircle className="w-16 h-16 text-emerald-400 animate-bounce" />
              <h4 className="text-xl font-bold text-white">Withdrawal Submitted!</h4>
              <p className="text-sm text-gray-300">
                Your payout request of <span className="text-amber-400 font-bold">{amount} Chips</span> has been placed.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Balance Box */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-900/80 border border-gray-800">
                <div className="flex items-center space-x-2 text-gray-400 text-xs font-semibold uppercase">
                  <Wallet className="w-4 h-4 text-amber-400" />
                  <span>Available Balance</span>
                </div>
                <div className="text-lg font-bold text-amber-400">
                  {currentBalance.toLocaleString()} <span className="text-xs font-normal text-amber-200">Chips</span>
                </div>
              </div>

              {/* TRC20 Address Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Your TRC20 USDT Wallet Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. T..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full py-3 px-4 text-sm font-mono bg-slate-950 border border-gray-700/80 rounded-xl text-white focus:outline-none focus:border-purple-500 placeholder-gray-600"
                />
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Amount to Withdraw (Chips)
                  </label>
                  <button
                    type="button"
                    onClick={() => setAmount(currentBalance.toString())}
                    className="text-[11px] font-bold text-purple-400 hover:text-purple-300 underline"
                  >
                    Withdraw All
                  </button>
                </div>
                <input
                  type="number"
                  required
                  min="10"
                  max={currentBalance}
                  placeholder="Minimum 10 Chips"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full py-3 px-4 text-sm font-mono bg-slate-950 border border-gray-700/80 rounded-xl text-amber-300 focus:outline-none focus:border-purple-500 placeholder-gray-600"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-purple-950/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Processing Request...</span>
                ) : (
                  <span>Confirm Withdrawal</span>
                )}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
