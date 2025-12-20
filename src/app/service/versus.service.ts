import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { 
  getFirestore, collection, doc, addDoc, updateDoc, 
  onSnapshot, serverTimestamp, query, where, getDocs, 
  runTransaction, DocumentSnapshot
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Observable } from 'rxjs';

export interface VersusPlayer {
  uid: string;
  pseudo: string;
  isReady: boolean;
  score: number;
  finished: boolean;
  isFriend?: boolean;
  isYou?: boolean; // Utilisé côté front uniquement pour l'affichage
}

export interface VersusLobby {
  id: string;
  code: string; // Code court ex: AX92 pour inviter des amis
  hostUid: string;
  players: VersusPlayer[];
  status: 'waiting' | 'playing' | 'finished';
  gameType: 'chiffres' | 'cartes1' | 'cartes4' | 'dates';
  seed: number; // Grain aléatoire pour que tout le monde ait le même tirage
  fillWithCommunity: boolean;
  startTime?: any;
  maxPlayers: number;
  isPrivate: boolean;
}

@Injectable({ providedIn: 'root' })
export class VersusService {
  // Utilisation de l'instance par défaut
  private db = getFirestore();
  private auth = getAuth();
  
  // ID de l'app pour le cloisonnement des données
  private appId = (window as any).__app_id || 'orus-prod';

  constructor(private router: Router) {}

  // --- GESTION DU SALON (LOBBY) ---

  /** Crée un nouveau salon et retourne son ID */
  async createLobby(gameType: VersusLobby['gameType'] = 'chiffres', isPrivate = false): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Vous devez être connecté pour créer un salon.');

    const lobbyData: any = {
      code: this.generateRoomCode(),
      hostUid: user.uid,
      maxPlayers: 5,
      isPrivate: isPrivate,
      fillWithCommunity: !isPrivate,
      players: [{
        uid: user.uid,
        pseudo: user.displayName || 'Joueur',
        isReady: true,
        score: 0,
        finished: false
      }],
      status: 'waiting',
      gameType,
      seed: Math.floor(Math.random() * 1000000), // Le "seed" assure que tous les joueurs auront la même suite
      createdAt: serverTimestamp()
    };

    const lobbiesRef = collection(this.db, 'artifacts', this.appId, 'lobbies');
    const docRef = await addDoc(lobbiesRef, lobbyData);
    
    return docRef.id;
  }

  /** Rejoindre un salon via son ID ou son Code Court */
  async joinLobby(lobbyIdOrCode: string): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Connexion requise.');

    let lobbyRef;
    let lobbyId = lobbyIdOrCode;
    
    // Si c'est un code court (4 caractères), on cherche le document correspondant
    if (lobbyIdOrCode.length === 4) {
      const q = query(
        collection(this.db, 'artifacts', this.appId, 'lobbies'), 
        where('code', '==', lobbyIdOrCode.toUpperCase()),
        where('status', '==', 'waiting')
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) throw new Error('Salon introuvable ou partie déjà commencée.');
      lobbyRef = snapshot.docs[0].ref;
      lobbyId = snapshot.docs[0].id;
    } else {
      // Sinon c'est un ID direct
      lobbyRef = doc(this.db, 'artifacts', this.appId, 'lobbies', lobbyIdOrCode);
    }

    // Transaction pour garantir l'atomicité (éviter que 2 joueurs prennent la dernière place en même temps)
    await runTransaction(this.db, async (transaction) => {
      const sfDoc = await transaction.get(lobbyRef);
      if (!sfDoc.exists()) throw new Error("Ce salon n'existe plus.");

      const lobby = sfDoc.data() as VersusLobby;
      
      if (lobby.status !== 'waiting') throw new Error("La partie est déjà en cours.");
      if (lobby.players.length >= lobby.maxPlayers) throw new Error("Le salon est complet.");
      
      // Si le joueur est déjà dedans, on ne fait rien
      if (lobby.players.some((p: any) => p.uid === user.uid)) return;

      const newPlayer: VersusPlayer = {
        uid: user.uid,
        pseudo: user.displayName || 'Joueur',
        isReady: false,
        score: 0,
        finished: false
      };

      transaction.update(lobbyRef, { players: [...lobby.players, newPlayer] });
    });

    return lobbyId;
  }

  /** Quitter le salon proprement */
  async leaveLobby(lobbyId: string) {
    const user = this.auth.currentUser;
    if (!user) return;

    const lobbyRef = doc(this.db, 'artifacts', this.appId, 'lobbies', lobbyId);
    
    await runTransaction(this.db, async (transaction) => {
      const sfDoc = await transaction.get(lobbyRef);
      if (!sfDoc.exists()) return;

      const lobby = sfDoc.data() as VersusLobby;
      const newPlayers = lobby.players.filter((p: any) => p.uid !== user.uid);

      if (newPlayers.length === 0) {
        // Optionnel : supprimer le salon s'il est vide, mais on peut le garder pour l'historique
        // transaction.delete(lobbyRef); 
      } else {
        // Si l'hôte part, on promeut le joueur suivant comme hôte
        let newHostUid = lobby.hostUid;
        if (lobby.hostUid === user.uid) {
          newHostUid = newPlayers[0].uid;
        }
        transaction.update(lobbyRef, { 
          players: newPlayers,
          hostUid: newHostUid
        });
      }
    });
  }

  // --- GAMEPLAY TEMPS RÉEL ---

  /** Observable qui émet l'état du salon en temps réel */
  watchLobby(lobbyId: string): Observable<VersusLobby | null> {
    const lobbyRef = doc(this.db, 'artifacts', this.appId, 'lobbies', lobbyId);
    return new Observable(obs => {
      const unsub = onSnapshot(lobbyRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data() as VersusLobby;
          data.id = snap.id;
          obs.next(data);
        } else {
          obs.next(null);
        }
      }, (err) => {
        console.error("Erreur sync lobby:", err);
        obs.error(err);
      });
      return () => unsub();
    });
  }

  /** Lancer la partie (Action Hôte) */
  async startGame(lobbyId: string) {
    const lobbyRef = doc(this.db, 'artifacts', this.appId, 'lobbies', lobbyId);
    await updateDoc(lobbyRef, { 
      status: 'playing',
      startTime: serverTimestamp()
    });
  }

  /** Mettre à jour son score ou signaler qu'on a fini */
  async updateMyStatus(lobbyId: string, score: number, finished: boolean) {
    const user = this.auth.currentUser;
    if (!user) return;

    const lobbyRef = doc(this.db, 'artifacts', this.appId, 'lobbies', lobbyId);
    
    await runTransaction(this.db, async (transaction) => {
      const sfDoc = await transaction.get(lobbyRef);
      if (!sfDoc.exists()) return;
      
      const lobby = sfDoc.data() as VersusLobby;
      const players = lobby.players.map((p: any) => {
        if (p.uid === user.uid) {
          return { ...p, score, finished };
        }
        return p;
      });

      const updates: any = { players };
      
      // Si tout le monde a fini, on clôture le salon
      if (players.every((p: any) => p.finished)) {
        updates.status = 'finished';
      }

      transaction.update(lobbyRef, updates);
    });
  }

  // --- UTITLITAIRES ---

  private generateRoomCode(): string {
    // Génère un code type "AX92"
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  }
}