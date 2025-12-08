import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export default function MyGamesScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [myGames, setMyGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyGames();
  }, []);

  const loadMyGames = async () => {
    try {
      setLoading(true);
      
      const gamesRef = collection(db, 'customGames');
      const q = query(
        gamesRef,
        where('createdBy', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const games = [];
      
      querySnapshot.forEach((doc) => {
        games.push({ id: doc.id, ...doc.data() });
      });

      setMyGames(games);
      console.log(`📚 Loaded ${games.length} custom games`);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = (game) => {
    // Navigate to game selection with custom game
    navigation.navigate('GameSelection', { customGame: game });
  };

  if (loading) {
    return (
      <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C5CE7" />
          <Text style={styles.loadingText}>Loading your games...</Text>
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
        <Text style={styles.title}>My Custom Games</Text>

        {myGames.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>No custom games yet</Text>
            <Text style={styles.emptySubtext}>Create your first quiz!</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateGame')}
            >
              <Text style={styles.createButtonText}>+ Create Game</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.createButtonTop}
              onPress={() => navigation.navigate('CreateGame')}
            >
              <Text style={styles.createButtonText}>+ Create New Game</Text>
            </TouchableOpacity>

            {myGames.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={styles.gameCard}
                onPress={() => handlePlayGame(game)}
              >
                <View style={styles.gameHeader}>
                  <Text style={styles.gameIcon}>{game.icon}</Text>
                  <View style={styles.gameInfo}>
                    <Text style={styles.gameTitle}>{game.title}</Text>
                    <Text style={styles.gameDescription}>{game.description}</Text>
                  </View>
                </View>
                <View style={styles.gameFooter}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{game.difficulty}</Text>
                  </View>
                  <Text style={styles.questionCount}>{game.questionCount} questions</Text>
                  <Text style={styles.timesPlayed}>{game.timesPlayed || 0} plays</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

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
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#B8B8D1', fontSize: 16, marginTop: 16 },
  title: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 80, marginBottom: 16 },
  emptyText: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptySubtext: { color: '#8E8EA9', fontSize: 14, marginBottom: 24 },
  
  createButton: { backgroundColor: '#6C5CE7', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  createButtonTop: { backgroundColor: '#6C5CE7', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  createButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  
  gameCard: { backgroundColor: '#2D2D44', borderRadius: 16, padding: 20, marginBottom: 16 },
  gameHeader: { flexDirection: 'row', marginBottom: 16 },
  gameIcon: { fontSize: 48, marginRight: 16 },
  gameInfo: { flex: 1 },
  gameTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  gameDescription: { color: '#B8B8D1', fontSize: 14 },
  gameFooter: { flexDirection: 'row', alignItems: 'center' },
  badge: { backgroundColor: '#6C5CE7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 12 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  questionCount: { color: '#8E8EA9', fontSize: 14, marginRight: 12 },
  timesPlayed: { color: '#8E8EA9', fontSize: 14 },
  
  backButton: { alignItems: 'center', marginTop: 20 },
  backText: { color: '#6C5CE7', fontSize: 16, fontWeight: 'bold' }
});