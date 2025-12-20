import { Routes } from '@angular/router';

// --- HUBS (Menus Principaux) ---
import { HomeComponent } from './hubs/home.component';
import { NormalHubComponent } from './hubs/normal-hub.component';
import { ClasseHubComponent } from './hubs/classe-hub.component';
import { VersusHubComponent } from './hubs/versus-hub.component';

// --- COURS & ACADÉMIE ---
import { CoursComponent } from './cours/cours.component';
import { CoursPalaisComponent } from './cours/cours-palais.component';
import { CoursDatesComponent } from './cours/cours-dates.component';
import { CoursCartesComponent } from './cours/cours-cartes.component';
import { CartesLociEntrainementComponent } from './cours/cartes-loci-entrainement.component';
import { GrandSystemRevisionComponent } from './cours/grand-system-revision.component';
import { CoursPalaisBuilderComponent } from './cours/cours-palais-builder.component';

// --- JEUX (ÉPREUVES) ---
import { ChiffresTrialComponent } from './games/chiffres-trial.component';
import { Cartes1TrialComponent } from './games/cartes1-trial.component';
import { Cartes4TrialComponent } from './games/cartes4-trial.component';
import { DatesTrialComponent } from './games/dates-trial.component';
import { FocusRoomComponent } from './games/focus-room.component'; // Import ajouté

// --- PAGES DIVERSES ---
import { AproposComponent } from './apropos.component';
import { OffresComponent } from './offres.component';
import { ProfilePageComponent } from './profile-page.component';
import { LeaderboardComponent } from './leaderboard.component';

export const routes: Routes = [
  // 🏠 ACCUEIL
  { path: '', component: HomeComponent },

  // 🎮 MODES DE JEU (HUBS)
  { path: 'normal', component: NormalHubComponent },
  { path: 'classe', component: ClasseHubComponent },
  { path: 'versus', component: VersusHubComponent },

  // 🏆 CLASSEMENTS
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'leaderboard/:gameId', component: LeaderboardComponent },

  // 🎓 ACADÉMIE (COURS)
  { path: 'cours', component: CoursComponent },         
  { path: 'cours-palais', component: CoursPalaisComponent },
  { path: 'cours-dates', component: CoursDatesComponent },
  { path: 'cours-cartes', component: CoursCartesComponent },
  
  // Outils d'entraînement spécifiques
  { path: 'cartes-loci-entrainement', component: CartesLociEntrainementComponent },
  { path: 'grand-systeme-revision', component: GrandSystemRevisionComponent },
  { path: 'palais-builder', component: CoursPalaisBuilderComponent },

  // Redirections pour les outils encore en construction ou non créés
  { path: 'grand-system-hundreds-revision', redirectTo: 'cours' },
  { path: 'cours-chiffres', redirectTo: 'cours' },

  // 🧠 ÉCHAUFFEMENT / FOCUS (Nouvelle route)
  { path: 'focus', component: FocusRoomComponent },

  // 🕹️ JEUX - CHIFFRES
  { path: 'chiffres-normal', component: ChiffresTrialComponent, data: { ranked: false } },
  { path: 'chiffres-classe', component: ChiffresTrialComponent, data: { ranked: true } },

  // 🕹️ JEUX - CARTES (1 PAQUET)
  { path: 'cartes1-normal', component: Cartes1TrialComponent, data: { ranked: false } },
  { path: 'cartes1-classe', component: Cartes1TrialComponent, data: { ranked: true } },

  // 🕹️ JEUX - CARTES (4 PAQUETS)
  { path: 'cartes4-normal', component: Cartes4TrialComponent, data: { ranked: false } },
  { path: 'cartes4-classe', component: Cartes4TrialComponent, data: { ranked: true } },

  // 🕹️ JEUX - DATES
  { path: 'dates-normal', component: DatesTrialComponent, data: { ranked: false } },
  { path: 'dates-classe', component: DatesTrialComponent, data: { ranked: true } },

  // ℹ️ AUTRES PAGES
  { path: 'apropos', component: AproposComponent },
  { path: 'offres', component: OffresComponent },
  { path: 'profil', component: ProfilePageComponent },

  // 🚫 FALLBACK (Doit toujours être en dernier)
  { path: '**', redirectTo: '' },
];