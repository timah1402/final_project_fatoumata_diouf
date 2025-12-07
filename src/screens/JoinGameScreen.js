import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import useGameStore from '../store/gameStore';

export default function JoinGameScreen({ navigation }) {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setSession } = useGameStore();

  const handleJoinGame = async () => {
    // Validation
    if (!gameCode.trim()) {
      Alert.alert('Error', 'Please enter a game code');
      return;
    }

    if (gameCode.trim().length !== 6) {
      Alert.alert('Error', 'Game code must be 6 characters');
      return;
    }

    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Not authenticated');
        setLoading(false);
        return;
      }

      // Find session by game code
      const sessionsRef = collection(db, 'activeSessions');
      const q = query(sessionsRef, where('gameCode', '==', gameCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Error', 'Game not found. Check the code and try again.');
        setLoading(false);
        return;
      }

      // Get the first matching session
      const sessionDoc = querySnapshot.docs[0];
      const sessionData = sessionDoc.data();
      const sessionId = sessionDoc.id;

      // Check if game already started
      if (sessionData.status !== 'lobby') {
        Alert.alert('Error', 'This game has already started');
        setLoading(false);
        return;
      }

      // Add player to session
      const newPlayer = {
        id: user.uid,
        name: playerName.trim(),
        isHost: false,
        score: 0,
        correctAnswers: 0,
        joinedAt: new Date(),
      };

      await updateDoc(doc(db, 'activeSessions', sessionId), {
        [`players.${user.uid}`]: newPlayer
      });

      // Get full game data
      const gameDoc = await getDoc(doc(db, 'games', sessionData.gameId));
      const fullGameData = { id: gameDoc.id, ...gameDoc.data() };

      // Update store
      setUser(user.uid, playerName.trim(), false);
      setSession(sessionId, sessionData.gameCode, fullGameData);

      console.log('✅ Joined game successfully');

      // Navigate to lobby
      navigation.navigate('Lobby');

    } catch (error) {
      console.error('Error joining game:', error);
      Alert.alert('Error', 'Failed to join game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Join Game</Text>
        <Text style={styles.subtitle}>Enter the game code from your host</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Game Code</Text>
            <TextInput
              style={styles.input}
              placeholder="ABC123"
              placeholderTextColor="#8E8EA9"
              value={gameCode}
              onChangeText={(text) => setGameCode(text.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#8E8EA9"
              value={playerName}
              onChangeText={setPlayerName}
              maxLength={20}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleJoinGame}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Join Game</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#B8B8D1',
    fontSize: 16,
    marginBottom: 40,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2D2D44',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#3A3A52',
  },
  button: {
    backgroundColor: '#00C896',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#8E8EA9',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#B8B8D1',
    fontSize: 16,
  },
});
