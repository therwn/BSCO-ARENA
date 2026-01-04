import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Test endpoint - Supabase bağlantısını test etmek için
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const response: any = {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + "..." : null,
    keyType: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SERVICE_ROLE" : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "ANON" : "NONE"),
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      ...response,
      error: "Supabase environment variables eksik",
      connected: false,
    })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Tabloyu kontrol et
    const { data, error } = await supabase
      .from("lobbies")
      .select("count", { count: "exact", head: true })

    if (error) {
      return NextResponse.json({
        ...response,
        connected: true,
        tableExists: false,
        error: error.message,
        details: error.details,
        hint: error.hint,
      })
    }

    return NextResponse.json({
      ...response,
      connected: true,
      tableExists: true,
      rowCount: data,
    })
  } catch (error: any) {
    return NextResponse.json({
      ...response,
      connected: false,
      error: error.message,
    })
  }
}

