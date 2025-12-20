import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Initialisation Firebase
import { initializeApp } from 'firebase/app';

// Imports Auth
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser, 
  updateProfile,
  UserCredential
} from 'firebase/auth';

// Imports Firestore
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc,
  DocumentSnapshot,
  DocumentData
} from 'firebase/firestore';

// Import de l'environnement (Standard Angular)
// Cela permet de changer de config automatiquement entre Dev et Prod
import { environment } from '.././environments/environment';

// Initialisation de l'app Firebase avec la config de l'environnement
const app = initializeApp(environment.firebase);

export interface Elos {
  chiffres: number;
  cartes1: number;
  cartes4: number;
  dates: number;
}

export interface User {
  email: string;
  pseudo: string;
  elos: Elos;
  isPremium: boolean; // Nouveau champ
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Récupération des instances Auth et Firestore liées à l'app
  private auth = getAuth(app);
  private db = getFirestore(app);

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  showAuth = false;
  showProfile = false;

  // ID de l'application pour structurer la base de données
  private appId = 'orus-prod';

  // Codes secrets pour tes amis
  private readonly PROMO_CODES = ['ORUS-FRIEND', 'BETA-TESTER', 'ADMIN-KEY-2025'];

  constructor(private ngZone: NgZone) {
    this.initAuthListener();
  }

  private initAuthListener() {
    // Écoute l'état de connexion (connecté/déconnecté)
    onAuthStateChanged(this.auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        // Si connecté, on s'abonne aux données du profil en temps réel
        this.subscribeToUserProfile(fbUser.uid, fbUser.email || '');
      } else {
        // Si déconnecté, on remet l'utilisateur à null
        this.ngZone.run(() => this.userSubject.next(null));
      }
    });
  }

  private subscribeToUserProfile(uid: string, email: string) {
    const userDocRef = doc(this.db, 'artifacts', this.appId, 'users', uid, 'profile', 'main');

    // Écoute le document Firestore
    onSnapshot(userDocRef, (snapshot: DocumentSnapshot<DocumentData>) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        this.ngZone.run(() => {
          this.userSubject.next({
            email: email,
            pseudo: data?.['pseudo'] || email.split('@')[0],
            elos: data?.['elos'] || this.getDefaultElos(),
            isPremium: !!data?.['isPremium'] // Lecture du statut
          });
        });
      } else {
        // Si le profil n'existe pas encore (ex: premier login), on le crée
        this.createUserProfile(uid, email);
      }
    });
  }

  private async createUserProfile(uid: string, email: string) {
    const userDocRef = doc(this.db, 'artifacts', this.appId, 'users', uid, 'profile', 'main');
    const newProfile = {
      pseudo: email.split('@')[0] || 'Joueur',
      elos: this.getDefaultElos(),
      isPremium: false, // Par défaut non premium
      createdAt: new Date().toISOString()
    };
    await setDoc(userDocRef, newProfile);
  }

  private getDefaultElos(): Elos {
    return { chiffres: 1200, cartes1: 1200, cartes4: 1200, dates: 1200 };
  }

  // --- ACTIONS PUBLIQUES ---

  openAuth() { this.showAuth = true; }
  closeAuth() { this.showAuth = false; }
  
  openProfile() { this.showProfile = true; }
  closeProfile() { this.showProfile = false; }

  async signIn(email: string, pass: string) {
    await signInWithEmailAndPassword(this.auth, email, pass);
  }

  async signUp(email: string, pass: string, pseudo: string) {
    // 1. Création du compte Auth
    const credential: UserCredential = await createUserWithEmailAndPassword(this.auth, email, pass);
    const uid = credential.user.uid;
    
    // 2. Création immédiate du profil Firestore
    const userDocRef = doc(this.db, 'artifacts', this.appId, 'users', uid, 'profile', 'main');
    await setDoc(userDocRef, {
      pseudo: pseudo,
      elos: this.getDefaultElos(),
      isPremium: false,
      createdAt: new Date().toISOString()
    });

    // 3. Mise à jour du profil Auth standard
    await updateProfile(credential.user, { displayName: pseudo });
  }

  async updatePseudo(newPseudo: string) {
    const fbUser = this.auth.currentUser;
    if (!fbUser) return;
    
    const userDocRef = doc(this.db, 'artifacts', this.appId, 'users', fbUser.uid, 'profile', 'main');
    await updateDoc(userDocRef, { pseudo: newPseudo });
  }

  // --- PREMIUM & PAIEMENT ---

  /** Active le premium pour l'utilisateur courant */
  async upgradeToPremium() {
    const fbUser = this.auth.currentUser;
    if (!fbUser) throw new Error("Utilisateur non connecté");
    
    const userDocRef = doc(this.db, 'artifacts', this.appId, 'users', fbUser.uid, 'profile', 'main');
    await updateDoc(userDocRef, { isPremium: true });
  }

  /** Vérifie un code promo et active le premium si valide */
  async redeemCode(code: string): Promise<boolean> {
    if (this.PROMO_CODES.includes(code.toUpperCase())) {
      await this.upgradeToPremium();
      return true;
    }
    return false;
  }

  async signOut() {
    await signOut(this.auth);
    this.showAuth = false;
  }

  // --- GETTERS ---

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }
}