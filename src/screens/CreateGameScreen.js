import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export default function CreateGameScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [gameTitle, setGameTitle] = useState('');
  const [gameDescription, setGameDescription] = useState('');
  const [gameIcon, setGameIcon] = useState('📝');
  const [difficulty, setDifficulty] = useState('Medium');
  const [timePerQuestion, setTimePerQuestion] = useState('20');
  const [questions, setQuestions] = useState([
    { question: '', answers: ['', '', '', ''], correctAnswer: 0 }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { 
      question: '', 
      answers: ['', '', '', ''], 
      correctAnswer: 0 
    }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateAnswer = (questionIndex, answerIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].answers[answerIndex] = value;
    setQuestions(newQuestions);
  };

  const updateCorrectAnswer = (questionIndex, answerIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = answerIndex;
    setQuestions(newQuestions);
  };

  const validateGame = () => {
    if (!gameTitle.trim()) {
      Alert.alert('Error', 'Please enter a game title');
      return false;
    }

    if (!gameDescription.trim()) {
      Alert.alert('Error', 'Please enter a game description');
      return false;
    }

    if (questions.length < 3) {
      Alert.alert('Error', 'Please add at least 3 questions');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      if (!q.question.trim()) {
        Alert.alert('Error', `Question ${i + 1} is empty`);
        return false;
      }

      const filledAnswers = q.answers.filter(a => a.trim().length > 0);
      if (filledAnswers.length < 2) {
        Alert.alert('Error', `Question ${i + 1} needs at least 2 answers`);
        return false;
      }

      if (!q.answers[q.correctAnswer].trim()) {
        Alert.alert('Error', `Question ${i + 1} correct answer is empty`);
        return false;
      }
    }

    return true;
  };

  const handleSaveGame = async () => {
    if (!validateGame()) return;

    try {
      const gameData = {
        title: gameTitle.trim(),
        description: gameDescription.trim(),
        icon: gameIcon,
        difficulty: difficulty,
        timePerQuestion: parseInt(timePerQuestion),
        questionCount: questions.length,
        questions: questions.map(q => ({
          question: q.question.trim(),
          answers: q.answers.filter(a => a.trim().length > 0),
          correctAnswer: q.correctAnswer,
          timePerQuestion: parseInt(timePerQuestion)
        })),
        gameType: 'custom',
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || 'Unknown',
        createdAt: new Date(),
        timesPlayed: 0
      };

      const docRef = await addDoc(collection(db, 'customGames'), gameData);
      
      console.log('✅ Custom game created:', docRef.id);
      
      Alert.alert(
        'Success!', 
        'Your custom game has been created!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MyGames')
          }
        ]
      );
    } catch (error) {
      console.error('Error creating game:', error);
      Alert.alert('Error', 'Failed to create game');
    }
  };

  const icons = ['📝', '🎯', '🧠', '💡', '🎮', '⚡', '🔥', '🌟', '🎨', '🔬'];

  return (
    <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create Custom Game</Text>

        {/* Game Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Information</Text>
          
          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconContainer}>
            {icons.map(icon => (
              <TouchableOpacity
                key={icon}
                style={[styles.iconButton, gameIcon === icon && styles.iconSelected]}
                onPress={() => setGameIcon(icon)}
              >
                <Text style={styles.iconText}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="My Awesome Quiz"
            placeholderTextColor="#8E8EA9"
            value={gameTitle}
            onChangeText={setGameTitle}
            maxLength={50}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="A fun quiz about..."
            placeholderTextColor="#8E8EA9"
            value={gameDescription}
            onChangeText={setGameDescription}
            maxLength={200}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Difficulty</Text>
          <View style={styles.difficultyContainer}>
            {['Easy', 'Medium', 'Hard'].map(diff => (
              <TouchableOpacity
                key={diff}
                style={[styles.difficultyButton, difficulty === diff && styles.difficultySelected]}
                onPress={() => setDifficulty(diff)}
              >
                <Text style={[styles.difficultyText, difficulty === diff && styles.difficultyTextSelected]}>
                  {diff}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Time per Question (seconds)</Text>
          <TextInput
            style={styles.input}
            placeholder="20"
            placeholderTextColor="#8E8EA9"
            value={timePerQuestion}
            onChangeText={setTimePerQuestion}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>

        {/* Questions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Questions ({questions.length})</Text>
            <TouchableOpacity style={styles.addButton} onPress={addQuestion}>
              <Text style={styles.addButtonText}>+ Add Question</Text>
            </TouchableOpacity>
          </View>

          {questions.map((q, qIndex) => (
            <View key={qIndex} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>Question {qIndex + 1}</Text>
                {questions.length > 1 && (
                  <TouchableOpacity onPress={() => removeQuestion(qIndex)}>
                    <Text style={styles.removeButton}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={[styles.input, styles.questionInput]}
                placeholder="Enter your question"
                placeholderTextColor="#8E8EA9"
                value={q.question}
                onChangeText={(text) => updateQuestion(qIndex, 'question', text)}
                multiline
              />

              <Text style={styles.answersLabel}>Answers (tap to set correct answer)</Text>
              {q.answers.map((answer, aIndex) => (
                <View key={aIndex} style={styles.answerRow}>
                  <TouchableOpacity
                    style={[styles.correctButton, q.correctAnswer === aIndex && styles.correctButtonSelected]}
                    onPress={() => updateCorrectAnswer(qIndex, aIndex)}
                  >
                    <Text style={styles.correctButtonText}>
                      {q.correctAnswer === aIndex ? '✓' : aIndex + 1}
                    </Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, styles.answerInput]}
                    placeholder={`Answer ${aIndex + 1}`}
                    placeholderTextColor="#8E8EA9"
                    value={answer}
                    onChangeText={(text) => updateAnswer(qIndex, aIndex, text)}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveGame}>
          <Text style={styles.saveButtonText}>💾 Save Game</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  
  label: { color: '#B8B8D1', fontSize: 14, marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#2D2D44', borderRadius: 12, padding: 16, fontSize: 16, color: '#FFF', marginBottom: 12, borderWidth: 1, borderColor: '#3A3A52' },
  textArea: { height: 80, textAlignVertical: 'top' },
  
  iconContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  iconButton: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#2D2D44', justifyContent: 'center', alignItems: 'center', margin: 4 },
  iconSelected: { backgroundColor: '#6C5CE7', borderWidth: 2, borderColor: '#FFF' },
  iconText: { fontSize: 24 },
  
  difficultyContainer: { flexDirection: 'row', marginBottom: 12 },
  difficultyButton: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#2D2D44', marginHorizontal: 4, alignItems: 'center' },
  difficultySelected: { backgroundColor: '#6C5CE7' },
  difficultyText: { color: '#8E8EA9', fontSize: 16, fontWeight: 'bold' },
  difficultyTextSelected: { color: '#FFF' },
  
  addButton: { backgroundColor: '#00C896', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  
  questionCard: { backgroundColor: '#2D2D44', borderRadius: 16, padding: 16, marginBottom: 16 },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  questionNumber: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  removeButton: { color: '#FF6B6B', fontSize: 24, fontWeight: 'bold' },
  questionInput: { marginBottom: 16 },
  
  answersLabel: { color: '#B8B8D1', fontSize: 14, marginBottom: 8 },
  answerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  correctButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3A3A52', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  correctButtonSelected: { backgroundColor: '#00C896' },
  correctButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  answerInput: { flex: 1, marginBottom: 0 },
  
  saveButton: { backgroundColor: '#6C5CE7', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  cancelButton: { alignItems: 'center', marginTop: 16 },
  cancelButtonText: { color: '#8E8EA9', fontSize: 16 }
});