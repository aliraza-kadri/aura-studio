import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fqkohlhgsoqzdmbynpte.supabase.co'
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_TJtBhEgTZzjMYjrsfFLnHA_ULFSYX-9'

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey)

export function createSupabaseClient() {
  return createClient<Database>(supabaseUrl, supabasePublishableKey)
}
