import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://fqkohlhgsoqzdmbynpte.supabase.co'

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_TJtBhEgTZzjMYjrsfFLnHA_ULFSYX-9'

export const supabase = createClient(supabaseUrl, supabaseKey)

export function getSupabaseServerClient() {
  return createClient(supabaseUrl, supabaseKey)
}
