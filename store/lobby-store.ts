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
  addToWaitingList: (player: Player) => void
  removeFromWaitingList: (playerId: string) => void
  joinTeamSlot: (teamId: string, slotType: "captain" | "player", slotIndex: number) => void
  leaveTeamSlot: (teamId: string, slotType: "captain" | "player", slotIndex: number) => void
  updateTeamName: (teamId: string, name: string) => void
  updateTeamColor: (teamId: string, color: string) => void
  initializeTeams: () => void
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

  setCurrentPlayer: (player) => set({ currentPlayer: player }),

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

      return {
        teams: newTeams,
        waitingList: state.waitingList.filter((p) => p.id !== currentPlayer.id),
      }
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

      return { teams: newTeams }
    }),

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

