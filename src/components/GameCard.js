import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

export default function GameCard({ game, onPress }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#00C896';
      case 'Medium': return '#FFA502';
      case 'Hard': return '#FF6B6B';
      default: return '#B8B8D1';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.icon}>{game.icon}</Text>
      <Text style={styles.title}>{game.title}</Text>
      <Text style={styles.description}>{game.description}</Text>
      
      <View style={styles.footer}>
        <View style={[styles.badge, { backgroundColor: getDifficultyColor(game.difficulty) }]}>
          <Text style={styles.badgeText}>{game.difficulty}</Text>
        </View>
        <Text style={styles.questions}>{game.questions.length} Questions</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2D2D44',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#B8B8D1',
    fontSize: 14,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  questions: {
    color: '#8E8EA9',
    fontSize: 12,
  },
});