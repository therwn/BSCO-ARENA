"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users } from "lucide-react"

export default function Home() {
  const [lobbyCode, setLobbyCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const handleCreateLobby = async () => {
    setIsCreating(true)
    try {
      const response = await fetch("/api/lobby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "create" }),
      })

      const data = await response.json()

      if (data.success && data.code) {
        // URL'i güncelle ve lobi sayfasına yönlendir
        router.push(`/lobby/${data.code}`)
      } else {
        alert("Lobi oluşturulamadı. Lütfen tekrar deneyin.")
      }
    } catch (error) {
      console.error("Lobi oluşturma hatası:", error)
      alert("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinLobby = async () => {
    if (!lobbyCode.trim()) {
      alert("Lütfen bir lobi kodu girin")
      return
    }

    setIsJoining(true)
    try {
      const response = await fetch("/api/lobby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "join",
          code: lobbyCode.trim().toUpperCase(),
        }),
      })

      const data = await response.json()

      if (data.success && data.code) {
        // Lobi sayfasına yönlendir
        router.push(`/lobby/${data.code}`)
      } else {
        alert(data.error || "Lobi bulunamadı. Lütfen kodu kontrol edin.")
      }
    } catch (error) {
      console.error("Lobiye katılma hatası:", error)
      alert("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsJoining(false)
    }
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
            {/* Lobi Oluştur Butonu */}
            <Button
              onClick={handleCreateLobby}
              disabled={isCreating || isJoining}
              className="w-full bg-white text-black hover:bg-gray-200 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isCreating ? "Oluşturuluyor..." : "Lobi Oluştur"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#1a1a1a]"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0a0a0a] px-2 text-gray-500">veya</span>
              </div>
            </div>

            {/* Lobiye Katıl */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Lobiye Katıl
              </label>
              <Input
                placeholder="Lobi kodunu girin"
                value={lobbyCode}
                onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isJoining && !isCreating) {
                    handleJoinLobby()
                  }
                }}
                className="bg-[#111111] border-[#1a1a1a] text-white placeholder:text-gray-500"
                disabled={isJoining || isCreating}
              />
            </div>
            <Button
              onClick={handleJoinLobby}
              disabled={isJoining || isCreating || !lobbyCode.trim()}
              className="w-full bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] disabled:opacity-50"
            >
              <Users className="w-4 h-4 mr-2" />
              {isJoining ? "Katılılıyor..." : "Lobiye Katıl"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
