import { NextRequest, NextResponse } from "next/server"

// In-memory store (production'da database kullanılmalı)
const lobbies = new Map<string, {
  code: string
  teams: any[]
  waitingList: any[]
  createdAt: number
}>()

// Lobi oluştur
export async function POST(request: NextRequest) {
  try {
    const { action, code } = await request.json()

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
      while (lobbies.has(lobbyCode)) {
        lobbyCode = generateCode()
      }

      // Yeni lobi oluştur
      lobbies.set(lobbyCode, {
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
      })

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
      const lobby = lobbies.get(lobbyCode)

      if (!lobby) {
        return NextResponse.json(
          { error: "Lobi bulunamadı" },
          { status: 404 }
        )
      }

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
      const lobby = lobbies.get(lobbyCode)

      if (!lobby) {
        return NextResponse.json(
          { error: "Lobi bulunamadı" },
          { status: 404 }
        )
      }

      return NextResponse.json({ lobby, success: true })
    }

    if (action === "update") {
      const { lobbyData } = await request.json()
      if (!code) {
        return NextResponse.json(
          { error: "Lobi kodu gerekli" },
          { status: 400 }
        )
      }

      const lobbyCode = code.toUpperCase().trim()
      const lobby = lobbies.get(lobbyCode)

      if (!lobby) {
        return NextResponse.json(
          { error: "Lobi bulunamadı" },
          { status: 404 }
        )
      }

      // Lobi verilerini güncelle
      lobbies.set(lobbyCode, {
        ...lobby,
        teams: lobbyData.teams || lobby.teams,
        waitingList: lobbyData.waitingList || lobby.waitingList,
      })

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
  const lobby = lobbies.get(lobbyCode)

  if (!lobby) {
    return NextResponse.json(
      { error: "Lobi bulunamadı" },
      { status: 404 }
    )
  }

  return NextResponse.json({ lobby, success: true })
}

