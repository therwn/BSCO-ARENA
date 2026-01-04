"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Team, useLobbyStore } from "@/store/lobby-store"
import TeamSlot from "@/components/team-slot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Edit2, Check, X, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

interface TeamCardProps {
  team: Team
}

const TEAM_COLORS = [
  { name: "Mavi", value: "#3b82f6" },
  { name: "Kırmızı", value: "#ef4444" },
  { name: "Yeşil", value: "#10b981" },
  { name: "Sarı", value: "#f59e0b" },
  { name: "Mor", value: "#8b5cf6" },
  { name: "Pembe", value: "#ec4899" },
  { name: "Turuncu", value: "#f97316" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Lime", value: "#84cc16" },
  { name: "Amber", value: "#fbbf24" },
]

export default function TeamCard({ team }: TeamCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [teamName, setTeamName] = useState(team.name)
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false)
  const { joinTeamSlot, leaveTeamSlot, updateTeamName, updateTeamColor, currentPlayer } =
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

  const canEdit = team.captains[0] && team.captains[0].id === currentPlayer?.id

  const teamColorStyle = {
    borderColor: team.color,
    boxShadow: `0 0 0 1px ${team.color}40`,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card
        className="bg-[#0a0a0a] border-2 h-full flex flex-col"
        style={teamColorStyle}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            {isEditing && canEdit ? (
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
                <div className="flex items-center space-x-2">
                  {canEdit && (
                    <>
                      <Popover open={colorPopoverOpen} onOpenChange={setColorPopoverOpen}>
                        <PopoverTrigger>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-400 hover:text-white"
                            title="Takım Rengini Değiştir"
                          >
                            <Palette className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="bg-[#111111] border-[#1a1a1a] p-3">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-white mb-2">
                              Takım Rengi Seç
                            </p>
                            <div className="grid grid-cols-5 gap-2">
                              {TEAM_COLORS.map((color) => (
                                <button
                                  key={color.value}
                                  onClick={() => {
                                    updateTeamColor(team.id, color.value)
                                    setColorPopoverOpen(false)
                                  }}
                                  className={`w-10 h-10 rounded-md border-2 transition-all hover:scale-110 ${
                                    team.color === color.value
                                      ? "border-white scale-110"
                                      : "border-[#1a1a1a] hover:border-gray-500"
                                  }`}
                                  style={{ backgroundColor: color.value }}
                                  title={color.name}
                                />
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Button
                        onClick={() => setIsEditing(true)}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-400 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Takım Kaptanı (1)
            </h3>
            <div className="mb-4">
              <TeamSlot
                player={team.captains[0]}
                isCaptain={true}
                slotIndex={0}
                teamId={team.id}
                currentPlayerId={currentPlayer?.id || null}
                onJoin={() => joinTeamSlot(team.id, "captain", 0)}
                onLeave={() => leaveTeamSlot(team.id, "captain", 0)}
              />
            </div>
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
