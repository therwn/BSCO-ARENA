"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LobbyPage from "@/components/lobby-page"

export default function Home() {
  const [lobbyCode, setLobbyCode] = useState("")
  const [enteredLobby, setEnteredLobby] = useState(false)
  const [currentLobbyCode, setCurrentLobbyCode] = useState("")

  const handleEnterLobby = () => {
    if (lobbyCode.trim()) {
      setCurrentLobbyCode(lobbyCode.trim().toUpperCase())
      setEnteredLobby(true)
    }
  }

  if (enteredLobby) {
    return <LobbyPage lobbyCode={currentLobbyCode} />
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader>
            <CardTitle className="text-white text-center text-2xl">
              BSCO Arena
            </CardTitle>
            <p className="text-muted-foreground text-center text-sm mt-2">
              5v5 Lobi Sistemine Hoş Geldiniz
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Lobi Kodu
              </label>
              <Input
                placeholder="Lobi kodunu girin"
                value={lobbyCode}
                onChange={(e) => setLobbyCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEnterLobby()
                  }
                }}
                className="bg-[#111111] border-[#1a1a1a] text-white placeholder:text-gray-500"
              />
            </div>
            <Button
              onClick={handleEnterLobby}
              className="w-full bg-white text-black hover:bg-gray-200"
            >
              Lobiye Gir
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

