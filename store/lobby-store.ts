import { create } from "zustand"

export interface Player {
  id: string
  name: string
  isCaptain: boolean
}

export interface Team {
  id: string
  name: string
  color: string
  captains: (Player | null)[]
  players: (Player | null)[]
}

interface LobbyState {
  teams: Team[]
  waitingList: Player[]
  currentPlayer: Player | null
  setCurrentPlayer: (player: Player | null) => void
  setTeams: (teams: Team[]) => void
  setWaitingList: (waitingList: Player[]) => void
  addToWaitingList: (player: Player) => void
  removeFromWaitingList: (playerId: string) => void
  joinTeamSlot: (teamId: string, slotType: "captain" | "player", slotIndex: number) => void
  leaveTeamSlot: (teamId: string, slotType: "captain" | "player", slotIndex: number) => void
  removePlayerFromAllSlots: (playerId: string) => void
  updateTeamName: (teamId: string, name: string) => void
  updateTeamColor: (teamId: string, color: string) => void
  initializeTeams: () => void
  onTeamSlotChange?: () => void
  setOnTeamSlotChange: (callback: (() => void) | undefined) => void
}

export const useLobbyStore = create<LobbyState>((set) => ({
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
  currentPlayer: null,
  onTeamSlotChange: undefined,

  setCurrentPlayer: (player) => set({ currentPlayer: player }),

  setOnTeamSlotChange: (callback) => set({ onTeamSlotChange: callback }),

  setTeams: (teams) => set({ teams }),

  setWaitingList: (waitingList) => set({ waitingList }),

  addToWaitingList: (player) =>
    set((state) => ({
      waitingList: [...state.waitingList, player],
    })),

  removeFromWaitingList: (playerId) =>
    set((state) => ({
      waitingList: state.waitingList.filter((p) => p.id !== playerId),
    })),

  joinTeamSlot: (teamId, slotType, slotIndex) =>
    set((state) => {
      const currentPlayer = state.currentPlayer
      if (!currentPlayer) return state

      // Oyuncu bekleme listesinde olmalı
      const isInWaitingList = state.waitingList.some(
        (p) => p.id === currentPlayer.id
      )
      if (!isInWaitingList) return state

      // Önce tüm takımlardan mevcut oyuncuyu çıkar
      const newTeams = state.teams.map((t) => {
        // Eğer hedef takım ise, slotu doldur
        if (t.id === teamId) {
          const newTeam = { ...t }
          if (slotType === "captain") {
            newTeam.captains = [...newTeam.captains]
            newTeam.captains[slotIndex] = currentPlayer
          } else {
            newTeam.players = [...newTeam.players]
            newTeam.players[slotIndex] = currentPlayer
          }
          return newTeam
        }
        // Diğer takımlardan oyuncuyu çıkar
        return {
          ...t,
          captains: t.captains.map((c) =>
            c?.id === currentPlayer.id ? null : c
          ),
          players: t.players.map((p) =>
            p?.id === currentPlayer.id ? null : p
          ),
        }
      })

      const newState = {
        teams: newTeams,
        waitingList: state.waitingList.filter((p) => p.id !== currentPlayer.id),
      }

      // Hemen API'ye gönder (callback varsa)
      if (state.onTeamSlotChange) {
        setTimeout(() => state.onTeamSlotChange?.(), 0)
      }

      return newState
    }),

  leaveTeamSlot: (teamId, slotType, slotIndex) =>
    set((state) => {
      const team = state.teams.find((t) => t.id === teamId)
      if (!team) return state

      const newTeams = state.teams.map((t) => {
        if (t.id === teamId) {
          const newTeam = { ...t }
          if (slotType === "captain") {
            newTeam.captains = [...newTeam.captains]
            newTeam.captains[slotIndex] = null
          } else {
            newTeam.players = [...newTeam.players]
            newTeam.players[slotIndex] = null
          }
          return newTeam
        }
        return t
      })

      const newState = { teams: newTeams }

      // Hemen API'ye gönder (callback varsa)
      if (state.onTeamSlotChange) {
        setTimeout(() => state.onTeamSlotChange?.(), 0)
      }

      return newState
    }),

  removePlayerFromAllSlots: (playerId) =>
    set((state) => ({
      teams: state.teams.map((team) => ({
        ...team,
        captains: team.captains.map((captain) =>
          captain?.id === playerId ? null : captain
        ),
        players: team.players.map((player) =>
          player?.id === playerId ? null : player
        ),
      })),
      waitingList: state.waitingList.filter((p) => p.id !== playerId),
    })),

  updateTeamName: (teamId, name) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId ? { ...t, name } : t
      ),
    })),

  updateTeamColor: (teamId, color) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId ? { ...t, color } : t
      ),
    })),

  initializeTeams: () =>
    set({
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
    }),
}))

