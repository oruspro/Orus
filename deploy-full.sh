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

# Infos VPS
VPS_USER="root" 
VPS_IP="82.165.217.66"
VPS_PROJECT_PATH="/var/www/orus" 
WEB_ROOT="/var/www/html"

# --- MOT DE PASSE (Optionnel) ---
VPS_PASSWORD=""

echo "📂 Dossier local : $(pwd)"
echo "🔗 Dépôt distant : $REPO_URL"
echo "🖥️  Cible VPS : $VPS_USER@$VPS_IP"
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

# Préparation de la commande SSH
SSH_CMD="ssh"
if [ -n "$VPS_PASSWORD" ]; then
    if command -v sshpass &> /dev/null; then
        echo "🔑 Mot de passe configuré : Tentative de connexion automatique..."
        export SSHPASS="$VPS_PASSWORD"
        SSH_CMD="sshpass -e ssh"
    else
        echo "⚠️  'sshpass' non installé. Vous devrez taper le mot de passe."
    fi
else
    echo "👉 Préparez-vous à taper le mot de passe VPS ci-dessous :"
fi

echo "Connexion SSH en cours..."

# Commandes à exécuter sur le serveur distant
$SSH_CMD "$VPS_USER@$VPS_IP" << EOF
    set -e # Arrêter le script à la moindre erreur
    
    echo "--- Début de l'exécution sur le VPS ---"
    
    # 1. Préparation dossier projet
    mkdir -p $VPS_PROJECT_PATH
    
    # --- FIX CRITIQUE : DUBIOUS OWNERSHIP ---
    # Autoriser Git à utiliser ce dossier même s'il appartient à un autre user
    git config --global --add safe.directory $VPS_PROJECT_PATH
    
    cd $VPS_PROJECT_PATH

    # 2. Récupération Git
    if [ ! -d ".git" ]; then
        echo "📥 Dossier non-Git détecté. Préparation au clonage..."
        if [ "\$(ls -A)" ]; then
           echo "🧹 Le dossier n'est pas vide et n'est pas un dépôt Git. Nettoyage..."
           rm -rf ./* ./.??* 2>/dev/null || true
        fi
        echo "📥 Clonage du dépôt..."
        git clone $REPO_URL .
    else
        echo "🔄 Récupération de la mise à jour..."
        git fetch --all
        git reset --hard origin/$BRANCH
    fi

    # 3. Installation Dépendances
    echo "📦 Installation des dépendances..."
    # --- FIX CRITIQUE : FORCER L'INSTALLATION DES DEV-DEPENDENCIES ---
    # On ajoute --production=false pour s'assurer que le builder Angular (@angular-devkit) est installé
    npm install --legacy-peer-deps --production=false

    # 4. Construction (Build)
    echo "🏗️  Construction de l'application (Build)..."
    npm run build -- --configuration production

    # 5. Déploiement vers le dossier Web
    echo "🚀 Mise en ligne..."
    
    # Détection du dossier de sortie
    if [ -d "dist/orus/browser" ]; then
        BUILD_PATH="dist/orus/browser"
    elif [ -d "dist/orus" ]; then
        BUILD_PATH="dist/orus"
    else
        echo "❌ ERREUR CRITIQUE : Dossier dist introuvable après le build."
        exit 1
    fi
    
    echo "📂 Source détectée : \$BUILD_PATH"
    echo "📂 Destination Web : $WEB_ROOT"
    
    # Copie des fichiers
    mkdir -p $WEB_ROOT
    rm -rf $WEB_ROOT/* cp -r \$BUILD_PATH/* $WEB_ROOT/
    
    # Permissions
    chown -R www-data:www-data $WEB_ROOT
    chmod -R 755 $WEB_ROOT

    # 6. Redémarrage Nginx
    echo "🔄 Rechargement Nginx..."
    systemctl reload nginx || echo "⚠️ Attention : Impossible de recharger Nginx"

    echo "✅ Déploiement VPS terminé avec succès !"
    echo "--- Fin de l'exécution sur le VPS ---"
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DÉPLOIEMENT COMPLET RÉUSSI !"
else
    echo ""
    echo "❌ ERREUR LORS DU DÉPLOIEMENT VPS."
    echo "Vérifiez les logs ci-dessus."
fi

echo ""
echo "==================================================="
read -p "Appuyez sur Entrée pour quitter..."