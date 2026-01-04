import { NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

// Upstash Redis client (environment variable'lar varsa)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

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

const lobbies = !redis && (globalThis.lobbies || new Map<string, {
  code: string
  teams: any[]
  waitingList: any[]
  createdAt: number
}>())

if (!redis && process.env.NODE_ENV !== "production") {
  globalThis.lobbies = lobbies as any
}

// Redis'ten lobi al
async function getLobbyFromStore(code: string) {
  if (redis) {
    try {
      const lobby = await redis.get(`lobby:${code}`)
      return lobby as any
    } catch (error) {
      console.error("[Redis] Lobi okuma hatası:", error)
      return null
    }
  } else {
    return (lobbies as Map<string, any>).get(code) || null
  }
}

// Redis'e lobi kaydet
async function setLobbyToStore(code: string, lobby: any) {
  if (redis) {
    try {
      await redis.set(`lobby:${code}`, lobby, { ex: 3600 }) // 1 saat TTL
      return true
    } catch (error) {
      console.error("[Redis] Lobi kaydetme hatası:", error)
      return false
    }
  } else {
    (lobbies as Map<string, any>).set(code, lobby)
    return true
  }
}

// Tüm lobi kodlarını al (kod kontrolü için)
async function getAllLobbyCodes() {
  if (redis) {
    try {
      const keys = await redis.keys("lobby:*")
      return keys.map((key: string) => key.replace("lobby:", ""))
    } catch (error) {
      console.error("[Redis] Lobi kodları okuma hatası:", error)
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
        createdAt: Date.now(),
      }

      // Yeni lobi kaydet
      await setLobbyToStore(lobbyCode, newLobby)
      
      console.log(`[API] Lobi oluşturuldu: ${lobbyCode}, Store: ${redis ? 'Upstash Redis' : 'Memory'}`)
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

      await setLobbyToStore(lobbyCode, updatedLobby)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: "Geçersiz işlem" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Lobi API hatası:", error)
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
  console.log(`[API] GET isteği: ${lobbyCode}, Store: ${redis ? 'Upstash Redis' : 'Memory'}`)
  
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
