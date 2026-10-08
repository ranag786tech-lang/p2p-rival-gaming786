'use client'

import React, { useState } from 'react'
import { Mail, Phone, Lock, Sparkles, ArrowRight, CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react'
import confetti from 'canvas-confetti'
import { supabase, Profile } from '@/lib/supabaseClient'

interface RealAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: (profile: Profile) => void
}

export default function RealAuthModal({ isOpen, onClose, onAuthSuccess }: RealAuthModalProps) {
  const [method, setMethod] = useState<'email' | 'phone' | 'google'>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [step, setStep] = useState<'input' | 'otp'>('input')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [bonusClaimedNotice, setBonusClaimedNotice] = useState(false)

  if (!isOpen) return null

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00ff88', '#ffffff', '#ffd700'],
      })
    } catch (e) {
      console.log('Confetti trigger note:', e)
    }
  }

  // Handle claiming Rs. 50 bonus
  const claimBonus = async (userId: string, currentEmail?: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profile) {
        if (!profile.bonus_claimed) {
          const newBal = (profile.chip_balance || 0) + 50
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .update({ chip_balance: newBal, bonus_claimed: true })
            .eq('id', userId)
            .select()
            .single()

          // Insert bonus transaction
          await supabase.from('transactions').insert({
            user_id: userId,
            type: 'bonus',
            amount_pkr: 50,
            status: 'approved',
          })

          setBonusClaimedNotice(true)
          triggerConfetti()
          onAuthSuccess(updatedProfile || { ...profile, chip_balance: newBal, bonus_claimed: true })
        } else {
          onAuthSuccess(profile)
        }
      } else {
        // Fallback profile creation if trigger hasn't fired
        const newProfile: Profile = {
          id: userId,
          email: currentEmail || email || 'user@p2phub.com',
          phone: phone || null,
          username: (currentEmail || email).split('@')[0] || 'Player',
          chip_balance: 50,
          bonus_claimed: true,
        }
        await supabase.from('profiles').upsert(newProfile)
        await supabase.from('transactions').insert({
          user_id: userId,
          type: 'bonus',
          amount_pkr: 50,
          status: 'approved',
        })
        setBonusClaimedNotice(true)
        triggerConfetti()
        onAuthSuccess(newProfile)
      }
    } catch (err) {
      console.warn('Bonus claiming error:', err)
    }
  }

  // Step 1: Send OTP via Email or Phone
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    try {
      if (method === 'email') {
        if (!email || !email.includes('@')) {
          throw new Error('Please enter a valid email address.')
        }
        const { error: sendError } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: true,
          },
        })
        if (sendError) throw sendError
        setSuccessMsg(`OTP Code sent to ${email}. Check your inbox!`)
        setStep('otp')
      } else if (method === 'phone') {
        const formattedPhone = phone.startsWith('+') ? phone.trim() : `+92${phone.replace(/^0/, '').trim()}`
        if (formattedPhone.length < 10) {
          throw new Error('Please enter a valid phone number (e.g. +923001234567).')
        }
        const { error: sendError } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        })
        if (sendError) throw sendError
        setSuccessMsg(`SMS OTP sent to ${formattedPhone}.`)
        setStep('otp')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!otpCode || otpCode.trim().length < 6) {
      setError('Please enter the 6-digit OTP code.')
      return
    }

    setLoading(true)
    try {
      if (method === 'email') {
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otpCode.trim(),
          type: 'email',
        })
        if (verifyError) throw verifyError
        if (data.user) {
          await claimBonus(data.user.id, data.user.email)
        }
      } else if (method === 'phone') {
        const formattedPhone = phone.startsWith('+') ? phone.trim() : `+92${phone.replace(/^0/, '').trim()}`
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otpCode.trim(),
          type: 'sms',
        })
        if (verifyError) throw verifyError
        if (data.user) {
          await claimBonus(data.user.id)
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid or expired OTP code.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Google OAuth Flow
  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
        },
      })
      if (oauthError) throw oauthError
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-[#1a1a1a] border-2 border-[#00ff88] rounded-2xl shadow-2xl shadow-[#00ff88]/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Header */}
        <div className="relative p-6 bg-gradient-to-r from-gray-900 via-[#121212] to-gray-900 border-b border-gray-800 text-center space-y-2">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-full text-[#00ff88] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome Bonus Ready</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-wide">
            Welcome to <span className="text-[#00ff88] neon-text">P2P HUB</span>
          </h2>
          <p className="text-xs text-gray-300 font-medium">
            Register & Get <span className="text-[#00ff88] font-bold">50 Bonus Chips (Rs. 50 PKR)</span> Instantly!
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {bonusClaimedNotice ? (
            <div className="py-6 text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-[#00ff88] mx-auto animate-bounce" />
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-white">Congratulations!</h3>
                <p className="text-sm font-bold text-[#00ff88]">Rs. 50 PKR Bonus Added to Your Balance!</p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#00ff88] hover:bg-[#00e67a] text-black font-extrabold text-sm rounded-xl transition-all shadow-lg"
              >
                Start Playing Now
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Method Switcher Tabs */}
              {step === 'input' && (
                <div className="grid grid-cols-3 gap-2 bg-[#0a0a0a] p-1.5 rounded-xl border border-gray-800">
                  <button
                    type="button"
                    onClick={() => { setMethod('email'); setError('') }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                      method === 'email' ? 'bg-[#00ff88] text-black shadow-md' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMethod('phone'); setError('') }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                      method === 'phone' ? 'bg-[#00ff88] text-black shadow-md' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Phone OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMethod('google'); setError('') }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                      method === 'google' ? 'bg-[#00ff88] text-black shadow-md' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>Google</span>
                  </button>
                </div>
              )}

              {/* Input Form for Email / Phone */}
              {step === 'input' && method !== 'google' && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {method === 'email' ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Email Address</label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3.5 w-4 h-4 text-gray-500" />
                        <input
                          type="email"
                          required
                          placeholder="yourname@p2phub.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full py-3 pl-10 pr-4 bg-[#0a0a0a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#00ff88]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Mobile Phone (+92)</label>
                      <div className="relative flex items-center">
                        <Phone className="absolute left-3.5 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          required
                          placeholder="+923001234567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full py-3 pl-10 pr-4 bg-[#0a0a0a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#00ff88]"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#00ff88] hover:bg-[#00e67a] text-black font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-[#00ff88]/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Sending Real OTP...</span>
                    ) : (
                      <>
                        <span>Send 6-Digit OTP Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: Enter & Verify OTP */}
              {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Enter 6-Digit Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={() => setStep('input')}
                        className="text-[11px] font-bold text-[#00ff88] hover:underline"
                      >
                        Change {method}
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full py-3 pl-10 pr-4 bg-[#0a0a0a] border border-[#00ff88] rounded-xl text-lg font-mono font-bold tracking-widest text-[#00ff88] focus:outline-none text-center"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#00ff88] hover:bg-[#00e67a] text-black font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-[#00ff88]/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Verifying OTP...</span>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Verify & Claim Rs. 50 PKR</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs text-gray-400 hover:text-white flex items-center justify-center space-x-1 mx-auto"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Resend Code</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Google OAuth Option */}
              {step === 'input' && method === 'google' && (
                <div className="space-y-4 pt-2">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-3.5 bg-white hover:bg-gray-100 text-black font-bold text-sm rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-gray-400 hover:text-[#00ff88] underline transition-colors"
                >
                  Continue as Guest (Explore Hub)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
