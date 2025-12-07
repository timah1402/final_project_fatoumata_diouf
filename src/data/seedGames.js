import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { gamesData } from './gamesData';

export const seedGamesToFirebase = async () => {
  try {
    console.log('🌱 Starting to seed games to Firebase...');
    
    for (const game of gamesData) {
      await setDoc(doc(db, 'games', game.id), game);
      console.log(`✅ Uploaded: ${game.title}`);
    }
    
    console.log('🎉 All games uploaded successfully!');
    return { success: true, count: gamesData.length };
  } catch (error) {
    console.error('❌ Error seeding games:', error);
    return { success: false, error: error.message };
  }
};