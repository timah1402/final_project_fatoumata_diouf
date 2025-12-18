import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export default function LeaderboardScreen({ navigation, route }) {
  const { currentUser } = useAuth();
  const { gameId, gameTitle } = route.params || {};
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('allTime'); // 'allTime' or 'myRank'

  useEffect(() => {
    loadLeaderboard();
  }, [gameId]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Get all users
      const usersRef = collection(db, 'users');
      const usersSnap = await getDocs(usersRef);
      
      const leaderboardData = [];
      
      usersSnap.docs.forEach(doc => {
        const userData = doc.data();
        const gamesHistory = userData.gamesHistory || [];
        
        // Filter games by gameId if provided, otherwise all games
        const relevantGames = gameId 
          ? gamesHistory.filter(g => g.gameId === gameId)
          : gamesHistory;
        
        if (relevantGames.length > 0) {
          // Calculate stats for this user
          const totalScore = relevantGames.reduce((sum, g) => sum + (g.myScore || 0), 0);
          const totalGames = relevantGames.length;
          const totalWins = relevantGames.filter(g => g.isWinner).length;
          const avgScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;
          const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
          
          leaderboardData.push({
            userId: doc.id,
            username: userData.username || 'Player',
            totalScore,
            totalGames,
            totalWins,
            avgScore,
            winRate,
            isCurrentUser: doc.id === currentUser?.uid
          });
        }
      });
      
      // Sort by total score (highest first)
      leaderboardData.sort((a, b) => b.totalScore - a.totalScore);
      
      // Add rank
      leaderboardData.forEach((player, index) => {
        player.rank = index + 1;
      });
      
      setLeaderboard(leaderboardData);
      console.log(`✅ Loaded leaderboard: ${leaderboardData.length} players`);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const renderPlayer = ({ item }) => (
    <View style={[
      styles.playerCard,
      item.isCurrentUser && styles.currentUserCard,
      item.rank <= 3 && styles.topThreeCard
    ]}>
      <View style={styles.playerLeft}>
        <Text style={[styles.rank, item.rank <= 3 && styles.topRank]}>
          {getRankEmoji(item.rank)}
        </Text>
        <View style={styles.playerInfo}>
          <Text style={[styles.username, item.isCurrentUser && styles.currentUsername]}>
            {item.username} {item.isCurrentUser && '(You)'}
          </Text>
          <Text style={styles.playerStats}>
            🎮 {item.totalGames} games • 🏆 {item.totalWins} wins • 📊 {item.winRate}% win rate
          </Text>
        </View>
      </View>
      <View style={styles.playerRight}>
        <Text style={styles.score}>{item.totalScore}</Text>
        <Text style={styles.scoreLabel}>points</Text>
        <Text style={styles.avgScore}>avg: {item.avgScore}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C5CE7" />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        {gameTitle && <Text style={styles.subtitle}>{gameTitle}</Text>}
        {!gameTitle && <Text style={styles.subtitle}>All Games</Text>}

        {leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No data yet. Play some games!</Text>
          </View>
        ) : (
          <>
            <Text style={styles.totalPlayers}>
              {leaderboard.length} {leaderboard.length === 1 ? 'player' : 'players'}
            </Text>
            
            <FlatList
              data={leaderboard}
              keyExtractor={(item) => item.userId}
              renderItem={renderPlayer}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#B8B8D1', fontSize: 16, marginTop: 16 },
  title: { color: '#FFF', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#B8B8D1', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  totalPlayers: { color: '#8E8EA9', fontSize: 14, marginBottom: 16 },
  listContent: { paddingBottom: 100 },
  playerCard: {
    backgroundColor: '#2D2D44',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A52'
  },
  currentUserCard: {
    borderColor: '#00C896',
    borderWidth: 2,
    backgroundColor: '#00C89610'
  },
  topThreeCard: {
    borderColor: '#FFD700',
    borderWidth: 2
  },
  playerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rank: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#B8B8D1', 
    width: 50,
    textAlign: 'center'
  },
  topRank: { fontSize: 32 },
  playerInfo: { flex: 1 },
  username: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  currentUsername: { color: '#00C896' },
  playerStats: { color: '#8E8EA9', fontSize: 12 },
  playerRight: { alignItems: 'flex-end' },
  score: { color: '#FFD700', fontSize: 24, fontWeight: 'bold' },
  scoreLabel: { color: '#B8B8D1', fontSize: 12 },
  avgScore: { color: '#8E8EA9', fontSize: 11, marginTop: 2 },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyText: { color: '#B8B8D1', fontSize: 16, textAlign: 'center' },
  backButton: { 
    position: 'absolute', 
    bottom: 30, 
    alignSelf: 'center',
    backgroundColor: '#2D2D44',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  backButtonText: { color: '#6C5CE7', fontSize: 16, fontWeight: 'bold' }
});