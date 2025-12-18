import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import GameSelectionScreen from './src/screens/GameSelectionScreen';
import JoinGameScreen from './src/screens/JoinGameScreen';
import LobbyScreen from './src/screens/LobbyScreen';
import QuestionScreen from './src/screens/QuestionScreen';
import QuestionResultScreen from './src/screens/QuestionResultScreen';
import FinalResultsScreen from './src/screens/FinalResultsScreen';
import CreateGameScreen from './src/screens/CreateGameScreen';
import MyGamesScreen from './src/screens/MyGamesScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="GameSelection" component={GameSelectionScreen} />
          <Stack.Screen name="JoinGame" component={JoinGameScreen} />
          <Stack.Screen name="Lobby" component={LobbyScreen} />
          <Stack.Screen name="Question" component={QuestionScreen} />
          <Stack.Screen name="QuestionResult" component={QuestionResultScreen} />
          <Stack.Screen name="FinalResults" component={FinalResultsScreen} />
          <Stack.Screen name="CreateGame" component={CreateGameScreen} />
          <Stack.Screen name="MyGames" component={MyGamesScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}