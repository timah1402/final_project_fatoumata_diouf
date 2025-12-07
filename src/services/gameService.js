import { create } from 'zustand';

const useGameStore = create((set) => ({
  // User info
  userId: null,
  playerName: null,
  isHost: false,
  
  // Game session
  sessionId: null,
  gameCode: null,
  selectedGame: null,
  currentQuestionIndex: 0,
  
  // Player data
  players: {},
  myScore: 0,
  
  // Actions
  setUser: (userId, playerName, isHost = false) =>
    set({ userId, playerName, isHost }),
  
  setSession: (sessionId, gameCode, selectedGame) =>
    set({ sessionId, gameCode, selectedGame }),
  
  setPlayers: (players) =>
    set({ players }),
  
  addPlayer: (playerId, playerData) =>
    set((state) => ({
      players: { ...state.players, [playerId]: playerData }
    })),
  
  removePlayer: (playerId) =>
    set((state) => {
      const newPlayers = { ...state.players };
      delete newPlayers[playerId];
      return { players: newPlayers };
    }),
  
  updateMyScore: (score) =>
    set({ myScore: score }),
  
  setCurrentQuestionIndex: (index) =>
    set({ currentQuestionIndex: index }),
  
  resetGame: () =>
    set({
      sessionId: null,
      gameCode: null,
      selectedGame: null,
      currentQuestionIndex: 0,
      players: {},
      myScore: 0,
    }),
}));

export default useGameStore;