import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export default function MyGamesScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [myGames, setMyGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyGames();
  }, []);

  // Reload when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadMyGames();
    });
    return unsubscribe;
  }, [navigation]);

  const loadMyGames = async () => {
    try {
      setLoading(true);
      const gamesRef = collection(db, 'games');
      const q = query(gamesRef, where('createdBy', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      
      const games = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by creation date (newest first)
      games.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      setMyGames(games);
      console.log(`✅ Loaded ${games.length} of my games`);
    } catch (error) {
      console.error('Error loading games:', error);
      Alert.alert('Error', 'Failed to load your games');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (gameId, currentStatus, gameTitle) => {
    try {
      await updateDoc(doc(db, 'games', gameId), {
        isPublic: !currentStatus
      });
      
      Alert.alert(
        'Success', 
        `"${gameTitle}" is now ${!currentStatus ? 'Public 🌍' : 'Private 🔒'}`
      );
      loadMyGames(); // Reload
    } catch (error) {
      console.error('Error updating game:', error);
      Alert.alert('Error', 'Failed to update game visibility');
    }
  };

  const deleteGame = async (gameId, gameTitle) => {
    Alert.alert(
      'Delete Game',
      `Are you sure you want to delete "${gameTitle}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'games', gameId));
              Alert.alert('Deleted', 'Game deleted successfully');
              loadMyGames();
            } catch (error) {
              console.error('Error deleting game:', error);
              Alert.alert('Error', 'Failed to delete game');
            }
          }
        }
      ]
    );
  };

  const renderGame = ({ item }) => (
    <View style={styles.gameCard}>
      <View style={styles.gameHeader}>
        <View style={styles.gameInfo}>
          <Text style={styles.gameIcon}>{item.icon}</Text>
          <View style={styles.gameTitleContainer}>
            <Text style={styles.gameTitle}>{item.title}</Text>
            <Text style={styles.gameCategory}>
              {item.category} • {item.questions?.length || 0} questions
            </Text>
            <Text style={styles.gameStats}>
              🎮 {item.playCount || 0} plays • ⭐ {item.difficulty}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.gameDesc}>{item.description}</Text>

      {/* Status Badge */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, item.isPublic ? styles.publicBadge : styles.privateBadge]}>
          <Text style={styles.statusText}>
            {item.isPublic ? '🌍 Public' : '🔒 Private'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.visibilityBtn]}
          onPress={() => toggleVisibility(item.id, item.isPublic, item.title)}
        >
          <Text style={styles.actionBtnText}>
            {item.isPublic ? '🔒 Make Private' : '🌍 Make Public'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => deleteGame(item.id, item.title)}
        >
          <Text style={styles.actionBtnText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>My Games</Text>
          <TouchableOpacity 
            style={styles.createNewBtn}
            onPress={() => navigation.navigate('CreateGame')}
          >
            <Text style={styles.createNewText}>➕ Create New</Text>
          </TouchableOpacity>
        </View>

        {myGames.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎮</Text>
            <Text style={styles.emptyTitle}>No games yet</Text>
            <Text style={styles.emptyText}>Create your first custom game!</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CreateGame')}
            >
              <Text style={styles.emptyButtonText}>Create Game</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={myGames}
            keyExtractor={(item) => item.id}
            renderItem={renderGame}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingTop: 60 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#B8B8D1', fontSize: 16, marginTop: 16 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 20 
  },
  title: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  createNewBtn: { 
    backgroundColor: '#6C5CE7', 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 8 
  },
  createNewText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  gameCard: { 
    backgroundColor: '#2D2D44', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A52'
  },
  gameHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12 
  },
  gameInfo: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  gameIcon: { fontSize: 40, marginRight: 12 },
  gameTitleContainer: { flex: 1 },
  gameTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  gameCategory: { color: '#B8B8D1', fontSize: 14, marginBottom: 4 },
  gameStats: { color: '#8E8EA9', fontSize: 12 },
  gameDesc: { color: '#B8B8D1', fontSize: 14, marginBottom: 12, lineHeight: 20 },
  statusContainer: { marginBottom: 12 },
  statusBadge: { 
    alignSelf: 'flex-start',
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 8 
  },
  publicBadge: { backgroundColor: '#00C89620' },
  privateBadge: { backgroundColor: '#FFD70020' },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionBtn: { 
    flex: 1, 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  visibilityBtn: { backgroundColor: '#6C5CE7' },
  deleteBtn: { backgroundColor: '#FF6B6B' },
  actionBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 40 
  },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { color: '#B8B8D1', fontSize: 16, textAlign: 'center', marginBottom: 30 },
  emptyButton: { 
    backgroundColor: '#00C896', 
    paddingVertical: 14, 
    paddingHorizontal: 32, 
    borderRadius: 12 
  },
  emptyButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  backButton: { 
    position: 'absolute', 
    bottom: 30, 
    alignSelf: 'center',
    backgroundColor: '#2D2D44',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  backButtonText: { color: '#6C5CE7', fontSize: 16, fontWeight: 'bold' }
});