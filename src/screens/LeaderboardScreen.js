import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export default function LeaderboardScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [topPlayers, setTopPlayers] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);

      // Get top 100 players by total score
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        orderBy('totalScore', 'desc'),
        limit(100)
      );

      const querySnapshot = await getDocs(q);
      const players = [];
      
      querySnapshot.forEach((doc, index) => {
        const data = doc.data();
        
        // Only include players with at least 1 game played
        if (data.totalGames > 0) {
          const playerData = {
            uid: doc.id,
            username: data.username || 'Unknown',
            totalScore: data.totalScore || 0,
            totalGames: data.totalGames || 0,
            totalWins: data.totalWins || 0,
            rank: players.length + 1  // Rank based on actual position in filtered list
          };
          
          players.push(playerData);
          
          // Find my rank
          if (doc.id === currentUser?.uid) {
            setMyRank(playerData);
          }
        }
      });

      setTopPlayers(players.slice(0, 50)); // Show top 50
      console.log(`🏆 Loaded ${players.length} players`);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#B8B8D1';
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

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
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>🏆 Global Leaderboard</Text>

        {/* My Rank Card */}
        {myRank && myRank.rank ? (
          <View style={styles.myRankCard}>
            <Text style={styles.myRankTitle}>Your Rank</Text>
            <View style={styles.myRankContent}>
              <View style={styles.myRankLeft}>
                <Text style={styles.myRankNumber}>{myRank.rank}</Text>
                <Text style={styles.myRankName}>{myRank.username}</Text>
              </View>
              <Text style={styles.myRankScore}>{myRank.totalScore} pts</Text>
            </View>
            <View style={styles.myRankStatsContainer}>
              <Text style={styles.myRankStat}>{myRank.totalGames} games</Text>
              <Text style={styles.myRankStat}> • </Text>
              <Text style={styles.myRankStat}>{myRank.totalWins} wins</Text>
            </View>
          </View>
        ) : (
          <View style={styles.myRankCard}>
            <Text style={styles.myRankTitle}>Your Rank</Text>
            <Text style={styles.notRankedText}>🎮 Play more games to get ranked!</Text>
            <Text style={styles.notRankedSubtext}>Complete at least one game to appear on the leaderboard</Text>
          </View>
        )}

        {/* Top Players List */}
        <View style={styles.playersContainer}>
          {topPlayers.length > 0 ? (
            topPlayers.map((player) => (
              <View 
                key={player.uid} 
                style={[
                  styles.playerCard,
                  player.uid === currentUser?.uid && styles.myPlayerCard
                ]}
              >
                <View style={styles.playerLeft}>
                  <Text style={[styles.playerRank, { color: getRankColor(player.rank) }]}>
                    {getRankEmoji(player.rank)} {player.rank}
                  </Text>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>
                      {player.username} {player.uid === currentUser?.uid && '(You)'}
                    </Text>
                    <Text style={styles.playerStats}>
                      {player.totalGames} games • {player.totalWins} wins
                    </Text>
                  </View>
                </View>
                <Text style={styles.playerScore}>{player.totalScore}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No players yet</Text>
              <Text style={styles.emptySubtext}>Be the first to play!</Text>
            </View>
          )}
        </View>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { 
    padding: 20, 
    paddingTop: 60,
    paddingBottom: 40 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    color: '#B8B8D1', 
    fontSize: 16, 
    marginTop: 16 
  },
  title: { 
    color: '#FFF', 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginBottom: 24, 
    textAlign: 'center' 
  },
  
  // My Rank Card
  myRankCard: { 
    backgroundColor: '#6C5CE7', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 24 
  },
  myRankTitle: { 
    color: '#FFF', 
    fontSize: 14, 
    opacity: 0.8, 
    marginBottom: 12 
  },
  myRankContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  myRankLeft: { 
    flex: 1 
  },
  myRankNumber: { 
    color: '#FFF', 
    fontSize: 32, 
    fontWeight: 'bold' 
  },
  myRankName: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  myRankScore: { 
    color: '#FFF', 
    fontSize: 28, 
    fontWeight: 'bold' 
  },
  myRankStatsContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  myRankStat: { 
    color: '#FFF', 
    fontSize: 14, 
    opacity: 0.8 
  },
  
  // Not Ranked State
  notRankedText: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12 
  },
  notRankedSubtext: { 
    color: '#FFF', 
    fontSize: 14, 
    opacity: 0.8,
    textAlign: 'center'
  },

  // Players List
  playersContainer: { 
    marginBottom: 20 
  },
  playerCard: { 
    backgroundColor: '#2D2D44', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  myPlayerCard: { 
    borderWidth: 2, 
    borderColor: '#6C5CE7' 
  },
  playerLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  playerRank: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginRight: 12, 
    minWidth: 60 
  },
  playerInfo: { 
    flex: 1 
  },
  playerName: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 4 
  },
  playerStats: { 
    color: '#8E8EA9', 
    fontSize: 12 
  },
  playerScore: { 
    color: '#00C896', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },

  // Empty State
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    color: '#B8B8D1',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  },
  emptySubtext: {
    color: '#8E8EA9',
    fontSize: 14
  },

  // Back Button
  backButton: { 
    alignItems: 'center', 
    marginTop: 20, 
    marginBottom: 20 
  },
  backText: { 
    color: '#6C5CE7', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});