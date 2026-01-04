import { NextResponse } from "next/server"

// Environment variable'ları debug etmek için endpoint
export async function GET() {
  // Tüm environment variable'ları kontrol et
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}... (${process.env.NEXT_PUBLIC_SUPABASE_URL.length} chars)`
      : "NOT SET",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}... (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length} chars)`
      : "NOT SET",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}... (${process.env.SUPABASE_SERVICE_ROLE_KEY.length} chars)`
      : "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  }

  // Tüm environment variable'ları listele (NEXT_PUBLIC ve SUPABASE ile başlayanlar)
  const allEnvVars = Object.keys(process.env)
    .filter(key => key.includes('SUPABASE') || key.includes('NEXT_PUBLIC'))
    .reduce((acc: any, key) => {
      const value = process.env[key]
      acc[key] = value
        ? `${value.substring(0, 30)}... (${value.length} chars)`
        : "NOT SET"
      return acc
    }, {})

  return NextResponse.json({
    specific: envVars,
    allSupabaseVars: allEnvVars,
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  })
}

