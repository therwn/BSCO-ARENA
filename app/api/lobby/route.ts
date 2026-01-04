import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Debug: Supabase bağlantı durumunu logla
if (supabase) {
  console.log("[Supabase] Client oluşturuldu:", {
    url: supabaseUrl?.substring(0, 30) + "...",
    hasKey: !!supabaseKey,
    keyType: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SERVICE_ROLE" : "ANON",
  })
} else {
  console.warn("[Supabase] Client oluşturulamadı - Memory store kullanılacak", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
  })
}

// Fallback: Development için global variable
declare global {
  // eslint-disable-next-line no-var
  var lobbies: Map<string, {
    code: string
    teams: any[]
    waitingList: any[]
    createdAt: number
  }> | undefined
}

const lobbies = !supabase && (globalThis.lobbies || new Map<string, {
  code: string
  teams: any[]
  waitingList: any[]
  createdAt: number
}>())

if (!supabase && process.env.NODE_ENV !== "production") {
  globalThis.lobbies = lobbies as any
}

// Supabase'den lobi al
async function getLobbyFromStore(code: string) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("lobbies")
        .select("*")
        .eq("code", code)
        .single()

      if (error) {
        console.error("[Supabase] Lobi okuma hatası:", {
          code,
          error: error.message,
          details: error.details,
          hint: error.hint,
        })
        return null
      }

      if (!data) {
        console.log("[Supabase] Lobi bulunamadı:", code)
        return null
      }

      return {
        code: data.code,
        teams: data.teams,
        waitingList: data.waiting_list || [],
        createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
      }
    } catch (error) {
      console.error("[Supabase] Lobi okuma exception:", error)
      return null
    }
  } else {
    return (lobbies as Map<string, any>).get(code) || null
  }
}

// Supabase'e lobi kaydet
async function setLobbyToStore(code: string, lobby: any) {
  if (supabase) {
    try {
      const payload = {
        code: lobby.code,
        teams: lobby.teams,
        waiting_list: lobby.waitingList || [],
        created_at: lobby.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log("[Supabase] Lobi kaydediliyor:", {
        code: lobby.code,
        payload: JSON.stringify(payload).substring(0, 100) + "...",
      })

      const { data, error } = await supabase
        .from("lobbies")
        .upsert(payload, {
          onConflict: "code",
        })

      if (error) {
        console.error("[Supabase] Lobi kaydetme hatası:", {
          code: lobby.code,
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        return false
      }

      console.log("[Supabase] Lobi başarıyla kaydedildi:", lobby.code)
      return true
    } catch (error: any) {
      console.error("[Supabase] Lobi kaydetme exception:", {
        code: lobby.code,
        error: error.message,
        stack: error.stack,
      })
      return false
    }
  } else {
    console.log("[Memory] Lobi kaydediliyor:", code)
    ;(lobbies as Map<string, any>).set(code, lobby)
    return true
  }
}

// Tüm lobi kodlarını al (kod kontrolü için)
async function getAllLobbyCodes() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("lobbies")
        .select("code")

      if (error) {
        console.error("[Supabase] Lobi kodları okuma hatası:", error)
        return []
      }

      return data?.map((item: any) => item.code) || []
    } catch (error) {
      console.error("[Supabase] Lobi kodları okuma exception:", error)
      return []
    }
  } else {
    return Array.from((lobbies as Map<string, any>).keys())
  }
}

// Lobi oluştur
export async function POST(request: NextRequest) {
  try {
    const { action, code, lobbyData } = await request.json()

    if (action === "create") {
      // Random 6 karakterlik kod oluştur
      const generateCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        let result = ""
        for (let i = 0; i < 6; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
      }

      let lobbyCode = generateCode()
      // Eğer kod zaten varsa yeni kod oluştur
      let attempts = 0
      const existingCodes = await getAllLobbyCodes()
      while (existingCodes.includes(lobbyCode) && attempts < 10) {
        lobbyCode = generateCode()
        attempts++
      }

      const newLobby = {
        code: lobbyCode,
        teams: [
          {
            id: "team1",
            name: "Takım 1",
            color: "#3b82f6",
            captains: [null],
            players: [null, null, null, null],
          },
          {
            id: "team2",
            name: "Takım 2",
            color: "#ef4444",
            captains: [null],
            players: [null, null, null, null],
          },
        ],
        waitingList: [],
        createdAt: new Date().toISOString(),
      }

      // Yeni lobi kaydet
      const saved = await setLobbyToStore(lobbyCode, newLobby)
      
      if (!saved) {
        console.error("[API] Lobi kaydedilemedi:", lobbyCode)
        return NextResponse.json(
          { error: "Lobi kaydedilemedi. Lütfen tekrar deneyin." },
          { status: 500 }
        )
      }

      console.log(`[API] Lobi oluşturuldu: ${lobbyCode}, Store: ${supabase ? 'Supabase' : 'Memory'}`)
      const allCodes = await getAllLobbyCodes()
      console.log(`[API] Toplam lobi sayısı: ${allCodes.length}`)

      return NextResponse.json({ code: lobbyCode, success: true })
    }

    if (action === "join") {
      if (!code) {
        return NextResponse.json(
          { error: "Lobi kodu gerekli" },
          { status: 400 }
        )
      }

      const lobbyCode = code.toUpperCase().trim()
      console.log(`[API] Lobiye katılma isteği: ${lobbyCode}`)
      
      const lobby = await getLobbyFromStore(lobbyCode)

      if (!lobby) {
        console.log(`[API] Lobi bulunamadı: ${lobbyCode}`)
        return NextResponse.json(
          { error: "Lobi bulunamadı" },
          { status: 404 }
        )
      }

      console.log(`[API] Lobi bulundu: ${lobbyCode}`)
      return NextResponse.json({ code: lobbyCode, success: true, lobby })
    }

    if (action === "get") {
      if (!code) {
        return NextResponse.json(
          { error: "Lobi kodu gerekli" },
          { status: 400 }
        )
      }

      const lobbyCode = code.toUpperCase().trim()
      const lobby = await getLobbyFromStore(lobbyCode)

      if (!lobby) {
        return NextResponse.json(
          { error: "Lobi bulunamadı" },
          { status: 404 }
        )
      }

      return NextResponse.json({ lobby, success: true })
    }

    if (action === "update") {
      if (!code) {
        return NextResponse.json(
          { error: "Lobi kodu gerekli" },
          { status: 400 }
        )
      }

      const lobbyCode = code.toUpperCase().trim()
      const lobby = await getLobbyFromStore(lobbyCode)

      if (!lobby) {
        return NextResponse.json(
          { error: "Lobi bulunamadı" },
          { status: 404 }
        )
      }

      // Lobi verilerini güncelle
      const updatedLobby = {
        ...lobby,
        teams: lobbyData.teams || lobby.teams,
        waitingList: lobbyData.waitingList || lobby.waitingList,
      }

      const saved = await setLobbyToStore(lobbyCode, updatedLobby)
      
      if (!saved) {
        return NextResponse.json(
          { error: "Lobi güncellenemedi" },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: "Geçersiz işlem" },
      { status: 400 }
    )
  } catch (error: any) {
    console.error("Lobi API hatası:", {
      message: error.message,
      stack: error.stack,
    })
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    )
  }
}

// GET - Lobi bilgilerini al
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.json(
      { error: "Lobi kodu gerekli" },
      { status: 400 }
    )
  }

  const lobbyCode = code.toUpperCase().trim()
  console.log(`[API] GET isteği: ${lobbyCode}, Store: ${supabase ? 'Supabase' : 'Memory'}`)
  
  const lobby = await getLobbyFromStore(lobbyCode)

  if (!lobby) {
    console.log(`[API] Lobi bulunamadı (GET): ${lobbyCode}`)
    return NextResponse.json(
      { error: "Lobi bulunamadı" },
      { status: 404 }
    )
  }

  console.log(`[API] Lobi bulundu (GET): ${lobbyCode}`)
  return NextResponse.json({ lobby, success: true })
}
