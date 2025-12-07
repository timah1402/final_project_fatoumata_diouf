import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import useGameStore from '../store/gameStore';
import { useAuth } from '../context/AuthContext';
import LeaderboardItem from '../components/LeaderboardItem';
import { sortPlayersByScore } from '../utils/gameUtils';

export default function FinalResultsScreen({ navigation }) {
  const { sessionId, selectedGame, resetGame } = useGameStore();
  const { currentUser, loadUserProfile } = useAuth();
  const [players, setPlayers] = useState([]);
  const hasSavedRef = useRef(false);

  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'activeSessions', sessionId),
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const playersObj = data.players || {};
          const playersArray = Object.values(playersObj);
          
          // Sort by score
          const sorted = sortPlayersByScore(playersArray);
          setPlayers(sorted);
          console.log('🏆 Final results loaded');

          // Save game history (only once)
          if (!hasSavedRef.current && currentUser) {
            hasSavedRef.current = true;
            await saveGameHistory(sorted, data);
          }
        }
      }
    );

    return () => unsubscribe();
  }, [sessionId, currentUser]);

  const ensureUserProfile = async (userId, userData) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Create profile if it doesn't exist
        await setDoc(userRef, {
          uid: userId,
          email: currentUser.email,
          username: userData.name || currentUser.displayName || 'Player',
          createdAt: new Date(),
          totalGames: 0,
          totalWins: 0,
          totalScore: 0,
          gamesHistory: []
        });
        console.log('✅ Created missing user profile');
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  };

  const saveGameHistory = async (sortedPlayers, sessionData) => {
    try {
      if (!currentUser) return;

      // Find my data
      const myData = sortedPlayers.find(p => p.id === currentUser.uid);
      if (!myData) {
        console.log('⚠️ Player data not found');
        return;
      }

      // Ensure user profile exists
      await ensureUserProfile(currentUser.uid, myData);

      // Get current profile to check if we already saved this game
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const currentProfile = userDoc.data();
      
      // Check if this game was already saved (prevent duplicates)
      const gameAlreadySaved = currentProfile?.gamesHistory?.some(
        g => g.gameId === sessionData.gameId && 
             Math.abs(new Date(g.date).getTime() - new Date().getTime()) < 10000 // Within 10 seconds
      );
      
      if (gameAlreadySaved) {
        console.log('⚠️ Game already saved, skipping...');
        await loadUserProfile(currentUser.uid);
        return;
      }

      // Find my rank
      const myRank = sortedPlayers.findIndex(p => p.id === currentUser.uid) + 1;
      const isWinner = myRank === 1;
      
      // Get my actual score from the session
      const myScore = myData.score || 0;
      const myCorrectAnswers = myData.correctAnswers || 0;

      console.log(`📊 Saving game: Score=${myScore}, Rank=${myRank}, Winner=${isWinner}`);

      // Create game history entry
      const gameHistory = {
        gameId: sessionData.gameId,
        gameName: selectedGame?.title || 'Unknown Game',
        date: new Date().toISOString(),
        myScore: myScore,
        myRank: myRank,
        totalPlayers: sortedPlayers.length,
        isWinner: isWinner,
        correctAnswers: myCorrectAnswers
      };

      // Update user profile - calculate new totals
      const currentGames = currentProfile?.totalGames || 0;
      const currentWins = currentProfile?.totalWins || 0;
      const currentScore = currentProfile?.totalScore || 0;

      await updateDoc(doc(db, 'users', currentUser.uid), {
        totalGames: currentGames + 1,
        totalWins: currentWins + (isWinner ? 1 : 0),
        totalScore: currentScore + myScore,
        gamesHistory: arrayUnion(gameHistory)
      });

      // Reload user profile
      await loadUserProfile(currentUser.uid);

      console.log('✅ Game history saved successfully!');
    } catch (error) {
      console.error('❌ Error saving game history:', error);
    }
  };

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

        {/* Home Button */}
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={handlePlayAgain}
        >
          <Text style={styles.homeButtonText}>🏠 Back to Home</Text>
        </TouchableOpacity>

        {/* View Profile Button */}
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileText}>📊 View My Stats</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60 },
  winnerContainer: { alignItems: 'center', marginBottom: 40, backgroundColor: '#6C5CE7', padding: 32, borderRadius: 24 },
  winnerEmoji: { fontSize: 80, marginBottom: 16 },
  winnerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  winnerName: { color: '#FFF', fontSize: 36, fontWeight: 'bold', marginBottom: 8 },
  winnerScore: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  winnerStats: { color: '#FFF', fontSize: 14, opacity: 0.8 },
  leaderboardContainer: { marginBottom: 30 },
  leaderboardTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  homeButton: { backgroundColor: '#6C5CE7', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  homeButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  profileButton: { backgroundColor: '#00C896', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 40 },
  profileText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});