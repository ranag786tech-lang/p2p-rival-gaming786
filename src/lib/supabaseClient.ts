import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rtfyfeltztrnqdjbvvuv.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_AzejgDWF8fIU2gFx7RQD4g_-22ACyni'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserProfile = {
  id: string
  email: string
  tron_address: string | null
  chip_balance: number
  created_at?: string
}

export type Transaction = {
  id?: string
  user_id: string
  type: 'deposit' | 'withdraw' | 'win' | 'loss'
  amount_pkr: number
  payment_method?: string
  payment_details?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at?: string
}
