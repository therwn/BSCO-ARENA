"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Team, useLobbyStore } from "@/store/lobby-store"
import TeamSlot from "@/components/team-slot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TeamCardProps {
  team: Team
}

export default function TeamCard({ team }: TeamCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [teamName, setTeamName] = useState(team.name)
  const { joinTeamSlot, leaveTeamSlot, updateTeamName, currentPlayer } =
    useLobbyStore()

  const handleSaveName = () => {
    if (teamName.trim()) {
      updateTeamName(team.id, teamName.trim())
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setTeamName(team.name)
    setIsEditing(false)
  }

  const canEditName = team.captains.some(
    (c) => c && c.id === currentPlayer?.id
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
        <CardHeader>
          <div className="flex items-center justify-between">
            {isEditing && canEditName ? (
              <div className="flex items-center space-x-2 flex-1">
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="bg-[#111111] border-[#1a1a1a] text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName()
                    if (e.key === "Escape") handleCancelEdit()
                  }}
                  autoFocus
                />
                <Button
                  onClick={handleSaveName}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-green-400 hover:text-green-300"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <CardTitle className="text-white">{team.name}</CardTitle>
                {canEditName && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-gray-400 hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Takım Kaptanları (2)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {team.captains.map((captain, index) => (
                <TeamSlot
                  key={`captain-${index}`}
                  player={captain}
                  isCaptain={true}
                  slotIndex={index}
                  teamId={team.id}
                  currentPlayerId={currentPlayer?.id || null}
                  onJoin={() => joinTeamSlot(team.id, "captain", index)}
                  onLeave={() => leaveTeamSlot(team.id, "captain", index)}
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Oyuncular (4)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {team.players.map((player, index) => (
                <TeamSlot
                  key={`player-${index}`}
                  player={player}
                  isCaptain={false}
                  slotIndex={index}
                  teamId={team.id}
                  currentPlayerId={currentPlayer?.id || null}
                  onJoin={() => joinTeamSlot(team.id, "player", index)}
                  onLeave={() => leaveTeamSlot(team.id, "player", index)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

