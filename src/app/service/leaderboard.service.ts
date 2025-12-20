import { Injectable } from '@angular/core';
import { 
  getFirestore, doc, getDoc, setDoc
} from 'firebase/firestore';
// On s'assure que GameKey est bien importé. Si stats.service.ts est dans le même dossier, c'est './stats.service'
import { GameKey } from './stats.service';

export interface RankedEntry {
  uid: string;
  pseudo: string;
  score: number;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private db = getFirestore();
  // Utilisation d'une variable globale ou fallback
  private appId = (window as any).__app_id || 'orus-prod';

  // Récupère le classement pour un jeu donné
  async getLeaderboard(gameKey: GameKey): Promise<RankedEntry[]> {
    const docRef = doc(this.db, 'artifacts', this.appId, 'public', 'data', 'leaderboards', gameKey);
    
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return (data['entries'] as RankedEntry[] || []).sort((a, b) => b.score - a.score);
      }
    } catch (e) {
      console.error('Erreur lecture leaderboard', e);
    }
    return [];
  }

  // Soumet un nouveau score
  async submitScore(gameKey: GameKey, user: { uid: string, pseudo: string }, score: number) {
    const docRef = doc(this.db, 'artifacts', this.appId, 'public', 'data', 'leaderboards', gameKey);
    
    let entries: RankedEntry[] = [];
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      entries = snap.data()['entries'] || [];
    }

    const existingIndex = entries.findIndex(e => e.uid === user.uid);
    
    if (existingIndex !== -1) {
      if (score > entries[existingIndex].score) {
        entries[existingIndex].score = score;
        entries[existingIndex].updatedAt = new Date().toISOString();
        entries[existingIndex].pseudo = user.pseudo; 
      } else {
        return;
      }
    } else {
      entries.push({
        uid: user.uid,
        pseudo: user.pseudo,
        score: score,
        updatedAt: new Date().toISOString()
      });
    }

    entries.sort((a, b) => b.score - a.score);
    if (entries.length > 100) {
      entries = entries.slice(0, 100);
    }

    await setDoc(docRef, { entries });
  }
}