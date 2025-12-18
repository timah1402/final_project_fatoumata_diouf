import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { seedGamesToFirebase } from '../data/seedGames';

export default function HomeScreen({ navigation }) {
  const { currentUser, userProfile } = useAuth();
  const [seedCount, setSeedCount] = useState(0);

  const handleSeedGames = async () => {
    const result = await seedGamesToFirebase();
    if (result.success) {
      Alert.alert('Success', `${result.count} games uploaded to Firebase!`);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const winRate = userProfile?.totalGames > 0 
    ? Math.round((userProfile.totalWins / userProfile.totalGames) * 100) 
    : 0;

  return (
    <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        
        {/* Header with Profile Button */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back! 👋</Text>
            <Text style={styles.username}>{currentUser?.displayName || 'Player'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCard1]}>
            <Text style={styles.statIcon}>🎮</Text>
            <Text style={styles.statValue}>{userProfile?.totalGames || 0}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>
          <View style={[styles.statCard, styles.statCard2]}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statValue}>{userProfile?.totalWins || 0}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
         
        </View>

      
        

        {/* Title */}
        <TouchableOpacity 
          onPress={() => {
            setSeedCount(prev => prev + 1);
            if (seedCount >= 2) {
              handleSeedGames();
              setSeedCount(0);
            }
          }}
        >
          <Text style={styles.title}>🎮 Kahoot App</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>Engineering Edition</Text>

        {/* Main Action Buttons */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.buttonGrid}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.hostButton]}
              onPress={() => navigation.navigate('GameSelection')}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonIcon}>👑</Text>
                <Text style={styles.buttonText}>Host Game</Text>
                <Text style={styles.buttonSubtext}>Start a new quiz</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.joinButton]}
              onPress={() => navigation.navigate('JoinGame')}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonIcon}>🎯</Text>
                <Text style={styles.buttonText}>Join Game</Text>
                <Text style={styles.buttonSubtext}>Enter game code</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonGrid}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.createButton]}
              onPress={() => navigation.navigate('CreateGame')}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonIcon}>✨</Text>
                <Text style={styles.buttonText}>Create Game</Text>
                <Text style={styles.buttonSubtext}>Build your quiz</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.myGamesButton]}
              onPress={() => navigation.navigate('MyGames')}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonIcon}>📝</Text>
                <Text style={styles.buttonText}>My Games</Text>
                <Text style={styles.buttonSubtext}>Manage quizzes</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Leaderboard Button - Full Width */}
          <TouchableOpacity 
            style={[styles.actionButton, styles.leaderboardButton]}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>🏆</Text>
              <Text style={styles.buttonText}>Global Leaderboard</Text>
              <Text style={styles.buttonSubtext}>See top players worldwide</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  welcomeText: { 
    color: '#B8B8D1', 
    fontSize: 14,
    marginBottom: 4
  },
  username: { 
    color: '#FFF', 
    fontSize: 28, 
    fontWeight: 'bold' 
  },
  profileButton: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: '#6C5CE7', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  profileIcon: { fontSize: 28 },
  
  statsContainer: { 
    flexDirection: 'row', 
    gap: 12,
    marginBottom: 20 
  },
  statCard: { 
    flex: 1,
    alignItems: 'center', 
    padding: 20, 
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4
  },
  statCard1: { backgroundColor: '#6C5CE7' },
  statCard2: { backgroundColor: '#00C896' },
  statCard3: { backgroundColor: '#FFA502' },
  statIcon: { 
    fontSize: 32, 
    marginBottom: 8 
  },
  statValue: { 
    color: '#FFF', 
    fontSize: 28, 
    fontWeight: 'bold',
    marginBottom: 4
  },
  statLabel: { 
    color: '#FFF', 
    fontSize: 11,
    opacity: 0.9,
    textAlign: 'center'
  },

  winRateBanner: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20
  },
  winRateText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  
  title: { 
    color: '#FFF', 
    fontSize: 42, 
    fontWeight: 'bold', 
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: { 
    color: '#B8B8D1', 
    fontSize: 16, 
    textAlign: 'center',
    marginBottom: 32
  },

  actionSection: {
    marginTop: 8
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16
  },

  buttonGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },

  actionButton: { 
    flex: 1,
    borderRadius: 16, 
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6
  },
  buttonContent: {
    alignItems: 'center'
  },
  hostButton: { backgroundColor: '#6C5CE7' },
  joinButton: { backgroundColor: '#00C896' },
  createButton: { backgroundColor: '#FFD700' },
  myGamesButton: { backgroundColor: '#FF6B6B' },
  leaderboardButton: { 
    backgroundColor: '#FFA502',
    flex: undefined // Make it full width
  },
  
  buttonIcon: { 
    fontSize: 40, 
    marginBottom: 8 
  },
  buttonText: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 4,
    textAlign: 'center'
  },
  buttonSubtext: { 
    color: '#FFF', 
    fontSize: 12, 
    opacity: 0.85,
    textAlign: 'center'
  }
});