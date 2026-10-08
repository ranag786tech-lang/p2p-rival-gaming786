'use client'

import React, { useState } from 'react'
import { X, Copy, Check, QrCode, Send, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onDepositSuccess: (amountPkr: number) => void
}

export default function DepositModal({
  isOpen,
  onClose,
  userId,
  onDepositSuccess,
}: DepositModalProps) {
  const [usdtAmount, setUsdtAmount] = useState('10')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const trc20Address = 'TQk7X9p2L3m4N5v6P7R8s9T0u1V2W3X4Y5Z'
  const pkrRate = 280
  const parsedUsdt = parseFloat(usdtAmount) || 0
  const calculatedPkr = Math.round(parsedUsdt * pkrRate)

  const handleCopy = () => {
    navigator.clipboard.writeText(trc20Address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleISent = async () => {
    setError('')
    if (parsedUsdt <= 0) {
      setError('Please enter a valid deposit amount.')
      return
    }

    setLoading(true)
    try {
      // Insert pending deposit transaction in Supabase
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: userId,
        type: 'deposit',
        amount_pkr: calculatedPkr,
        payment_method: 'TRC20 USDT',
        payment_details: `TRC20: ${trc20Address}`,
        status: 'pending',
      })

      if (txError) console.warn('Deposit tx insert note:', txError)

      setSubmitted(true)
      onDepositSuccess(calculatedPkr)

      setTimeout(() => {
        setSubmitted(false)
        onClose()
      }, 2500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting deposit'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-[#1a1a1a] border border-[#00ff88]/40 rounded-2xl shadow-2xl shadow-[#00ff88]/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#121212]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#00ff88]/10 rounded-xl border border-[#00ff88]/30">
              <QrCode className="w-6 h-6 text-[#00ff88]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white tracking-wide">
                Deposit via TRC20 USDT
              </h3>
              <p className="text-xs text-[#00ff88] font-semibold">1 USDT = Rs. 280 PKR Instant Credit</p>
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
        <div className="p-6 space-y-5">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 text-[#00ff88] mx-auto animate-bounce" />
              <h4 className="text-xl font-extrabold text-white">Deposit Request Submitted!</h4>
              <p className="text-xs text-gray-300">
                Your deposit of <span className="text-[#00ff88] font-bold">Rs. {calculatedPkr.toLocaleString()} PKR</span> ({parsedUsdt} USDT) is pending verification and will be credited shortly.
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

              {/* Amount Calculator */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Select Deposit Amount (USDT)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['10', '25', '50', '100'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setUsdtAmount(amt)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        usdtAmount === amt
                          ? 'bg-[#00ff88] text-black border-[#00ff88]'
                          : 'bg-[#0a0a0a] text-gray-300 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {amt} USDT
                    </button>
                  ))}
                </div>
              </div>

              {/* PKR Conversion Display */}
              <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-bold uppercase">You Will Receive:</span>
                <span className="text-lg font-extrabold text-[#00ff88]">
                  Rs. {calculatedPkr.toLocaleString()} PKR
                </span>
              </div>

              {/* QR Code Placeholder & Address */}
              <div className="p-4 bg-[#0a0a0a] border border-gray-800 rounded-xl space-y-3">
                <div className="flex items-center space-x-4">
                  {/* QR Placeholder */}
                  <div className="w-20 h-20 bg-[#121212] border border-[#00ff88]/30 rounded-lg flex flex-col items-center justify-center p-2 text-center shrink-0">
                    <QrCode className="w-8 h-8 text-[#00ff88]" />
                    <span className="text-[8px] text-gray-400 font-bold uppercase mt-1">TRC20 QR</span>
                  </div>

                  {/* Address details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      TRC20 Deposit Address
                    </label>
                    <div className="text-xs font-mono font-bold text-[#00ff88] truncate bg-[#121212] p-2 rounded border border-gray-800">
                      {trc20Address}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="mt-1 px-3 py-1 bg-[#00ff88]/20 hover:bg-[#00ff88]/30 text-[#00ff88] text-[11px] font-bold rounded flex items-center space-x-1 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy Address'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3 bg-[#121212] rounded-xl border border-gray-800 text-xs text-gray-300 space-y-1">
                <div className="font-bold text-white flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00ff88]" />
                  <span>Instructions:</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Send USDT (TRC20) to the address above and click <span className="text-[#00ff88] font-bold">&quot;I Sent&quot;</span>. Your account will be updated with PKR chips.
                </p>
              </div>

              {/* 'I Sent' Primary Button */}
              <button
                onClick={handleISent}
                disabled={loading}
                className="w-full py-3.5 bg-[#00ff88] hover:bg-[#00e67a] text-black font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-[#00ff88]/20 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>I Sent (Confirm Deposit)</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
