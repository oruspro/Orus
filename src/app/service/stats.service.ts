import { Injectable } from '@angular/core';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc,
  updateDoc,
  onSnapshot,
  QuerySnapshot,
  QueryDocumentSnapshot,
  runTransaction
} from 'firebase/firestore';
import { getAuth, User } from 'firebase/auth';

export type GameKey = 'chiffres' | 'cartes1' | 'cartes4' | 'dates';

export interface StoredStatPoint {
  gameIndex: number;   
  score: number;       
  timestamp: string;   
  isRanked?: boolean;
  elo?: number; // ✅ Nouveau champ
  eloDelta?: number; // ✅ Nouveau champ
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private db = getFirestore();
  private auth = getAuth();
  
  private rawStats: StoredStatPoint[] = [];
  private data: Record<GameKey, StoredStatPoint[]> = {
    chiffres: [], cartes1: [], cartes4: [], dates: [],
  };

  private appId = (window as any).__app_id || 'orus-prod';

  constructor() {
    this.auth.onAuthStateChanged((user: User | null) => {
      if (user) {
        this.subscribeToStats(user.uid);
      } else {
        this.clearData();
      }
    });
  }

  private subscribeToStats(userId: string) {
    const statsRef = collection(this.db, 'artifacts', this.appId, 'users', userId, 'stats');
    
    onSnapshot(statsRef, (snapshot: QuerySnapshot) => {
      this.rawStats = [];
      const allStats: any[] = [];
      
      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        allStats.push(doc.data());
      });

      this.data = { chiffres: [], cartes1: [], cartes4: [], dates: [] };

      allStats.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      allStats.forEach(stat => {
        const point: StoredStatPoint = {
          gameIndex: 0,
          score: stat.score,
          timestamp: stat.timestamp,
          isRanked: !!stat.isRanked,
          elo: stat.elo,
          eloDelta: stat.eloDelta
        };
        
        this.rawStats.push(point);

        if (this.data[stat.gameKey as GameKey]) {
          const series = this.data[stat.gameKey as GameKey];
          point.gameIndex = series.length + 1;
          series.push(point);
        }
      });
    });
  }

  private clearData() {
    this.data = { chiffres: [], cartes1: [], cartes4: [], dates: [] };
    this.rawStats = [];
  }

  getSeries(game: GameKey): StoredStatPoint[] {
    return this.data[game] ?? [];
  }

  getTodayRankedCount(): number {
    const today = new Date().toDateString();
    return this.rawStats.filter(s => 
      s.isRanked && 
      new Date(s.timestamp).toDateString() === today
    ).length;
  }

  /** * Enregistre un score ET met à jour l'Elo si classé 
   */
  async recordScore(game: GameKey, score: number, isRanked: boolean, eloResult?: { newElo: number, delta: number }) {
    const user = this.auth.currentUser;
    if (!user) return;

    // 1. Ajouter à l'historique
    const statsRef = collection(this.db, 'artifacts', this.appId, 'users', user.uid, 'stats');
    await addDoc(statsRef, {
      gameKey: game,
      score: score,
      isRanked: isRanked,
      timestamp: new Date().toISOString(),
      elo: eloResult?.newElo,
      eloDelta: eloResult?.delta
    });

    // 2. Si partie classée, mettre à jour le profil utilisateur (Elo actuel)
    if (isRanked && eloResult) {
      const profileRef = doc(this.db, 'artifacts', this.appId, 'users', user.uid, 'profile', 'main');
      
      // On utilise une mise à jour ciblée pour ne pas écraser le reste
      // La syntaxe `elos.chiffres` met à jour un champ imbriqué dans Firestore
      const updatePayload: any = {};
      updatePayload[`elos.${game}`] = eloResult.newElo;
      
      await updateDoc(profileRef, updatePayload);
    }
  }
}