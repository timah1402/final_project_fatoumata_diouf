import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
      <View style={styles.content}>
        
        {/* Header with Profile Button */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.username}>{currentUser?.displayName || 'Player'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Preview */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userProfile?.totalGames || 0}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userProfile?.totalWins || 0}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userProfile?.totalScore || 0}</Text>
            <Text style={styles.statLabel}>Score</Text>
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
          <Text style={styles.title}>🎮 QuizMaster</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>Engineering Edition</Text>

        {/* Main Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.hostButton]}
            onPress={() => navigation.navigate('GameSelection')}
          >
            <Text style={styles.buttonIcon}>👑</Text>
            <Text style={styles.buttonText}>Host Game</Text>
            <Text style={styles.buttonSubtext}>Create a new quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.joinButton]}
            onPress={() => navigation.navigate('JoinGame')}
          >
            <Text style={styles.buttonIcon}>🎯</Text>
            <Text style={styles.buttonText}>Join Game</Text>
            <Text style={styles.buttonSubtext}>Enter game code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  welcomeText: { color: '#B8B8D1', fontSize: 14 },
  username: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  profileButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#6C5CE7', justifyContent: 'center', alignItems: 'center' },
  profileIcon: { fontSize: 24 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30 },
  statBox: { alignItems: 'center', backgroundColor: '#2D2D44', padding: 16, borderRadius: 12, flex: 1, marginHorizontal: 4 },
  statValue: { color: '#00C896', fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#B8B8D1', fontSize: 12, marginTop: 4 },
  title: { color: '#FFF', fontSize: 48, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: '#B8B8D1', fontSize: 18, marginBottom: 40, textAlign: 'center' },
  buttonContainer: { flex: 1, justifyContent: 'center' },
  button: { padding: 24, borderRadius: 16, marginBottom: 20, alignItems: 'center' },
  hostButton: { backgroundColor: '#6C5CE7' },
  joinButton: { backgroundColor: '#00C896' },
  buttonIcon: { fontSize: 48, marginBottom: 12 },
  buttonText: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  buttonSubtext: { color: '#FFF', fontSize: 14, opacity: 0.8 }
});