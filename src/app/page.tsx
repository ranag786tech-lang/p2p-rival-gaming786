'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Menu,
  Volume2,
  Heart,
  ChevronRight,
  Home as HomeIcon,
  PlusCircle,
  Users,
  Activity,
  User as UserIcon,
  Play,
  Flame,
  Award,
  Gamepad2,
  ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'
import DepositModal from '@/components/DepositModal'
import WithdrawModal from '@/components/WithdrawModal'
import RealAuthModal from '@/components/RealAuthModal'
import GameArea from '@/components/GameArea'
import { supabase, Profile } from '@/lib/supabaseClient'

interface GameItem {
  id: string
  title: string
  provider: 'JILI' | 'SPRIZE' | 'PG' | 'JDB' | 'FC' | 'CQ9'
  category: string
  image: string
  hot?: boolean
}

const GAMES_DATA: GameItem[] = [
  { id: 'doomsday-rampage', title: 'Doomsday Rampage', provider: 'SPRIZE', category: 'Hots', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80', hot: true },
  { id: 'super-ace', title: 'Super Ace', provider: 'JILI', category: 'Hots', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80', hot: true },
  { id: 'fortune-tiger', title: 'Fortune Tiger', provider: 'PG', category: 'Hots', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80', hot: true },
  { id: 'money-coming', title: 'Money Coming', provider: 'JILI', category: 'Hots', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80', hot: true },
  { id: 'dragon-hatch', title: 'Dragon Hatch', provider: 'PG', category: 'Hots', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80', hot: true },
  { id: 'aviator', title: 'Aviator Crash', provider: 'SPRIZE', category: 'Hots', image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&q=80', hot: true },
  { id: 'golden-empire', title: 'Golden Empire', provider: 'JILI', category: 'Hots', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80', hot: true },
  { id: 'mahjong-ways', title: 'Mahjong Ways 2', provider: 'PG', category: 'Hots', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&q=80', hot: true },
]

const CAROUSEL_SLIDES = [
  {
    id: 1,
    title: 'AGENT COMMISSION UP TO 80%',
    subtitle: 'Earn passive rewards by inviting active players daily!',
    badge: 'AGENCY REWARDS',
    color: 'from-amber-500 via-yellow-600 to-yellow-800'
  },
  {
    id: 2,
    title: 'SPIN WHEEL & INVITE FRIENDS',
    subtitle: 'Get free instant PKR chips on every referral',
    badge: 'DAILY BONUS',
    color: 'from-emerald-600 via-green-700 to-teal-900'
  },
  {
    id: 3,
    title: 'VIP PRIVILEGES & REBATES',
    subtitle: 'Exclusive weekly cashback for high rollers',
    badge: 'VIP CLUB',
    color: 'from-yellow-500 via-amber-700 to-yellow-950'
  }
]

export default function Home() {
  const [activeTab, setActiveTab] = useState('Hots')
  const [favorites, setFavorites] = useState<string[]>(['doomsday-rampage', 'super-ace'])
  const [currentSlide, setCurrentSlide] = useState(0)

  const [activeGameSlug, setActiveGameSlug] = useState<string | null>(null)

  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [chipBalance, setChipBalance] = useState<number>(0)
  const [sessionStartBalance, setSessionStartBalance] = useState<number>(0)
  const [loadingUser, setLoadingUser] = useState(true)

  // Carousel auto-switch
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  // Initialize profile & auth
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
        setIsAuthOpen(true)
      }
    } catch (e) {
      console.warn('User load notice:', e)
    } finally {
      setLoadingUser(false)
    }
  }, [])

  useEffect(() => {
    initUser()
  }, [initUser])

  // Realtime Supabase Profile balance sync
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

  const toggleFavorite = (gameId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) =>
      prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId]
    )
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

  const filteredGames = GAMES_DATA.filter((g) => {
    if (activeTab === 'Favorite') return favorites.includes(g.id)
    if (activeTab === 'Hots') return true
    return g.provider === activeTab
  })

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-slate-100 flex flex-col font-sans pb-20 selection:bg-[#FFD700] selection:text-black">

      {/* 1. Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0F0F0F]/95 backdrop-blur border-b border-yellow-900/20 px-4 py-2.5 flex items-center justify-between shadow-lg">
        {/* Left Menu Icon */}
        <button className="p-2 text-yellow-500 hover:text-yellow-400 transition-colors">
          <Menu className="w-6 h-6" />
        </button>

        {/* Center Logo */}
        <Link href="/" className="flex items-center space-x-1">
          <span className="text-xl">👑</span>
          <span className="text-2xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600 bg-clip-text text-transparent tracking-wider">
            R🎮H
          </span>
        </Link>

        {/* Right Balance Pill */}
        <div className="flex items-center space-x-2 bg-[#1A1A1A] border border-yellow-500/30 rounded-full pl-2 pr-3 py-1 shadow-inner">
          <span className="text-base leading-none">🇵🇰</span>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-yellow-500/80 font-bold leading-tight">BALANCE</span>
            <span className="text-xs font-black text-yellow-400 leading-tight">
              {loadingUser ? '...' : `Rs.${chipBalance.toLocaleString()}`}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto w-full px-3 py-3 space-y-4">

        {/* 2. Banner Carousel */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-yellow-500/20 bg-[#181818] h-36 sm:h-44">
          {CAROUSEL_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 p-5 flex flex-col justify-between bg-gradient-to-br ${slide.color} ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="bg-black/40 backdrop-blur text-yellow-300 border border-yellow-400/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                  {slide.badge}
                </span>
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-white drop-shadow-md">
                  {slide.title}
                </h2>
                <p className="text-xs sm:text-sm text-yellow-100/90 font-medium drop-shadow">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          ))}

          {/* Carousel Indicators */}
          <div className="absolute bottom-2 right-3 z-20 flex space-x-1.5">
            {CAROUSEL_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentSlide ? 'bg-yellow-400 w-5' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 3. Marquee Notice Bar */}
        <div className="bg-[#1A1A1A] border border-yellow-500/20 rounded-full px-3 py-1.5 flex items-center space-x-2.5 text-xs text-yellow-300/90 shadow-md">
          <Volume2 className="w-4 h-4 text-yellow-400 shrink-0 animate-pulse" />
          <div className="overflow-hidden whitespace-nowrap w-full">
            <div className="inline-block animate-marquee font-medium text-amber-200">
              ⚡ Welcome to R🎮H Rival Hub! Get up to 80% Agent Commission! Instant TRC20 USDT & EasyPaisa / JazzCash PKR Deposits available 24/7! 👑
            </div>
          </div>
        </div>

        {/* 4. Filter Categories Row */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          {['Hots', 'Favorite', 'JILI', 'PG', 'SPRIZE', 'JDB'].map((category) => {
            const isActive = activeTab === category
            return (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-black border-green-400 shadow-lg shadow-green-500/20 scale-105'
                    : 'bg-[#181818] text-gray-300 border-gray-800 hover:border-yellow-500/30'
                }`}
              >
                {category === 'Hots' && '🔥 '}
                {category === 'Favorite' && '❤️ '}
                {category}
              </button>
            )
          })}
        </div>

        {/* Launch Game View (if selected) */}
        {activeGameSlug && (
          <div className="bg-[#141414] border-2 border-yellow-500/40 rounded-2xl p-4 shadow-2xl relative">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-black text-yellow-400 flex items-center space-x-2">
                <Gamepad2 className="w-4 h-4 text-green-400" />
                <span>ACTIVE GAME: {activeGameSlug.toUpperCase()}</span>
              </h3>
              <button
                onClick={() => setActiveGameSlug(null)}
                className="text-xs bg-red-900/60 text-red-300 border border-red-500/40 px-2.5 py-1 rounded-lg hover:bg-red-800"
              >
                Close Game
              </button>
            </div>
            <GameArea
              chipBalance={chipBalance}
              sessionStartBalance={sessionStartBalance}
              onSimulateWin={handleSimulateWin}
              onSimulateLoss={handleSimulateLoss}
            />
          </div>
        )}

        {/* 5. Game Grid Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h3 className="text-base font-black text-yellow-400 tracking-wide uppercase">
                {activeTab} Games
              </h3>
            </div>
            <span className="text-xs text-gray-400 font-semibold">
              {filteredGames.length} Available
            </span>
          </div>

          {filteredGames.length === 0 ? (
            <div className="text-center py-12 bg-[#181818] rounded-2xl border border-gray-800 text-gray-400 text-xs">
              No games found in {activeTab}.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2.5">
              {filteredGames.map((game) => {
                const isFav = favorites.includes(game.id)
                return (
                  <div
                    key={game.id}
                    onClick={() => setActiveGameSlug(game.id)}
                    className="group relative bg-[#181818] rounded-xl overflow-hidden border border-yellow-500/20 hover:border-yellow-400 transition-all cursor-pointer shadow-md hover:scale-[1.03] flex flex-col"
                  >
                    {/* Thumbnail Image Container */}
                    <div className="relative aspect-square w-full overflow-hidden bg-black/60">
                      <img
                        src={game.image}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />

                      {/* Top Provider Badge */}
                      <span className="absolute top-1 left-1 bg-black/80 backdrop-blur border border-yellow-500/40 text-[9px] font-black text-yellow-400 px-1.5 py-0.5 rounded shadow">
                        {game.provider}
                      </span>

                      {/* Favorite Heart Toggle */}
                      <button
                        onClick={(e) => toggleFavorite(game.id, e)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-black/90 transition-colors"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isFav
                              ? 'text-red-500 fill-red-500'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        />
                      </button>

                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                          <Play className="w-4 h-4 fill-black ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Game Info Bottom */}
                    <div className="p-1.5 flex flex-col justify-between bg-[#141414] flex-1">
                      <p className="text-[11px] font-bold text-gray-200 truncate leading-tight">
                        {game.title}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] text-green-400 font-extrabold uppercase">
                          PLAY NOW
                        </span>
                        <ChevronRight className="w-3 h-3 text-yellow-500" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Deposit/Withdraw Actions Bar */}
        <div className="bg-gradient-to-r from-amber-950/60 via-[#1A1A1A] to-amber-950/60 border border-yellow-500/30 rounded-2xl p-3 flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-yellow-500/20 rounded-xl border border-yellow-500/40">
              <Award className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs font-black text-yellow-400">TRC20 & PKR WALLET</p>
              <p className="text-[10px] text-gray-400">Instant deposits & 24/7 payouts</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDepositOpen(true)}
              className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs rounded-xl shadow-md transition-transform active:scale-95"
            >
              Deposit
            </button>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center space-x-1"
            >
              <span>Withdraw</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </main>

      {/* 6. Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur border-t border-yellow-900/30 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {/* Home */}
        <Link
          href="/"
          className="flex flex-col items-center text-yellow-400 font-bold"
        >
          <HomeIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>

        {/* Deposit Trigger */}
        <button
          onClick={() => setIsDepositOpen(true)}
          className="flex flex-col items-center text-gray-400 hover:text-yellow-400 font-bold transition-colors"
        >
          <PlusCircle className="w-5 h-5 text-yellow-500" />
          <span className="text-[10px] mt-0.5">Deposit</span>
        </button>

        {/* Agency Center Floating Button */}
        <div className="relative -top-4">
          <button
            onClick={() => setIsDepositOpen(true)}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-green-500 via-emerald-400 to-green-600 p-0.5 shadow-xl shadow-green-500/30 flex items-center justify-center transform active:scale-90 transition-transform border-2 border-yellow-400"
          >
            <div className="w-full h-full rounded-full bg-black/20 flex flex-col items-center justify-center text-black">
              <Users className="w-5 h-5 text-white" />
            </div>
          </button>
          <span className="text-[9px] font-black text-green-400 text-center block mt-0.5 tracking-tight">
            Agency
          </span>
        </div>

        {/* Activity */}
        <button
          onClick={() => setIsDepositOpen(true)}
          className="flex flex-col items-center text-gray-400 hover:text-yellow-400 font-bold transition-colors"
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Activity</span>
        </button>

        {/* Profile / Me */}
        <Link
          href="/profile"
          className="flex flex-col items-center text-gray-400 hover:text-yellow-400 font-bold transition-colors"
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Me</span>
        </Link>
      </nav>

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
