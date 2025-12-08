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

  return (
    <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <TouchableOpacity 
              onPress={() => {
                setSeedCount(prev => prev + 1);
                if (seedCount >= 2) {
                  handleSeedGames();
                  setSeedCount(0);
                }
              }}
            >
              <Text style={styles.username}>{currentUser?.displayName || 'Player'} 👋</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* App Title Card */}
        <View style={styles.titleCard}>
          <Text style={styles.appIcon}>🎮</Text>
          <Text style={styles.appTitle}>KAHOOT Live</Text>
          <Text style={styles.appSubtitle}>Engineering Edition</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCard1]}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statValue}>{userProfile?.totalGames || 0}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
          <View style={[styles.statCard, styles.statCard2]}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statValue}>{userProfile?.totalWins || 0}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          <View style={[styles.statCard, styles.statCard3]}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{userProfile?.totalScore || 0}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
          <View style={[styles.statCard, styles.statCard4]}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statValue}>
              {userProfile?.totalGames > 0 
                ? Math.round((userProfile.totalWins / userProfile.totalGames) * 100) 
                : 0}%
            </Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
        </View>

        {/* Main Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.mainActions}>
          <TouchableOpacity 
            style={[styles.mainActionCard, styles.hostCard]}
            onPress={() => navigation.navigate('GameSelection')}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>👑</Text>
            </View>
            <Text style={styles.actionTitle}>Host Game</Text>
            <Text style={styles.actionSubtext}>Start a new quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.mainActionCard, styles.joinCard]}
            onPress={() => navigation.navigate('JoinGame')}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>🎯</Text>
            </View>
            <Text style={styles.actionTitle}>Join Game</Text>
            <Text style={styles.actionSubtext}>Enter game code</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Actions */}
        <Text style={styles.sectionTitle}>More Options</Text>

        <TouchableOpacity 
          style={styles.secondaryAction}
          onPress={() => navigation.navigate('MyGames')}
        >
          <View style={styles.secondaryActionLeft}>
            <View style={[styles.secondaryIconBox, styles.createIconBox]}>
              <Text style={styles.secondaryIcon}>✏️</Text>
            </View>
            <View>
              <Text style={styles.secondaryTitle}>My Custom Games</Text>
              <Text style={styles.secondarySubtext}>Create & manage your quizzes</Text>
            </View>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryAction}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <View style={styles.secondaryActionLeft}>
            <View style={[styles.secondaryIconBox, styles.leaderboardIconBox]}>
              <Text style={styles.secondaryIcon}>🏆</Text>
            </View>
            <View>
              <Text style={styles.secondaryTitle}>Global Leaderboard</Text>
              <Text style={styles.secondarySubtext}>See top players worldwide</Text>
            </View>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryAction}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.secondaryActionLeft}>
            <View style={[styles.secondaryIconBox, styles.profileIconBox]}>
              <Text style={styles.secondaryIcon}>📊</Text>
            </View>
            <View>
              <Text style={styles.secondaryTitle}>My Profile & Stats</Text>
              <Text style={styles.secondarySubtext}>View your game history</Text>
            </View>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  
  // Header
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingTop: 60,
    marginBottom: 20
  },
  headerLeft: { flex: 1 },
  welcomeText: { color: '#B8B8D1', fontSize: 14, marginBottom: 4 },
  username: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  profileButton: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#6C5CE7', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  profileIcon: { fontSize: 24 },

  // Title Card
  titleCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)'
  },
  appIcon: { fontSize: 48, marginBottom: 8 },
  appTitle: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginBottom: 4 },
  appSubtitle: { color: '#B8B8D1', fontSize: 14 },

  // Stats Grid
  statsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12
  },
  statCard: { 
    width: '48%',
    backgroundColor: '#2D2D44',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 4
  },
  statCard1: { borderLeftColor: '#6C5CE7' },
  statCard2: { borderLeftColor: '#FFD700' },
  statCard3: { borderLeftColor: '#00C896' },
  statCard4: { borderLeftColor: '#FF6B6B' },
  statIcon: { fontSize: 32, marginBottom: 8 },
  statValue: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { color: '#B8B8D1', fontSize: 12 },

  // Section Title
  sectionTitle: { 
    color: '#FFF', 
    fontSize: 20, 
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 16
  },

  // Main Actions
  mainActions: { 
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12
  },
  mainActionCard: { 
    flex: 1,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  hostCard: { 
    backgroundColor: '#6C5CE7'
  },
  joinCard: { 
    backgroundColor: '#00C896'
  },
  actionIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  actionIcon: { fontSize: 36 },
  actionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  actionSubtext: { color: '#FFF', fontSize: 12, opacity: 0.9 },

  // Secondary Actions
  secondaryAction: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#2D2D44',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  secondaryActionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  secondaryIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  createIconBox: { backgroundColor: 'rgba(255, 107, 107, 0.2)' },
  leaderboardIconBox: { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
  profileIconBox: { backgroundColor: 'rgba(108, 92, 231, 0.2)' },
  secondaryIcon: { fontSize: 24 },
  secondaryTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  secondarySubtext: { color: '#8E8EA9', fontSize: 12 },
  arrow: { color: '#8E8EA9', fontSize: 32, fontWeight: '300' },

  bottomSpacing: { height: 20 }
});