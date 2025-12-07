import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateGameCode } from '../utils/gameUtils';

export const createGameSession = async (gameId, hostId, playerName) => {
  try {
    const sessionId = `session_${Date.now()}`;
    const gameCode = generateGameCode();

    const sessionData = {
      sessionId,
      gameId,
      gameCode,
      hostId,
      status: 'lobby',
      createdAt: new Date(),
      currentQuestionIndex: 0,
      players: {
        [hostId]: {
          id: hostId,
          name: playerName,
          isHost: true,
          score: 0,
          correctAnswers: 0,
          joinedAt: new Date()
        }
      }
    };

    await setDoc(doc(db, 'activeSessions', sessionId), sessionData);
    
    console.log('✅ Game session created:', sessionId);
    return { success: true, sessionId, gameCode };
  } catch (error) {
    console.error('Error creating game session:', error);
    return { success: false, error: error.message };
  }
};

export const joinGameSession = async (gameCode, userId, playerName) => {
  try {
    const sessionsRef = collection(db, 'activeSessions');
    const q = query(sessionsRef, where('gameCode', '==', gameCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: 'Game not found' };
    }

    const sessionDoc = querySnapshot.docs[0];
    const sessionData = sessionDoc.data();

    if (sessionData.status !== 'lobby') {
      return { success: false, error: 'Game already started' };
    }

    const updatedPlayers = {
      ...sessionData.players,
      [userId]: {
        id: userId,
        name: playerName,
        isHost: false,
        score: 0,
        correctAnswers: 0,
        joinedAt: new Date()
      }
    };

    await setDoc(doc(db, 'activeSessions', sessionDoc.id), {
      ...sessionData,
      players: updatedPlayers
    }, { merge: true });

    console.log('✅ Joined game successfully');
    return { 
      success: true, 
      sessionId: sessionDoc.id,
      gameId: sessionData.gameId 
    };
  } catch (error) {
    console.error('Error joining game:', error);
    return { success: false, error: error.message };
  }
};