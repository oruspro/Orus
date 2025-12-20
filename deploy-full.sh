#!/bin/bash

# Script de déploiement / Force Push Automatique
# Cible : https://github.com/oruspro/Orus.git

# --- CORRECTIF CRITIQUE : FORCER LE BON DOSSIER ---
# Cette commande oblige le terminal à se placer dans le dossier du script
# (ex: Sur le Bureau) au lieu de rester dans System32.
cd "$(dirname "$0")" || { echo "❌ Impossible d'accéder au dossier du script."; read -p "Entrée..."; exit 1; }

echo "==================================================="
echo "   DÉPLOIEMENT FORCE VERS GITHUB (Orus)"
echo "==================================================="

# 1. Configuration
REPO_URL="https://github.com/oruspro/Orus.git"
BRANCH="main"

echo "📂 Dossier de travail : $(pwd)"
echo "🔗 Dépôt distant : $REPO_URL"
echo ""

# Sécurité : Vérifier qu'on n'est pas encore dans System32 par erreur
CURRENT_DIR=$(pwd)
if [[ "$CURRENT_DIR" == *"/System32"* ]] || [[ "$CURRENT_DIR" == *"/system32"* ]]; then
    echo "❌ ALERTE SÉCURITÉ : Le script est toujours dans un dossier système."
    echo "Déplacez votre dossier 'orus-angularv1' sur le Bureau et relancez."
    read -p "Appuyez sur Entrée pour quitter..."
    exit 1
fi

# 2. Nettoyage et Réinitialisation
if [ -d ".git" ]; then
    echo "🧹 Suppression de l'ancienne configuration Git locale..."
    rm -rf .git
fi

echo "🛠  Initialisation d'un nouveau dépôt Git propre..."
git init
git branch -M $BRANCH

# 3. Ajout du Remote
echo "🔗 Configuration de l'URL distante..."
git remote add origin "$REPO_URL"

# 4. Ajout des fichiers
echo "📦 Ajout de tous les fichiers du projet..."
git add .

# 5. Commit
echo "💾 Création du commit de version..."
git commit -m "Mise à jour complète (Force Push) - $(date)"

# 6. Push Force
echo "🚀 ENVOI VERS GITHUB..."
echo "⏳ Veuillez patienter..."

# Capture de la sortie pour affichage en cas d'erreur
LOGFILE="git_push.log"

if git push -u origin $BRANCH --force > "$LOGFILE" 2>&1; then
  echo ""
  echo "✅ SUCCÈS !"
  echo "Le code a été déployé sur GitHub avec succès."
  rm "$LOGFILE"
else
  echo ""
  echo "❌ ERREUR LORS DU DÉPLOIEMENT."
  echo "Voici le détail technique :"
  echo "---------------------------------------------------"
  cat "$LOGFILE"
  echo "---------------------------------------------------"
  rm "$LOGFILE"
fi

echo ""
echo "==================================================="
# La commande 'read' empêche la fenêtre de se fermer
read -p "Appuyez sur Entrée pour quitter..."