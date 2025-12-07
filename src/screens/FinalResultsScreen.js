import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import useGameStore from '../store/gameStore';
import LeaderboardItem from '../components/LeaderboardItem';
import { sortPlayersByScore } from '../utils/gameUtils';

export default function FinalResultsScreen({ navigation }) {
  const { sessionId, resetGame } = useGameStore();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'activeSessions', sessionId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const playersObj = data.players || {};
          const playersArray = Object.values(playersObj);
          
          // Sort by score
          const sorted = sortPlayersByScore(playersArray);
          setPlayers(sorted);
          console.log('🏆 Final results loaded');
        }
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  const handlePlayAgain = () => {
    resetGame();
    navigation.navigate('Home');
  };

  const winner = players[0];

  return (
    <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        
        {/* Winner Announcement */}
        {winner && (
          <View style={styles.winnerContainer}>
            <Text style={styles.winnerEmoji}>🏆</Text>
            <Text style={styles.winnerTitle}>WINNER!</Text>
            <Text style={styles.winnerName}>{winner.name}</Text>
            <Text style={styles.winnerScore}>{winner.score} points</Text>
            <Text style={styles.winnerStats}>
              {winner.correctAnswers || 0} correct answers
            </Text>
          </View>
        )}

        {/* Final Leaderboard */}
        <View style={styles.leaderboardContainer}>
          <Text style={styles.leaderboardTitle}>Final Leaderboard</Text>
          {players.map((player, index) => (
            <LeaderboardItem
              key={player.id}
              player={player}
              rank={index + 1}
            />
          ))}
        </View>

        {/* Play Again Button */}
        <TouchableOpacity 
          style={styles.playAgainButton}
          onPress={handlePlayAgain}
        >
          <Text style={styles.playAgainText}>Play Again</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  winnerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: '#6C5CE7',
    padding: 32,
    borderRadius: 24,
  },
  winnerEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  winnerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  winnerName: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  winnerScore: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  winnerStats: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  leaderboardContainer: {
    marginBottom: 30,
  },
  leaderboardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  playAgainButton: {
    backgroundColor: '#00C896',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  playAgainText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});