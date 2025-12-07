import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import useGameStore from '../store/gameStore';

export default function LobbyScreen({ navigation }) {
  const { sessionId, gameCode, selectedGame, isHost, setPlayers } = useGameStore();
  const [playerList, setPlayerList] = useState([]);

 useEffect(() => {
  if (!sessionId) {
    Alert.alert('Error', 'No session found');
    navigation.navigate('Home');
    return;
  }

  let hasNavigated = false; // Prevent multiple navigations

  const unsubscribe = onSnapshot(
    doc(db, 'activeSessions', sessionId),
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const players = data.players || {};
        
        const playersArray = Object.values(players);
        setPlayerList(playersArray);
        setPlayers(players);
        
        console.log(`👥 Lobby: ${playersArray.length} players, Status: ${data.status}`);
        
        // Only navigate once when game starts
        if (data.status === 'playing' && !hasNavigated) {
          hasNavigated = true;
          console.log('🎮 Lobby: Game started! Navigating to Question screen...');
          // Clean up listener before navigating
          unsubscribe();
          navigation.navigate('Question');
        }
      }
    },
    (error) => {
      console.error('Error listening to session:', error);
    }
  );

  return () => {
    console.log('🔌 Lobby: Cleaning up listener');
    unsubscribe();
  };
}, [sessionId, navigation]);

 const handleStartGame = async () => {
  if (playerList.length < 1) {
    Alert.alert('Error', 'Need at least 1 player to start');
    return;
  }
  
  try {
    // Update session status to 'playing'
    await updateDoc(doc(db, 'activeSessions', sessionId), {
      status: 'playing',
      currentQuestionIndex: 0
    });
    
    // Create question state document
    await setDoc(doc(db, 'questionStates', sessionId), {
      currentQuestionIndex: 0,
      questionStartTime: new Date(),
      isActive: true,
      responses: {}
    });
    
    console.log('✅ Game started!');
    
    // Navigate to question screen
    navigation.navigate('Question');
    
  } catch (error) {
    console.error('Error starting game:', error);
    Alert.alert('Error', 'Failed to start game');
  }
};
  return (
    <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Game Lobby</Text>
        
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Game Code</Text>
          <Text style={styles.code}>{gameCode}</Text>
          <Text style={styles.codeHint}>Share this code with players</Text>
        </View>

        <Text style={styles.gameTitle}>{selectedGame?.title}</Text>
        
        <View style={styles.playersContainer}>
          <Text style={styles.playersTitle}>
            Players ({playerList.length})
          </Text>
          
          {playerList.map((player) => (
            <View key={player.id} style={styles.playerItem}>
              <Text style={styles.playerName}>
                {player.name} {player.isHost && '👑'}
              </Text>
            </View>
          ))}
        </View>

        {isHost && (
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartGame}
          >
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        )}

        {!isHost && (
          <Text style={styles.waitingText}>Waiting for host to start...</Text>
        )}
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
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  codeContainer: {
    backgroundColor: '#6C5CE7',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  codeLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  code: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  codeHint: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.7,
    marginTop: 8,
  },
  gameTitle: {
    color: '#B8B8D1',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  playersContainer: {
    flex: 1,
  },
  playersTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  playerItem: {
    backgroundColor: '#2D2D44',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  startButton: {
    backgroundColor: '#00C896',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  waitingText: {
    color: '#8E8EA9',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});
