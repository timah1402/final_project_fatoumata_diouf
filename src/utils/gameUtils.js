/**
 * Generate a random 6-character game code
 */
export const generateGameCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

/**
 * Calculate points based on correctness and time
 */
export const calculatePoints = (isCorrect, timeElapsed, totalTime) => {
  if (!isCorrect) return 0;
  
  const basePoints = 1000;
  const timeRemaining = Math.max(0, totalTime - timeElapsed);
  const timeBonus = (timeRemaining / totalTime) * 500;
  
  return Math.round(basePoints + timeBonus);
};

/**
 * Sort players by score for leaderboard
 */
export const sortPlayersByScore = (players) => {
  return [...players].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (b.correctAnswers !== a.correctAnswers) {
      return b.correctAnswers - a.correctAnswers;
    }
    return a.avgTime - b.avgTime;
  });
};

/**
 * Get medal emoji for top 3 positions
 */
export const getMedalEmoji = (rank) => {
  const medals = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
  };
  return medals[rank] || '';
};

/**
 * Format time in seconds to display format
 */
export const formatTime = (seconds) => {
  return `${seconds.toFixed(1)}s`;
};

/**
 * Get color based on answer correctness
 */
export const getAnswerColor = (isCorrect) => {
  return isCorrect ? '#00C896' : '#FF6B6B';
};
