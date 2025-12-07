import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './src/config/firebase';
import QuestionScreen from './src/screens/QuestionScreen';
// Import screens
import HomeScreen from './src/screens/HomeScreen';
import GameSelectionScreen from './src/screens/GameSelectionScreen';
import JoinGameScreen from './src/screens/JoinGameScreen';
import LobbyScreen from './src/screens/LobbyScreen';
import QuestionResultScreen from './src/screens/QuestionResultScreen';
import FinalResultsScreen from './src/screens/FinalResultsScreen';
const Stack = createStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
        console.log('✅ Signed in anonymously');
      } catch (error) {
        console.error('❌ Auth error:', error);
      } finally {
        setInitializing(false);
      }
    };

    initAuth();
  }, []);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="GameSelection" component={GameSelectionScreen} />
          <Stack.Screen name="JoinGame" component={JoinGameScreen} />
          <Stack.Screen name="Lobby" component={LobbyScreen} />
          <Stack.Screen name="Question" component={QuestionScreen} />
          <Stack.Screen name="QuestionResult" component={QuestionResultScreen} />
          <Stack.Screen name="FinalResults" component={FinalResultsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1E1E2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
});