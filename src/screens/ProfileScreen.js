import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { currentUser, userProfile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

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
  logoutButton: { backgroundColor: '#FF6B6B', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  logoutText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  backButton: { alignItems: 'center', marginTop: 20 },
  backText: { color: '#6C5CE7', fontSize: 16 }
});