import { create } from 'zustand';

const useGameStore = create((set) => ({
  // User state
  userId: null,
  playerName: null,
  isHost: false,

  // Session state
  sessionId: null,
  gameCode: null,
  selectedGame: null,

  // Players
  players: {},

  // Actions
  setUser: (userId, playerName, isHost) =>
    set({ userId, playerName, isHost }),

  setSession: (sessionId, gameCode, isHost) =>
    set({ sessionId, gameCode, isHost }),

  setSelectedGame: (game) =>
    set({ selectedGame: game }),

  setPlayers: (players) =>
    set({ players }),

  addPlayer: (player) =>
    set((state) => ({
      players: { ...state.players, [player.id]: player },
    })),

  removePlayer: (playerId) =>
    set((state) => {
      const newPlayers = { ...state.players };
      delete newPlayers[playerId];
      return { players: newPlayers };
    }),

  updateMyScore: (score) =>
    set((state) => ({
      players: {
        ...state.players,
        [state.userId]: {
          ...state.players[state.userId],
          score,
        },
      },
    })),

  resetGame: () =>
    set({
      sessionId: null,
      gameCode: null,
      selectedGame: null,
      players: {},
      isHost: false,
    }),
}));

export default useGameStore;