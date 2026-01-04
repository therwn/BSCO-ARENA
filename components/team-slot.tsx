"use client"

import { motion } from "framer-motion"
import { Player } from "@/store/lobby-store"
import { Button } from "@/components/ui/button"
import { X, User } from "lucide-react"

interface TeamSlotProps {
  player: Player | null
  isCaptain: boolean
  slotIndex: number
  teamId: string
  currentPlayerId: string | null
  isInWaitingList: boolean
  onJoin: () => void
  onLeave: () => void
}

export default function TeamSlot({
  player,
  isCaptain,
  slotIndex,
  teamId,
  currentPlayerId,
  isInWaitingList,
  onJoin,
  onLeave,
}: TeamSlotProps) {
  const isEmpty = !player
  const isCurrentPlayer = player?.id === currentPlayerId
  const canJoin = isInWaitingList && isEmpty

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`relative p-4 rounded-lg border-2 transition-all ${
        isEmpty
          ? "border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#2a2a2a]"
          : isCurrentPlayer
          ? "border-white bg-[#1a1a1a]"
          : "border-[#2a2a2a] bg-[#111111]"
      }`}
    >
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-20 space-y-2">
          <User className={`w-6 h-6 ${canJoin ? "text-gray-600" : "text-gray-800"}`} />
          {canJoin ? (
            <Button
              onClick={onJoin}
              variant="ghost"
              size="sm"
              className="text-xs text-gray-400 hover:text-white"
            >
              Katıl
            </Button>
          ) : (
            <p className="text-xs text-gray-600 text-center px-2">
              Önce bekleme listesine katıl
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{player.name}</p>
              {isCaptain && (
                <p className="text-xs text-gray-400">Kaptan</p>
              )}
            </div>
          </div>
          {isCurrentPlayer && (
            <Button
              onClick={onLeave}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}

