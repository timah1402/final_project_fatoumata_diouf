import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, updateDoc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import useGameStore from '../store/gameStore';

export default function QuestionResultScreen({ navigation }) {
  const { sessionId, selectedGame, isHost } = useGameStore();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [myResult, setMyResult] = useState(null);
  const [myScore, setMyScore] = useState(0);
  const hasNavigatedRef = useRef(false);
  const initialIndexRef = useRef(null);

  useEffect(() => {
    if (!sessionId || !auth.currentUser) return;

    hasNavigatedRef.current = false;

    // Get initial question index
    const initQuestionIndex = async () => {
      const snap = await getDoc(doc(db, 'activeSessions', sessionId));
      if (snap.exists()) {
        const index = snap.data().currentQuestionIndex || 0;
        setQuestionIndex(index);
        initialIndexRef.current = index;
        console.log(`📊 Result screen for Q${index + 1}`);
      }
    };
    initQuestionIndex();

    const unsubscribe = onSnapshot(doc(db, 'activeSessions', sessionId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const newIndex = data.currentQuestionIndex || 0;
        
        const myData = data.players?.[auth.currentUser.uid];
        if (myData) {
          setMyScore(myData.score || 0);
          setMyResult(myData.lastAnswer);
        }

        // Check if game finished
        if (data.status === 'finished' && !hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          console.log('🏁 Game finished!');
          navigation.replace('FinalResults');
          return;
        }

        // Check if question changed (only navigate once)
        if (initialIndexRef.current !== null && newIndex > initialIndexRef.current && !hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          console.log(`➡️ Moving to Q${newIndex + 1}`);
          navigation.replace('Question');
          return;
        }
      }
    });

    return () => unsubscribe();
  }, [sessionId, navigation]);

  const handleNext = async () => {
    const nextIndex = questionIndex + 1;

    if (nextIndex >= selectedGame.questions.length) {
      // Finish game
      console.log('🏁 Finishing game...');
      await updateDoc(doc(db, 'activeSessions', sessionId), {
        status: 'finished'
      });
    } else {
      // Next question
      console.log(`⏭️ Moving to Q${nextIndex + 1}`);
      await updateDoc(doc(db, 'activeSessions', sessionId), {
        currentQuestionIndex: nextIndex
      });
      await setDoc(doc(db, 'questionStates', sessionId), {
        currentQuestionIndex: nextIndex,
        isActive: true,
        responses: {}
      });
    }
  };

  const question = selectedGame?.questions[questionIndex];
  const correctAnswer = question?.answers[question?.correctAnswer];

  if (initialIndexRef.current === null) {
    return (
      <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Question {questionIndex + 1}</Text>

        {myResult && (
          <View style={[styles.resultBox, myResult.isCorrect ? styles.correct : styles.incorrect]}>
            <Text style={styles.emoji}>{myResult.isCorrect ? '🎉' : '😔'}</Text>
            <Text style={styles.resultText}>{myResult.isCorrect ? 'Correct!' : 'Wrong!'}</Text>
            <Text style={styles.points}>+{myResult.points} pts</Text>
          </View>
        )}

        {myResult && !myResult.isCorrect && correctAnswer && (
          <View style={styles.answerBox}>
            <Text style={styles.answerLabel}>Correct Answer:</Text>
            <Text style={styles.answerText}>{correctAnswer}</Text>
          </View>
        )}

        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Your Total Score</Text>
          <Text style={styles.scoreValue}>{myScore}</Text>
        </View>

        {isHost ? (
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>
              {questionIndex + 1 >= selectedGame.questions.length ? 'Final Results' : 'Next Question'}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.waiting}>Waiting for host...</Text>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20, paddingTop: 60, justifyContent: 'center' },
  title: { color: '#FFF', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  resultBox: { padding: 40, borderRadius: 24, marginBottom: 30, alignItems: 'center' },
  correct: { backgroundColor: '#00C896' },
  incorrect: { backgroundColor: '#FF6B6B' },
  emoji: { fontSize: 80, marginBottom: 16 },
  resultText: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginBottom: 12 },
  points: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  answerBox: { backgroundColor: '#2D2D44', padding: 20, borderRadius: 16, marginBottom: 30 },
  answerLabel: { color: '#B8B8D1', fontSize: 14, marginBottom: 8 },
  answerText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  scoreBox: { backgroundColor: '#6C5CE7', padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 30 },
  scoreLabel: { color: '#FFF', fontSize: 16, opacity: 0.8, marginBottom: 8 },
  scoreValue: { color: '#FFF', fontSize: 48, fontWeight: 'bold' },
  button: { backgroundColor: '#00C896', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  waiting: { color: '#8E8EA9', fontSize: 16, textAlign: 'center' },
  loading: { color: '#B8B8D1', fontSize: 18, textAlign: 'center' }
});
