import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { createGameSession } from '../services/gameService';
import useGameStore from '../store/gameStore';

export default function GameSelectionScreen({ navigation, route }) {
  const [games, setGames] = useState([]);
  const [customGames, setCustomGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { setSession, setSelectedGame, setUser } = useGameStore();

  // Check if we're coming from MyGames with a specific custom game
  const customGame = route?.params?.customGame;

  useEffect(() => {
    if (customGame) {
      // If a specific custom game was selected, play it immediately
      handleGameSelect(customGame, true);
    } else {
      loadGames();
    }
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);

      // Load official games
      const gamesSnapshot = await getDocs(collection(db, 'games'));
      const officialGames = [];
      gamesSnapshot.forEach((doc) => {
        officialGames.push({ id: doc.id, ...doc.data() });
      });

      // Load custom games (all public custom games)
      const customGamesSnapshot = await getDocs(collection(db, 'customGames'));
      const customGamesList = [];
      customGamesSnapshot.forEach((doc) => {
        customGamesList.push({ id: doc.id, ...doc.data(), isCustom: true });
      });

      setGames(officialGames);
      setCustomGames(customGamesList);
      console.log(`✅ Loaded ${officialGames.length} official games and ${customGamesList.length} custom games`);
    } catch (error) {
      console.error('Error loading games:', error);
      Alert.alert('Error', 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const handleGameSelect = async (game, isCustom = false) => {
    setCreating(true);
    
    try {
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('Error', 'Not authenticated');
        setCreating(false);
        return;
      }

      // Store the selected game
      setSelectedGame(game);
      setUser(user.uid, user.displayName || 'Host', true);

      // Create game session with the game ID
      const gameId = isCustom ? `custom_${game.id}` : game.id;
      const result = await createGameSession(
        gameId,
        user.uid,
        user.displayName || 'Host'
      );

      if (result.success) {
        setSession(
          result.sessionId,
          result.gameCode,
          true
        );

        console.log('✅ Session created:', result.sessionId);
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#00C896';
      case 'medium': return '#FFB800';
      case 'hard': return '#FF6B6B';
      default: return '#6C5CE7';
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C5CE7" />
          <Text style={styles.loadingText}>Loading games...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (creating) {
    return (
      <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C5CE7" />
          <Text style={styles.loadingText}>Creating game session...</Text>
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
        <Text style={styles.title}>Select a Game</Text>

        {/* Official Games Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Official Games</Text>
          {games.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={styles.gameCard}
              onPress={() => handleGameSelect(game, false)}
            >
              <View style={styles.gameHeader}>
                <Text style={styles.gameIcon}>{game.icon}</Text>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  <Text style={styles.gameDescription}>{game.description}</Text>
                </View>
              </View>
              <View style={styles.gameFooter}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(game.difficulty) }]}>
                  <Text style={styles.difficultyText}>{game.difficulty}</Text>
                </View>
                <Text style={styles.questionCount}>{game.questionCount} questions</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Games Section */}
        {customGames.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✏️ Community Games</Text>
            {customGames.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={[styles.gameCard, styles.customGameCard]}
                onPress={() => handleGameSelect(game, true)}
              >
                <View style={styles.gameHeader}>
                  <Text style={styles.gameIcon}>{game.icon}</Text>
                  <View style={styles.gameInfo}>
                    <Text style={styles.gameTitle}>{game.title}</Text>
                    <Text style={styles.gameDescription}>{game.description}</Text>
                    <Text style={styles.createdBy}>by {game.createdByName}</Text>
                  </View>
                </View>
                <View style={styles.gameFooter}>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(game.difficulty) }]}>
                    <Text style={styles.difficultyText}>{game.difficulty}</Text>
                  </View>
                  <Text style={styles.questionCount}>{game.questionCount} questions</Text>
                  <Text style={styles.timesPlayed}>{game.timesPlayed || 0} plays</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#B8B8D1', fontSize: 16, marginTop: 16 },
  title: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  
  section: { marginBottom: 30 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  
  gameCard: { backgroundColor: '#2D2D44', borderRadius: 16, padding: 20, marginBottom: 16 },
  customGameCard: { borderWidth: 2, borderColor: '#6C5CE7' },
  gameHeader: { flexDirection: 'row', marginBottom: 16 },
  gameIcon: { fontSize: 48, marginRight: 16 },
  gameInfo: { flex: 1 },
  gameTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  gameDescription: { color: '#B8B8D1', fontSize: 14, marginBottom: 4 },
  createdBy: { color: '#8E8EA9', fontSize: 12, fontStyle: 'italic' },
  gameFooter: { flexDirection: 'row', alignItems: 'center' },
  difficultyBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 12 },
  difficultyText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  questionCount: { color: '#8E8EA9', fontSize: 14, marginRight: 12 },
  timesPlayed: { color: '#8E8EA9', fontSize: 14 },
  
  backButton: { alignItems: 'center', marginTop: 20 },
  backText: { color: '#6C5CE7', fontSize: 16, fontWeight: 'bold' }
});