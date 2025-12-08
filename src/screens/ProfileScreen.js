import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { currentUser, userProfile, logout, loadUserProfile } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const createMyProfile = async () => {
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        uid: currentUser.uid,
        email: currentUser.email,
        username: currentUser.displayName || 'Player',
        createdAt: new Date(),
        totalGames: 0,
        totalWins: 0,
        totalScore: 0,
        gamesHistory: []
      });
      Alert.alert('Success', 'Profile created!');
      await loadUserProfile(currentUser.uid);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const gamesHistory = userProfile?.gamesHistory || [];
  const recentGames = [...gamesHistory].reverse().slice(0, 10);

  return (
    <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Profile</Text>

        {/* User Info */}
        <View style={styles.card}>
          <Text style={styles.username}>{currentUser?.displayName || 'User'}</Text>
          <Text style={styles.email}>{currentUser?.email}</Text>
        </View>

        {/* Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Statistics</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Games</Text>
            <Text style={styles.statValue}>{userProfile?.totalGames || 0}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Wins</Text>
            <Text style={styles.statValue}>{userProfile?.totalWins || 0}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Score</Text>
            <Text style={styles.statValue}>{userProfile?.totalScore || 0}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Win Rate</Text>
            <Text style={styles.statValue}>
              {userProfile?.totalGames > 0 
                ? Math.round((userProfile.totalWins / userProfile.totalGames) * 100) 
                : 0}%
            </Text>
          </View>
        </View>

        {/* Game History */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Games</Text>
          
          {recentGames.length === 0 ? (
            <Text style={styles.emptyText}>No games played yet</Text>
          ) : (
            recentGames.map((game, index) => (
              <View key={index} style={styles.gameHistoryItem}>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameName}>{game.gameName}</Text>
                  <Text style={styles.gameDate}>{formatDate(game.date)}</Text>
                </View>
                <View style={styles.gameStats}>
                  <Text style={[styles.gameRank, game.isWinner && styles.winnerRank]}>
                    {game.isWinner ? '🏆' : `#${game.myRank}`}
                  </Text>
                  <Text style={styles.gameScore}>{game.myScore} pts</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Fix Profile Button */}
        {!userProfile && (
          <TouchableOpacity style={styles.fixButton} onPress={createMyProfile}>
            <Text style={styles.fixText}>⚠️ KAHOOT Profile</Text>
          </TouchableOpacity>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

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
  content: { flex: 1, padding: 20, paddingTop: 60 },
  title: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  card: { backgroundColor: '#2D2D44', borderRadius: 16, padding: 20, marginBottom: 20 },
  username: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  email: { color: '#B8B8D1', fontSize: 16 },
  cardTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#3A3A52' },
  statLabel: { color: '#B8B8D1', fontSize: 16 },
  statValue: { color: '#00C896', fontSize: 18, fontWeight: 'bold' },
  emptyText: { color: '#8E8EA9', fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  gameHistoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#3A3A52' },
  gameInfo: { flex: 1 },
  gameName: { color: '#FFF', fontSize: 16, marginBottom: 4 },
  gameDate: { color: '#8E8EA9', fontSize: 12 },
  gameStats: { alignItems: 'flex-end' },
  gameRank: { color: '#B8B8D1', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  winnerRank: { color: '#FFD700', fontSize: 20 },
  gameScore: { color: '#00C896', fontSize: 14 },
  fixButton: { backgroundColor: '#FFD700', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  fixText: { color: '#1E1E2E', fontSize: 18, fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#FF6B6B', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  logoutText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  backButton: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
  backText: { color: '#6C5CE7', fontSize: 16 }
});