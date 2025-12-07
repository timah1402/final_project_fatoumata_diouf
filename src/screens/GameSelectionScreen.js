import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import GameCard from '../components/GameCard';
import useGameStore from '../store/gameStore';
import { generateGameCode } from '../utils/gameUtils';

export default function GameSelectionScreen({ navigation }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { setUser, setSession } = useGameStore();

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const gamesCollection = collection(db, 'games');
      const gamesSnapshot = await getDocs(gamesCollection);
      const gamesList = gamesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setGames(gamesList);
      console.log(`✅ Loaded ${gamesList.length} games`);
    } catch (error) {
      console.error('❌ Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGameSession = async (gameId, hostId, hostName) => {
    try {
      const gameCode = generateGameCode();
      const sessionId = `session_${Date.now()}`;
      
      const sessionData = {
        sessionId,
        gameId,
        gameCode,
        hostId,
        status: 'lobby',
        currentQuestionIndex: 0,
        createdAt: serverTimestamp(),
        players: {
          [hostId]: {
            id: hostId,
            name: hostName,
            isHost: true,
            score: 0,
            correctAnswers: 0,
            joinedAt: serverTimestamp(),
          }
        }
      };

      await setDoc(doc(db, 'activeSessions', sessionId), sessionData);
      
      console.log('✅ Game session created:', sessionId);
      return { success: true, sessionId, gameCode };
    } catch (error) {
      console.error('❌ Error creating session:', error);
      return { success: false, error: error.message };
    }
  };

  const handleGameSelect = async (game) => {
    setCreating(true);
    
    try {
      // Make sure user is authenticated
      let user = auth.currentUser;
      if (!user) {
        const userCredential = await signInAnonymously(auth);
        user = userCredential.user;
      }

      // Create game session
      const result = await createGameSession(
        game.id,
        user.uid,
        'Host'
      );

      if (result.success) {
        // Get full game data
        const gameDoc = await getDoc(doc(db, 'games', game.id));
        const fullGameData = { id: gameDoc.id, ...gameDoc.data() };

        // Update store
        setUser(user.uid, 'Host', true);
        setSession(result.sessionId, result.gameCode, fullGameData);

        // Navigate to lobby
        navigation.navigate('Lobby');
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      Alert.alert('Error', 'Failed to create game session');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={styles.loadingText}>Loading games...</Text>
      </LinearGradient>
    );
  }

  if (creating) {
    return (
      <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={styles.loadingText}>Creating game...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select a Game</Text>
        <Text style={styles.subtitle}>{games.length} games available</Text>
      </View>

      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GameCard game={item} onPress={() => handleGameSelect(item)} />
        )}
        contentContainerStyle={styles.listContent}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#B8B8D1',
    fontSize: 16,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  loadingText: {
    color: '#B8B8D1',
    fontSize: 16,
    marginTop: 16,
  },
});