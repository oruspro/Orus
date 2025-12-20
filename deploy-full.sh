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

# CHEMINS VPS ADAPTÉS À VOTRE CONFIGURATION
# 1. Dossier où on stocke le CODE SOURCE pour le build (séparé du site public)
VPS_SOURCE_PATH="/var/www/orus-source" 
# 2. Dossier PUBLIC servi par Nginx (selon votre grep: root /var/www/orus)
WEB_ROOT="/var/www/orus"

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
    
    # 1. Préparation du dossier SOURCE (là où on clone et build)
    mkdir -p $VPS_SOURCE_PATH
    
    # --- FIX CRITIQUE : DUBIOUS OWNERSHIP ---
    git config --global --add safe.directory $VPS_SOURCE_PATH
    
    cd $VPS_SOURCE_PATH

    # 2. Récupération Git (Clone/Pull)
    if [ ! -d ".git" ]; then
        echo "📥 Dossier source vide ou non-Git. Nettoyage et Clonage..."
        if [ "\$(ls -A)" ]; then
           rm -rf ./* ./.??* 2>/dev/null || true
        fi
        git clone $REPO_URL .
    else
        echo "🔄 Récupération de la mise à jour..."
        git fetch --all
        git reset --hard origin/$BRANCH
    fi

    # 3. Installation Dépendances (ROBUSTE)
    echo "📦 Installation des dépendances (Méthode propre)..."
    
    # On supprime node_modules pour éviter les conflits
    rm -rf node_modules package-lock.json

    # Installation propre incluant les devDependencies
    # --legacy-peer-deps évite les blocages de version
    npm install --legacy-peer-deps --include=dev

    # FIX ULTIME : Installation explicite du builder Angular si manquant
    # On force la version 17+ (compatible Angular 17/18) ou on laisse npm gérer via package.json
    # Si le package.json est correct, npm install devrait suffire.
    # Si ça échoue encore, on force une version compatible.
    
    if [ ! -d "node_modules/@angular-devkit/build-angular" ]; then
        echo "⚠️ Builder Angular manquant. Tentative d'installation forcée (Version compatible)..."
        # On essaie d'abord d'installer la version définie dans package.json
        npm install --save-dev @angular-devkit/build-angular@latest --legacy-peer-deps
    fi

    # 4. Construction (Build)
    echo "🏗️  Construction de l'application (Build)..."
    # Utilisation explicite du binaire ng local
    ./node_modules/.bin/ng build --configuration production

    # 5. Déploiement vers le dossier Web PUBLIC
    echo "🚀 Mise en ligne vers $WEB_ROOT..."
    
    # Détection du dossier de sortie
    if [ -d "dist/orus/browser" ]; then
        BUILD_PATH="dist/orus/browser"
    elif [ -d "dist/orus" ]; then
        BUILD_PATH="dist/orus"
    else
        echo "❌ ERREUR CRITIQUE : Dossier dist introuvable après le build."
        echo "Contenu de dist :"
        ls -R dist/ || echo "Pas de dossier dist"
        exit 1
    fi
    
    echo "📂 Source buildée : \$BUILD_PATH"
    
    # Copie des fichiers vers le dossier public Nginx
    mkdir -p $WEB_ROOT
    
    if [ "$VPS_SOURCE_PATH" != "$WEB_ROOT" ]; then
        rm -rf $WEB_ROOT/*
        cp -r \$BUILD_PATH/* $WEB_ROOT/
    else
        echo "⚠️  Attention : Dossier Source et Web Root sont identiques. Copie annulée pour éviter la boucle."
    fi
    
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