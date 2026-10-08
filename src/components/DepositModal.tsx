'use client'

import React, { useState } from 'react'
import { X, Copy, Check, QrCode, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  trc20Address?: string
  whatsappNumber?: string
}

export default function DepositModal({
  isOpen,
  onClose,
  trc20Address = process.env.NEXT_PUBLIC_TRC20_USDT_ADDRESS || 'T4xP9m2kL7qR8vN1yZ3aB5cC6dE7fG8hI9',
  whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+1234567890',
}: DepositModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(trc20Address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const whatsappMessage = encodeURIComponent(
    `Hello! I have completed a TRC20 USDT deposit to address: ${trc20Address}. Please verify and credit my chips.`
  )
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-[#12141d] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800/80 bg-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg shadow-md">
              <QrCode className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-wide">Deposit TRC20 USDT</h3>
              <p className="text-xs text-amber-400 font-medium">Instant Chip Credit via WhatsApp Verification</p>
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
        <div className="p-6 space-y-6">

          {/* Important WhatsApp Alert Banner */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>Required Step After Transfer</span>
            </div>
            <p className="text-sm font-semibold text-white">
              Contact on WhatsApp after sending your USDT deposit to get instant confirmation and chips credited to your account.
            </p>
          </div>

          {/* Network indicator */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/80 border border-gray-800">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Accepted Network</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              TRON (TRC20) USDT
            </span>
          </div>

          {/* Address Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Deposit Address (TRC20)
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                value={trc20Address}
                className="w-full py-3 pl-4 pr-24 text-sm font-mono bg-slate-950 border border-gray-700/80 rounded-xl text-amber-300 focus:outline-none focus:border-amber-500 selection:bg-amber-500/30"
              />
              <button
                onClick={handleCopy}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold text-xs rounded-lg transition-all flex items-center space-x-1.5 shadow-md active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-black" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-black" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step Instructions */}
          <div className="space-y-2 text-xs text-gray-300 bg-gray-900/40 p-4 rounded-xl border border-gray-800/60">
            <div className="font-semibold text-gray-200 mb-1">How it works:</div>
            <ol className="list-decimal list-inside space-y-1 text-gray-400">
              <li>Copy the TRC20 address or send USDT directly from your wallet.</li>
              <li>Minimum deposit: <span className="text-amber-400 font-bold">10 USDT</span> (1 USDT = 100 Chips).</li>
              <li>Click the button below to message support on WhatsApp with your transaction hash/screenshot.</li>
            </ol>
          </div>

          {/* WhatsApp Action Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-2 group cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            <span>Contact on WhatsApp After Sending</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit Encrypted Wallet Node</span>
          </span>
          <button
            onClick={onClose}
            className="hover:text-amber-400 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  )
}
