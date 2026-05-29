import { createClient } from '@supabase/supabase-js'

// ✅ Load from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 🧠 Optional safety log
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
