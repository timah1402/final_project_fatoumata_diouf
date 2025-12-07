import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getMedalEmoji } from '../utils/gameUtils';

export default function LeaderboardItem({ player, rank }) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.medal}>{getMedalEmoji(rank)}</Text>
        <Text style={styles.rank}>{rank}</Text>
        <Text style={styles.name}>
          {player.name} {player.isHost && '👑'}
        </Text>
      </View>
      <Text style={styles.score}>{player.score} pts</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2D2D44',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medal: {
    fontSize: 24,
    marginRight: 8,
  },
  rank: {
    color: '#B8B8D1',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    minWidth: 20,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  score: {
    color: '#00C896',
    fontSize: 18,
    fontWeight: 'bold',
  },
});