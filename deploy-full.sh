#!/bin/bash

# Script de Déploiement Complet : Force Push GitHub + Déploiement VPS
# Cible GitHub : https://github.com/oruspro/Orus.git
# Cible VPS : 82.165.217.66

# --- CORRECTIF CRITIQUE : FORCER LE BON DOSSIER ---
cd "$(dirname "$0")" || { echo "❌ Impossible d'accéder au dossier du script."; read -p "Entrée..."; exit 1; }

echo "==================================================="
echo "   DÉPLOIEMENT COMPLET (GITHUB + VPS)"
echo "==================================================="

# --- CONFIGURATION ---
REPO_URL="https://github.com/oruspro/Orus.git"
BRANCH="main"
VPS_USER="root" # Remplacez par votre utilisateur VPS si différent (ex: debian, ubuntu)
VPS_IP="82.165.217.66"
VPS_PROJECT_PATH="/var/www/orus" # Chemin vers le dossier du projet sur le VPS

echo "📂 Dossier local : $(pwd)"
echo "🔗 Dépôt distant : $REPO_URL"
echo "🖥️  Cible VPS : $VPS_USER@$VPS_IP:$VPS_PROJECT_PATH"
echo ""

# Sécurité : Vérifier qu'on n'est pas dans System32
CURRENT_DIR=$(pwd)
if [[ "$CURRENT_DIR" == *"/System32"* ]] || [[ "$CURRENT_DIR" == *"/system32"* ]]; then
    echo "❌ ALERTE SÉCURITÉ : Le script est toujours dans un dossier système."
    echo "Déplacez votre dossier projet sur le Bureau et relancez."
    read -p "Appuyez sur Entrée pour quitter..."
    exit 1
fi

# ===================================================
# ÉTAPE 1 : FORCE PUSH VERS GITHUB
# ===================================================
echo "---------------------------------------------------"
echo "📡 ÉTAPE 1 : MISE À JOUR DE GITHUB"
echo "---------------------------------------------------"

# Nettoyage préventif
if [ -d ".git" ]; then
    # Vérifie si le remote est correct, sinon réinitialise
    CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null)
    if [ "$CURRENT_REMOTE" != "$REPO_URL" ]; then
        echo "🧹 URL distante incorrecte. Réinitialisation git..."
        rm -rf .git
        git init
        git branch -M $BRANCH
        git remote add origin "$REPO_URL"
    fi
else
    echo "🛠  Initialisation d'un nouveau dépôt Git..."
    git init
    git branch -M $BRANCH
    git remote add origin "$REPO_URL"
fi

# Ajout et Commit
echo "📦 Préparation des fichiers..."
git add .
git commit -m "Mise à jour complète via script de déploiement - $(date)"

# Push
echo "🚀 Envoi vers GitHub..."
LOGFILE="git_push.log"
if git push -u origin $BRANCH --force > "$LOGFILE" 2>&1; then
  echo "✅ GitHub mis à jour avec succès."
  rm "$LOGFILE"
else
  echo "❌ ERREUR LORS DU PUSH GITHUB."
  cat "$LOGFILE"
  rm "$LOGFILE"
  read -p "Appuyez sur Entrée pour quitter (le déploiement VPS est annulé)..."
  exit 1
fi

# ===================================================
# ÉTAPE 2 : DÉPLOIEMENT SUR LE VPS
# ===================================================
echo ""
echo "---------------------------------------------------"
echo "☁️  ÉTAPE 2 : DÉPLOIEMENT SUR LE VPS ($VPS_IP)"
echo "---------------------------------------------------"
echo "Connexion SSH en cours..."

# Commandes à exécuter sur le serveur distant
# 1. Aller dans le dossier
# 2. Récupérer le code (git pull ou git clone si vide)
# 3. Installer les dépendances (npm install)
# 4. Construire l'app Angular (npm run build)
# 5. Copier vers le dossier public du serveur web (ex: /var/www/html) - À ADAPTER SELON VOTRE CONFIG NGINX

ssh "$VPS_USER@$VPS_IP" << EOF
    echo "--- Début de l'exécution sur le VPS ---"
    
    # Création du dossier s'il n'existe pas
    mkdir -p $VPS_PROJECT_PATH
    cd $VPS_PROJECT_PATH

    # Vérification si git est initialisé, sinon clone, sinon pull force
    if [ ! -d ".git" ]; then
        echo "📥 Clonage du dépôt..."
        git clone $REPO_URL .
    else
        echo "🔄 Récupération de la mise à jour..."
        git fetch --all
        git reset --hard origin/$BRANCH
    fi

    echo "📦 Installation des dépendances..."
    # --legacy-peer-deps est souvent utile pour éviter les conflits
    npm install --legacy-peer-deps

    echo "🏗️  Construction de l'application (Build)..."
    # Assurez-vous que la commande de build est 'build' dans package.json
    npm run build -- --configuration production

    # Si vous utilisez Nginx par défaut, on copie souvent le build dans /var/www/html
    # Adaptez ce chemin si votre config Nginx pointe ailleurs
    # echo "🚀 Mise en ligne..."
    # cp -r dist/orus/* /var/www/html/ 
    # ou si Nginx pointe directement sur dist/orus dans le dossier projet, rien à faire de plus.

    echo "✅ Déploiement VPS terminé !"
    echo "--- Fin de l'exécution sur le VPS ---"
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DÉPLOIEMENT COMPLET RÉUSSI !"
    echo "Votre application est à jour sur GitHub et sur le VPS."
else
    echo ""
    echo "❌ ERREUR LORS DU DÉPLOIEMENT VPS."
    echo "Vérifiez vos accès SSH, clés, ou permissions sur le serveur."
fi

echo ""
echo "