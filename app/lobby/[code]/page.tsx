"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useLobbyStore } from "@/store/lobby-store"
import TeamCard from "@/components/team-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LogOut, UserPlus, Copy } from "lucide-react"

export default function LobbyPage() {
  const params = useParams()
  const router = useRouter()
  const lobbyCode = params.code as string
  const [playerName, setPlayerName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  const {
    teams,
    waitingList,
    currentPlayer,
    setCurrentPlayer,
    addToWaitingList,
    removeFromWaitingList,
    removePlayerFromAllSlots,
    initializeTeams,
    setTeams,
    setWaitingList,
    setOnTeamSlotChange,
  } = useLobbyStore()

  // Lobi verilerini yükle ve senkronize et
  useEffect(() => {
    const loadLobby = async () => {
      try {
        const response = await fetch(`/api/lobby?code=${lobbyCode}`)
        const data = await response.json()

        if (data.success && data.lobby) {
          // Store'u API'den gelen verilerle güncelle
          setTeams(data.lobby.teams)
          setWaitingList(data.lobby.waitingList)
        } else {
          alert("Lobi bulunamadı")
          router.push("/")
          return
        }
      } catch (error) {
        console.error("Lobi yükleme hatası:", error)
        alert("Lobi yüklenirken bir hata oluştu")
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    if (lobbyCode) {
      initializeTeams()
      // Rastgele bir oyuncu ID'si oluştur
      const playerId = `player-${Math.random().toString(36).substr(2, 9)}`
      setCurrentPlayer({
        id: playerId,
        name: `Oyuncu ${playerId.slice(-4)}`,
        isCaptain: false,
      })
      loadLobby()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyCode])

  // Team slot değişikliklerinde hemen API'ye gönder
  useEffect(() => {
    if (isLoading) return

    const handleTeamSlotChange = async () => {
      if (isSyncing) return
      setIsSyncing(true)

      try {
        await fetch("/api/lobby", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "update",
            code: lobbyCode,
            lobbyData: {
              teams,
              waitingList,
            },
          }),
        })
      } catch (error) {
        console.error("Team slot senkronizasyon hatası:", error)
      } finally {
        setIsSyncing(false)
      }
    }

    setOnTeamSlotChange(() => handleTeamSlotChange)

    return () => {
      setOnTeamSlotChange(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyCode, teams, waitingList, isLoading])

  // Periyodik olarak lobi verilerini senkronize et
  useEffect(() => {
    if (!lobbyCode) return

    const syncInterval = setInterval(async () => {
      if (isSyncing) return
      setIsSyncing(true)

      try {
        const response = await fetch(`/api/lobby?code=${lobbyCode}`)
        const data = await response.json()

        if (data.success && data.lobby) {
          setTeams(data.lobby.teams)
          setWaitingList(data.lobby.waitingList)
        }
      } catch (error) {
        console.error("Senkronizasyon hatası:", error)
      } finally {
        setIsSyncing(false)
      }
    }, 2000) // Her 2 saniyede bir senkronize et

    return () => clearInterval(syncInterval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyCode])

  // Store değişikliklerini API'ye gönder
  const syncToServer = async (immediate = false) => {
    if (!lobbyCode || isSyncing || isLoading) return

    try {
      const response = await fetch("/api/lobby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          code: lobbyCode,
          lobbyData: {
            teams,
            waitingList,
          },
        }),
      })

      if (!response.ok) {
        console.error("Senkronizasyon hatası:", await response.text())
      }
    } catch (error) {
      console.error("Senkronizasyon hatası:", error)
    }
  }

  // Store değiştiğinde sunucuya gönder (debounce ile, ama join/leave işlemleri için immediate)
  useEffect(() => {
    if (isLoading) return

    // Debounce: 300ms bekle, sonra gönder (daha hızlı)
    const timeoutId = setTimeout(() => {
      syncToServer()
    }, 300)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams, waitingList])

  // Browser kapatıldığında veya sayfa değiştirildiğinde oyuncuyu çıkar
  useEffect(() => {
    if (!currentPlayer || !lobbyCode) return

    const handleBeforeUnload = async () => {
      // Synchronous olarak çalışması gerekiyor, bu yüzden navigator.sendBeacon kullanıyoruz
      const payload = JSON.stringify({
        action: "update",
        code: lobbyCode,
        lobbyData: {
          teams: teams.map((team) => ({
            ...team,
            captains: team.captains.map((captain) =>
              captain?.id === currentPlayer.id ? null : captain
            ),
            players: team.players.map((player) =>
              player?.id === currentPlayer.id ? null : player
            ),
          })),
          waitingList: waitingList.filter((p) => p.id !== currentPlayer.id),
        },
      })

      // sendBeacon ile güvenilir bir şekilde gönder
      navigator.sendBeacon(
        "/api/lobby",
        new Blob([payload], { type: "application/json" })
      )
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, lobbyCode, teams, waitingList])

  const handleJoinWaitingList = async () => {
    if (playerName.trim() && currentPlayer) {
      const updatedPlayer = {
        ...currentPlayer,
        name: playerName.trim(),
      }
      setCurrentPlayer(updatedPlayer)
      addToWaitingList(updatedPlayer)
    }
  }

  const handleLeaveLobby = async () => {
    if (currentPlayer) {
      // Oyuncuyu tüm slotlardan ve bekleme listesinden çıkar
      removePlayerFromAllSlots(currentPlayer.id)
      
      // API'ye güncelleme gönder
      try {
        await fetch("/api/lobby", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "update",
            code: lobbyCode,
            lobbyData: {
              teams: teams.map((team) => ({
                ...team,
                captains: team.captains.map((captain) =>
                  captain?.id === currentPlayer.id ? null : captain
                ),
                players: team.players.map((player) =>
                  player?.id === currentPlayer.id ? null : player
                ),
              })),
              waitingList: waitingList.filter((p) => p.id !== currentPlayer.id),
            },
          }),
        })
      } catch (error) {
        console.error("Çıkış senkronizasyon hatası:", error)
      }
      
      setCurrentPlayer(null)
      router.push("/")
    }
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/lobby/${lobbyCode}`
    navigator.clipboard.writeText(url)
    alert("Link kopyalandı!")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">BSCO Arena</h1>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-gray-400">Lobi Kodu: {lobbyCode}</p>
              <Button
                onClick={handleCopyLink}
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-gray-400 hover:text-white"
                title="Linki Kopyala"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <Button
            onClick={handleLeaveLobby}
            variant="outline"
            className="border-[#1a1a1a] text-white hover:bg-[#1a1a1a]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış
          </Button>
        </motion.div>

        {/* Player Name Input */}
        {currentPlayer && !waitingList.find((p) => p.id === currentPlayer.id) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="İsminizi girin"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleJoinWaitingList()
                      }
                    }}
                    className="bg-[#111111] border-[#1a1a1a] text-white placeholder:text-gray-500"
                  />
                  <Button
                    onClick={handleJoinWaitingList}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Bekleme Listesine Katıl
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Waiting List */}
        {waitingList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="text-white">
                  Bekleme Listesi ({waitingList.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {waitingList.map((player) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-1.5 bg-[#111111] border border-[#1a1a1a] rounded-md text-sm text-white"
                    >
                      {player.name}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Teams Side by Side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams[0] && <TeamCard team={teams[0]} />}
            {teams[1] && <TeamCard team={teams[1]} />}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

