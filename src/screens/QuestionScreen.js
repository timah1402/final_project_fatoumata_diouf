import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, onSnapshot, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import useGameStore from '../store/gameStore';
import AnswerButton from '../components/AnswerButton';
import { calculatePoints } from '../utils/gameUtils';

export default function QuestionScreen({ navigation }) {
  const { sessionId, selectedGame } = useGameStore();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const startTimeRef = useRef(null);

  // Listen for question changes
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = onSnapshot(doc(db, 'questionStates', sessionId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setQuestionIndex(data.currentQuestionIndex);
        setCurrentQuestion(selectedGame?.questions[data.currentQuestionIndex]);
        setHasAnswered(false);
        startTimeRef.current = Date.now();
        setTimeLeft(20);
      }
    });

    return () => unsubscribe();
  }, [sessionId, selectedGame]);

  // Get my score
  useEffect(() => {
    if (!sessionId || !auth.currentUser) return;

    const unsubscribe = onSnapshot(doc(db, 'activeSessions', sessionId), (snap) => {
      if (snap.exists()) {
        const myData = snap.data().players?.[auth.currentUser.uid];
        if (myData) setMyScore(myData.score || 0);
      }
    });

    return () => unsubscribe();
  }, [sessionId]);

  // Timer
  useEffect(() => {
    if (!startTimeRef.current || hasAnswered) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, 20 - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0 && !hasAnswered) {
        setHasAnswered(true);
        submitAnswer(-1, 20);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [startTimeRef.current, hasAnswered]);

  const submitAnswer = async (answerIndex, timeElapsed) => {
    const user = auth.currentUser;
    if (!user || !currentQuestion) return;

    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const points = isCorrect ? calculatePoints(true, timeElapsed, 20) : 0;

    console.log(`📤 Submitting: ${isCorrect ? '✅' : '❌'} ${points} pts`);

    // Save response
    await updateDoc(doc(db, 'questionStates', sessionId), {
      [`responses.${user.uid}`]: {
        answer: answerIndex,
        isCorrect,
        points,
        timestamp: serverTimestamp()
      }
    });

    // Update score using increment (prevents duplicates)
    await updateDoc(doc(db, 'activeSessions', sessionId), {
      [`players.${user.uid}.score`]: increment(points),
      [`players.${user.uid}.correctAnswers`]: increment(isCorrect ? 1 : 0),
      [`players.${user.uid}.lastAnswer`]: { isCorrect, points }
    });

    console.log(`✅ Answer submitted`);

    // Wait 2 seconds then go to results
    setTimeout(() => {
      navigation.replace('QuestionResult');
    }, 2000);
  };

  const handleAnswer = (index) => {
    if (hasAnswered) return;
    setHasAnswered(true);
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    submitAnswer(index, elapsed);
  };

  if (!currentQuestion) {
    return (
      <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1E1E2E', '#2D2D44']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.questionNumber}>Question {questionIndex + 1} of {selectedGame?.questions.length}</Text>
            <Text style={styles.scoreText}>Score: {myScore}</Text>
          </View>
          <View style={styles.timerBox}>
            <Text style={styles.timer}>{timeLeft}s</Text>
          </View>
        </View>

        <Text style={styles.question}>{currentQuestion.question}</Text>

        <View style={styles.answersContainer}>
          {currentQuestion.answers.map((answer, i) => (
            <AnswerButton
              key={i}
              answer={answer}
              index={i}
              onPress={() => handleAnswer(i)}
              disabled={hasAnswered}
            />
          ))}
        </View>

        {hasAnswered && <Text style={styles.waiting}>Waiting...</Text>}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  questionNumber: { color: '#B8B8D1', fontSize: 16 },
  scoreText: { color: '#00C896', fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  timerBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#6C5CE7', justifyContent: 'center', alignItems: 'center' },
  timer: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  question: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 40 },
  answersContainer: { flex: 1 },
  waiting: { color: '#8E8EA9', textAlign: 'center', marginTop: 20 },
  loadingText: { color: '#B8B8D1', fontSize: 18, textAlign: 'center' }
});