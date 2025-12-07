import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { seedGamesToFirebase } from '../data/seedGames';

export default function HomeScreen({ navigation }) {
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
    <LinearGradient
      colors={['#1E1E2E', '#2D2D44']}
      style={styles.container}
    >
      <View style={styles.content}>
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
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#B8B8D1',
    fontSize: 18,
    marginBottom: 60,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
  },
  button: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  hostButton: {
    backgroundColor: '#6C5CE7',
  },
  joinButton: {
    backgroundColor: '#00C896',
  },
  buttonIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
});