# TIKETI — Application de Billetterie Car CI

Application mobile web (PWA) de billetterie pour les transports routiers inter-urbains en Côte d'Ivoire.

## Structure du projet

```
tiketi/
├── public/
│   ├── index.html          ← Point d'entrée HTML
│   ├── manifest.json       ← Configuration PWA (installable)
│   ├── sw.js               ← Service Worker (mode offline)
│   └── icons/              ← Icônes app (192px, 512px)
├── src/
│   ├── index.jsx           ← Point d'entrée React
│   ├── TIKETI_MVP.jsx      ← Application principale (tous les écrans)
│   ├── TIKETI_Auth.jsx     ← Authentification (connexion, inscription)
│   ├── TIKETI_Notifications.jsx ← Notifications push avancées
│   ├── TIKETI_Annulation.jsx   ← Annulation & remboursement
│   ├── TIKETI_PWA.jsx      ← Hooks & composants PWA/offline
│   └── TIKETI_Rapports.jsx ← Back-office rapports admin
├── package.json
├── vercel.json             ← Configuration déploiement Vercel
└── .env.example            ← Variables d'environnement à configurer
```

## Profils disponibles (démo)

| Profil       | Email                | Mot de passe |
|-------------|----------------------|--------------|
| Voyageur    | dia@tiketi.ci        | tiketi123    |
| Contrôleur  | ctrl@tiketi.ci       | ctrl2026     |
| Admin       | admin@tiketi.ci      | admin2026    |

## Déploiement sur Vercel (étape par étape)

### Option A — Via l'interface web (recommandé pour débutants)

1. Créez un compte sur [github.com](https://github.com) (gratuit)
2. Créez un nouveau dépôt : cliquez sur "New repository" → nommez-le `tiketi` → Public → Create
3. Uploadez tous les fichiers de ce projet dans le dépôt (bouton "Add file" → "Upload files")
4. Créez un compte sur [vercel.com](https://vercel.com) (gratuit, connectez-vous avec GitHub)
5. Cliquez "New Project" → importez le dépôt `tiketi`
6. Framework Preset : **Create React App**
7. Cliquez "Deploy" — Vercel construit et publie automatiquement
8. Votre URL : `https://tiketi.vercel.app` (ou similaire)

### Option B — Via terminal (si vous avez Node.js installé)

```bash
# 1. Installer les dépendances
npm install

# 2. Tester en local
npm start
# → Ouvre http://localhost:3000

# 3. Construire pour la production
npm run build

# 4. Déployer sur Vercel
npx vercel --prod
```

## Tester l'installation PWA

1. Ouvrez l'URL Vercel sur votre téléphone Android
2. Chrome affiche "Ajouter à l'écran d'accueil" → Appuyez
3. L'icône TIKETI apparaît sur votre écran d'accueil
4. L'app s'ouvre en plein écran comme une app native

Sur iPhone :
1. Ouvrez l'URL dans Safari
2. Appuyez sur le bouton Partager (carré avec flèche)
3. "Sur l'écran d'accueil" → Ajouter

## Prochaines étapes (avec un développeur)

- [ ] Connecter à un backend réel (Node.js + PostgreSQL)
- [ ] Intégrer CinetPay / Orange Money (paiements réels)
- [ ] Configurer Firebase Cloud Messaging (notifications push réelles)
- [ ] Installer des trackers GPS dans les véhicules
- [ ] Publier sur Google Play Store et Apple App Store

## Développé avec Claude (Anthropic)
