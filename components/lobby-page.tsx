"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useLobbyStore } from "@/store/lobby-store"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import TeamCard from "@/components/team-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LogOut, UserPlus } from "lucide-react"

interface LobbyPageProps {
  lobbyCode: string
}

export default function LobbyPage({ lobbyCode }: LobbyPageProps) {
  const {
    teams,
    waitingList,
    currentPlayer,
    setCurrentPlayer,
    addToWaitingList,
    removeFromWaitingList,
    initializeTeams,
  } = useLobbyStore()

  const [playerName, setPlayerName] = useState("")
  const [activeTab, setActiveTab] = useState("team1")

  useEffect(() => {
    initializeTeams()
    // Rastgele bir oyuncu ID'si oluştur
    const playerId = `player-${Math.random().toString(36).substr(2, 9)}`
    setCurrentPlayer({
      id: playerId,
      name: `Oyuncu ${playerId.slice(-4)}`,
      isCaptain: false,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleJoinWaitingList = () => {
    if (playerName.trim() && currentPlayer) {
      const updatedPlayer = {
        ...currentPlayer,
        name: playerName.trim(),
      }
      setCurrentPlayer(updatedPlayer)
      addToWaitingList(updatedPlayer)
    }
  }

  const handleLeaveLobby = () => {
    if (currentPlayer) {
      removeFromWaitingList(currentPlayer.id)
      setCurrentPlayer(null)
      window.location.reload()
    }
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
            <p className="text-gray-400 mt-1">Lobi Kodu: {lobbyCode}</p>
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

        {/* Teams Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#0a0a0a] border border-[#1a1a1a] mb-6">
              <TabsTrigger
                value="team1"
                className="data-[active=true]:bg-[#1a1a1a] data-[active=true]:text-white"
              >
                {teams[0]?.name || "Takım 1"}
              </TabsTrigger>
              <TabsTrigger
                value="team2"
                className="data-[active=true]:bg-[#1a1a1a] data-[active=true]:text-white"
              >
                {teams[1]?.name || "Takım 2"}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="team1">
              {teams[0] && <TeamCard team={teams[0]} />}
            </TabsContent>
            <TabsContent value="team2">
              {teams[1] && <TeamCard team={teams[1]} />}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

