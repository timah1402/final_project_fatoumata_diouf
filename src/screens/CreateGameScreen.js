import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export default function CreateGameScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [gameTitle, setGameTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [icon, setIcon] = useState('🎮');
  const [timePerQuestion, setTimePerQuestion] = useState('20');
  const [isPublic, setIsPublic] = useState(true);
  const [questions, setQuestions] = useState([
    { question: '', answers: ['', '', '', ''], correctAnswer: 0 }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', answers: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateAnswer = (qIndex, aIndex, value) => {
    const updated = [...questions];
    updated[qIndex].answers[aIndex] = value;
    setQuestions(updated);
  };

  const validateGame = () => {
    if (!gameTitle.trim()) return 'Game title is required';
    if (!description.trim()) return 'Description is required';
    if (!category.trim()) return 'Category is required';
    if (questions.length < 3) return 'Add at least 3 questions';
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return `Question ${i + 1} is empty`;
      if (q.answers.some(a => !a.trim())) return `Question ${i + 1} has empty answers`;
    }
    
    return null;
  };

  const handleCreateGame = async () => {
    const error = validateGame();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    try {
      const gameId = `custom_${currentUser.uid}_${Date.now()}`;
      
      const gameData = {
        id: gameId,
        title: gameTitle.trim(),
        description: description.trim(),
        category: category.trim(),
        difficulty,
        icon,
        timePerQuestion: parseInt(timePerQuestion) || 20,
        gameType: 'classic',
        questions: questions.map((q, i) => ({
          id: i + 1,
          question: q.question.trim(),
          answers: q.answers.map(a => a.trim()),
          correctAnswer: q.correctAnswer
        })),
        
        // Creator info
        createdBy: currentUser.uid,
        creatorName: currentUser.displayName || 'User',
        isPublic,
        createdAt: serverTimestamp(),
        playCount: 0,
        averageScore: 0
      };

      await setDoc(doc(db, 'games', gameId), gameData);
      
      Alert.alert('Success!', 'Your game has been created', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error('Error creating game:', error);
      Alert.alert('Error', 'Failed to create game');
    }
  };

  return (
    <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create Custom Game</Text>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.label}>Game Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="My Awesome Quiz"
            placeholderTextColor="#8E8EA9"
            value={gameTitle}
            onChangeText={setGameTitle}
            maxLength={50}
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your game..."
            placeholderTextColor="#8E8EA9"
            value={description}
            onChangeText={setDescription}
            maxLength={100}
            multiline
          />

          <Text style={styles.label}>Category *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Computer Science"
            placeholderTextColor="#8E8EA9"
            value={category}
            onChangeText={setCategory}
            maxLength={30}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Icon</Text>
              <TextInput
                style={styles.input}
                value={icon}
                onChangeText={setIcon}
                maxLength={2}
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Time/Question</Text>
              <TextInput
                style={styles.input}
                value={timePerQuestion}
                onChangeText={setTimePerQuestion}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </View>

          <Text style={styles.label}>Difficulty</Text>
          <View style={styles.difficultyRow}>
            {['Easy', 'Medium', 'Hard'].map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.diffBtn, difficulty === d && styles.diffBtnActive]}
                onPress={() => setDifficulty(d)}
              >
                <Text style={[styles.diffText, difficulty === d && styles.diffTextActive]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Visibility</Text>
          <View style={styles.difficultyRow}>
            <TouchableOpacity
              style={[styles.diffBtn, isPublic && styles.diffBtnActive]}
              onPress={() => setIsPublic(true)}
            >
              <Text style={[styles.diffText, isPublic && styles.diffTextActive]}>
                🌍 Public
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.diffBtn, !isPublic && styles.diffBtnActive]}
              onPress={() => setIsPublic(false)}
            >
              <Text style={[styles.diffText, !isPublic && styles.diffTextActive]}>
                🔒 Private
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Questions */}
        <Text style={styles.sectionTitle}>Questions (min 3)</Text>
        {questions.map((q, qIndex) => (
          <View key={qIndex} style={styles.questionBox}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNumber}>Question {qIndex + 1}</Text>
              {questions.length > 1 && (
                <TouchableOpacity onPress={() => removeQuestion(qIndex)}>
                  <Text style={styles.removeBtn}>❌</Text>
                </TouchableOpacity>
              )}
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter your question..."
              placeholderTextColor="#8E8EA9"
              value={q.question}
              onChangeText={(text) => updateQuestion(qIndex, 'question', text)}
              multiline
            />

            <Text style={styles.answerLabel}>Answers</Text>
            {q.answers.map((answer, aIndex) => (
              <View key={aIndex} style={styles.answerRow}>
                <TouchableOpacity
                  style={[styles.radio, q.correctAnswer === aIndex && styles.radioActive]}
                  onPress={() => updateQuestion(qIndex, 'correctAnswer', aIndex)}
                >
                  <Text style={styles.radioText}>{aIndex + 1}</Text>
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

        <TouchableOpacity style={styles.addQuestionBtn} onPress={addQuestion}>
          <Text style={styles.addQuestionText}>➕ Add Question</Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.createBtn} onPress={handleCreateGame}>
          <Text style={styles.createBtnText}>Create Game 🎮</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  title: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  section: { marginBottom: 30 },
  sectionTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { color: '#B8B8D1', fontSize: 14, marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#2D2D44', borderRadius: 12, padding: 16, fontSize: 16, color: '#FFF', borderWidth: 1, borderColor: '#3A3A52' },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  difficultyRow: { flexDirection: 'row', gap: 12 },
  diffBtn: { flex: 1, backgroundColor: '#2D2D44', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 2, borderColor: '#3A3A52' },
  diffBtnActive: { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' },
  diffText: { color: '#B8B8D1', fontSize: 14, fontWeight: 'bold' },
  diffTextActive: { color: '#FFF' },
  questionBox: { backgroundColor: '#2D2D44', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#3A3A52' },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  questionNumber: { color: '#00C896', fontSize: 16, fontWeight: 'bold' },
  removeBtn: { fontSize: 18 },
  answerLabel: { color: '#B8B8D1', fontSize: 14, marginTop: 12, marginBottom: 8 },
  answerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  radio: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#3A3A52', justifyContent: 'center', alignItems: 'center' },
  radioActive: { backgroundColor: '#00C896' },
  radioText: { color: '#FFF', fontWeight: 'bold' },
  answerInput: { flex: 1 },
  addQuestionBtn: { backgroundColor: '#3A3A52', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  addQuestionText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  createBtn: { backgroundColor: '#00C896', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  createBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelBtnText: { color: '#B8B8D1', fontSize: 16 }
});