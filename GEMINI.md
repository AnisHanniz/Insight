Tu es expert en développement WEB et gagnat de 5 majors de CS2, tu as de larges connaissances du jeu, ce que je veux que tu crées c'est une plateforme comme faceit avec un système d'elo similaire
Mais, tout se passe sur le site, je veux que Insight devienne une plateforme qui travaille la capacité des joueurs aux décision making
La difficulté des situations évidemment seront ajustées selon l'elo
Car dans CS ce n'est pas seuelemnt les skills ou l'aim qui importent, c'est plutot les desicions et le jeu d'équipe
Donc ça sera soit des vidéos ou des screenshots ou les cartes en 2D ou autre, et le joueur doit séléctionner les bonnes
décisions selon la situation, comme dans chess.com avec pour chacune decision : Parfaite excellente, good, blunder etc..
Plus tard, je voudrais avoir des packs selon les derniers tournois tier1 tier2 tier3 etc... dont certains seront payants

---

## Avancement (2026-04-22)

### Docker full stack
- `docker compose up -d` lance db (Postgres 15, 5433) + web (Next.js 14, 3000)
- Dockerfile multi-stage (deps → builder → runner), entrypoint attend db, applique `prisma migrate deploy`, seed idempotent, puis `next start`
- Seed réécrit en upsert (skip si déjà peuplé), pas de duplication au redémarrage

### Contenu par thèmes (inspiré du mindmap CS:GO)
8 piliers = 8 packs, 3 scénarios chacun (24 au total) :
1. Training & Preparation — aim routine, review demos
2. Mechanical Skills — crosshair, spray, wide peek
3. Game Knowledge — META, économie, tricks
4. Communication — tone, info density, callouts
5. Teamplay — crossfires, trading, réorganisation
6. Attitude — énergie positive, frustration
7. Mental Fortitude — focus, reset entre rounds/maps
8. Decision Making — clutch, reading, powerplay

### Grading chess.com-style
- Chaque option cotée Perfect (100) / Excellent (75) / Good (40) / Blunder (0)
- Feedback détaillé par option
- Score cumulé live + écran bilan avec breakdown par scénario

### UI refaite
- Landing hero + grille 8 piliers colorés
- Page `/themes/[slug]` par pilier avec sous-catégories
- `/packs` filtrable par pilier, groupé sinon
- `/packs/[id]` détail + bouton Play
- `/play/[id]` scénario runner avec progress bar + scoring live
- Navbar sticky retravaillée

### Structure technique
- `src/lib/themes.ts` : dictionnaire des 8 piliers (couleurs, sous-catégories, badges, grading)
- Types `Pack` étendu (`theme`, `subtitle`, `description`, `difficulty`)
- Type `ScenarioOption` avec `quality` (`isCorrect` conservé pour compat)
- API routes `/api/packs/[id]` : comparaison string sur les IDs (plus de parseInt)

### Reste à faire (roadmap)
- Wire les routes API sur Prisma au lieu de JSON
- Elo par joueur branché sur vraies parties
- Packs payants (paywall, Stripe)
- Packs par tournoi tier 1/2/3 (scénarios issus de vraies démos)
- Images/vidéos réelles par scénario (actuellement placeholders)

## Avancement (2026-04-22, session 2) — Protocole d'équipe

### Contenu issu de `protocoles.pdf`
5 nouveaux packs ajoutés (total site : 13 packs, 45 scénarios). Protocole d'équipe 5v5 classé par pilier :

| Pack (id) | Pilier | Tier | Scénarios |
|---|---|---|---|
| CT Side — Team Protocol (`9`) | decision | 1 | `ct-1…ct-5` — XvY (5v4, 4v5), overotate, timeline 1:55→0:00, gameplan CIS/STACK/PRESSION |
| T Side — Team Protocol (`10`) | decision | 1 | `tside-1…tside-5` — classique zones neutres, finitions Limace/Explo/CIS, anti-overotate fake, anti-eco, afterplant triangle |
| Economy & Stuff Management (`11`) | knowledge | 1 | `eco-1…eco-4` — save/half/rebuy ladder, split 3 molo / 3 smoke / 3 HE / 2×flash, forcebuy 1 par map, anti-force HE swap |
| Team Callouts Protocol (`12`) | communication | 2 | `cp-1…cp-3` — call structure (Numbers+Prénom+Détails+Deathcam+Intensité), drops sayteam, retake 40s |
| Mentality & Opponent Analysis (`13`) | attitude | 2 | `ma-1…ma-4` — trade mindset, labels extré/pivot/snipe, changer zone quand bloqué, tag CIS/STACK/PRESSION |

### Admin refactor (cohérence avec schéma actuel)
- Dashboard `/admin` : stats live (`/api/packs`, `/api/scenarios`, `/api/users`), breakdown par tier, liens vers sections
- `PackForm` : ajout champs `theme` (dropdown des 8 piliers), `subtitle`, `description`, `difficulty`
- `ScenarioForm` réécrit :
  - `quality` (perfect/excellent/good/blunder) via select coloré au lieu du boolean `isCorrect`
  - Options dynamiques (add/remove), min 2
  - Champs `theme`, `subcategory`, `image` éditables
  - `title` éditable pour chaque axe macro/micro/communication (avant : seulement description)
  - Map `Any` supporté + Dust2/Train
- API :
  - `POST /api/packs` : id string (`String(max+1)`), `scenarioIds` toujours array
  - `POST /api/scenarios` : id slug `s-{base36}`, GET sans `packId` retourne tous les scénarios
  - `GET/PUT/DELETE /api/scenarios/[id]` : comparaison string (avant : `parseInt`, cassé pour ids type `ct-1`)

### Reste à faire (roadmap mise à jour)
- Wire les routes API sur Prisma au lieu de JSON (JSON et Prisma toujours désynchronisés — seed à relancer après ajout packs 9–13)
- Elo par joueur branché sur vraies parties
- Packs payants (paywall, Stripe)
- Packs par tournoi tier 1/2/3 (scénarios issus de vraies démos)
- Images/vidéos réelles par scénario (actuellement placeholders)
- Éditeur visuel d'axes avec preview scénario côté joueur
- Bulk import scénarios depuis JSON/CSV côté admin

## Avancement (2026-04-22, session 3) — Premium, Tournois, ELO & Faceit Profile

### Modifications effectuées (Ce qui a été fait)
- **Comptes de test** : Les credentials mockés fonctionnent : `test@example.com` / `password` (Joueur) et `admin@example.com` / `password` (Admin).
- **Visuels des scénarios** : Ajout du support vidéo (YouTube/mp4) en haut du composant `ScenarioView` pour rendre la plateforme plus engageante. L'éditeur admin permet de renseigner ces URL vidéos.
- **Packs Premium & Tournois** : Ajout des champs `isPremium` et `tournament` aux Packs (éditables via le dashboard Admin). L'UI de la liste des packs affiche un badge PREMIUM et l'image du pack en background. 
- **Paywall Visuel** : Les packs premiums affichent un bouton "Unlock now" au lieu de "Play now" si le joueur ne les a pas dans son `session.user.packsUnlocked`.
- **Système d'ELO** : Ajout d'une route API `POST /api/users/[id]/score` appelée à la fin d'un pack pour calculer le gain/perte d'ELO en fonction du score (%) et de la difficulté du pack.
- **Profil Faceit-Style** : 
  - Création de la page `/profile` affichant le niveau (Faceit Level de 1 à 10 calculé sur l'ELO), l'ELO actuel, l'historique des packs joués et les packs premiums débloqués.
  - **Avatars** : Ajout d'un système d'upload d'avatar cliquable depuis la page de profil avec un endpoint `/api/users/[id]/avatar`.
  - **Settings (Pseudo)** : Ajout d'un mode édition pour modifier son nom/pseudo (icône crayon à côté du nom) avec un endpoint `/api/users/[id]/name`.
- **Correction OAuth Docker** : Chargement conditionnel des clés Google/Steam dans NextAuth pour éviter que le build Docker crash sans `.env.local`.

### Reste à faire (Ce qui va être modifié)
- **Base de données Prisma** : Brancher définitivement toutes les APIs (Packs, Scénarios, Users) sur Prisma/PostgreSQL au lieu des fichiers JSON (qui créent une désynchronisation).
- **Intégration Stripe** : Remplacer le "Unlock now" visuel par un vrai checkout Stripe pour les packs premiums/tournois.
- **Classement (Leaderboard)** : Créer une page `/leaderboard` pour classer les joueurs selon leur ELO Faceit.
- **Graphique d'ELO** : Afficher un graphique (via Recharts ou Chart.js) sur la page profil pour visualiser l'évolution de l'ELO dans le temps.
- **Statistiques détaillées** : Fournir une vue détaillée des pourcentages de Perfect/Blunder sur le profil.

### Corrections & Ajustements (Suite Session 3)
- **Correction Navbar (Bug Admin Menu)** : Remplacement de la gestion via state React (`onMouseEnter` / `onMouseLeave`) par du pur CSS (`group-hover` de Tailwind) sur le menu "Admin". Cela supprime le bug de fermeture intempestive lorsque la souris passait sur l'espace vide entre le bouton et le sous-menu.
- **Remplacement du terme "Pillars" par "Fundamentals"** : À la demande de l'utilisateur, le terme "Pillars", jugé trop rigide, a été remplacé par "Fundamentals" sur tout le site (Accueil, NavBar, Liste des packs, Dashboard Admin) pour correspondre davantage au vocabulaire Esport.
- **Randomisation des réponses (Anti-triche)** : Modification du composant `ScenarioView.tsx` pour utiliser l'algorithme de mélange *Fisher-Yates* dynamique. L'ordre d'affichage des 4 options de réponse est désormais aléatoire à chaque chargement de scénario, empêchant les joueurs de deviner la "Perfect answer" simplement par sa position ou sa longueur.

## Ajout de contenu (Tier-1 Transcript Analysis)

### Méthodologie de traduction des guides
L'utilisateur a fourni 5 transcripts bruts issus d'analyses de haut niveau ("Game Vision" en anglais). L'objectif était de transformer ce flux d'informations en scénarios jouables en anglais (type chess.com) adaptés aux 8 piliers du jeu. Le site maintient l'anglais comme langue principale pour le contenu. Les termes standards comme "Bombsite" et "Long" ont été appliqués.

1. **Extraction des concepts clés (Lecture via `read_file`)** :
   - Concept 1 : "Couper la map en deux" pour identifier le *strong side* (surnombre) et le *weak side* (sous-nombre) de la défense.
   - Concept 2 : L'erreur fatale de défendre à gauche de la map (près du spawn terro) plutôt qu'aux extrémités de la map (ex: Plateau du Bombsite B sur Dust2) avec un joueur "bait" (appât).
   - Concept 3 : Différence entre "zones ouvertes" (Bombsite A sur Dust2, avantagées à l'attaque au skill) et "zones fermées" (Bombsite B, avantagées à la défense et aux lignes cassées).
   - Concept 4 : Ignorer les fakes ou lurkers (le joueur isolé Long) pour se concentrer sur "le gros" de l'attaque (les 4 joueurs Short) en reculant.
   - Concept 5 : Distinguer la "Comfort Zone" (13 premières secondes du round CT où l'on est intouchable, dédiée à l'analyse/macro) de la "Alert Zone".

2. **Conversion en Scénarios (Script `update_transcripts.js`)** :
   - Un script Node.js a été écrit pour injecter un nouveau pack complet en anglais ("Advanced Game Vision") dans `packs.json` et 5 nouveaux scénarios dans `scenarios.json`.
   - Chaque concept abstrait est devenu une situation concrète (ex: "You are CT on Dust2... Your AWPer at Mid gets the info that 3 terrorists went Mid...").
   - **Grading** : 
     - "Perfect" (100) : Appliquer la théorie à la lettre (cut the map, fall back to extremities, exploit comfort zone).
     - "Good" (40) : Une action normale (le standard de matchmaking) mais sous-optimale à haut niveau.
     - "Blunder" (0) : Une grosse erreur tactique (se faire appâter, jouer du côté faible).
   - Le pack a été placé sous le pilier `decision` ("Decision Making").

Ce processus de transcription et de traduction peut être répliqué pour n'importe quelle analyse tier-1 ou démo de tournoi afin d'alimenter la plateforme en contenu de haute qualité en anglais.

## Avancement UX/UI & Admin (Session 4)

### 1. Refonte visuelle de l'UX en jeu (ScenarioView)
L'affichage en jeu a été entièrement revu pour s'adapter aux standards d'un outil d'analyse Esport professionnel.
- **Mise en page "Dashboard" (12 colonnes)** : L'image/radar n'est plus un énorme bloc au-dessus des questions. L'écran est désormais scindé : à gauche l'image et la situation (7 colonnes), et à droite fixés (sticky) les choix de réponses (5 colonnes). Tout est visible sans scroller.
- **Optimisation des radars tactiques** : Les images (radars de cartes) ont désormais une taille contrôlée (`max-h-[400px]`, `object-contain`) et sont centrées dans un conteneur sombre élégant.
- **Nouveau Fallback CS2** : Suppression du visuel "image manquante" basique au profit d'un composant design stylisé "CS2 Protocol / Strategic Map Data" avec des nuances bleu/acier.
- **Micro-interactions** : Ajout d'animations fluides au survol des options et à l'apparition des feedbacks ("fade-in slide-in-from-bottom").

### 2. Refonte du style de l'interface Admin (Dashboard)
Les boutons de l'interface d'administration ont été modifiés pour supprimer l'aspect générique "Bootstrap/IA" (rouge, vert, bleu purs avec grosses ombres) au profit d'un style plus fin et professionnel.
- **Boutons principaux** : Remplacés par la couleur `primary` du site avec un effet de `shadow` coloré discret et une réduction de taille au clic (`active:scale-95`). Typographie affinée (`text-sm font-semibold tracking-wide`).
- **Boutons d'action (Edit, Delete, Manage)** : Remplacés par un style plus moderne : fond semi-transparent (`bg-white/5`), bordures discrètes (`border-white/10`) et texte coloré (bleu ou rouge) qui s'illumine subtilement au survol avec une légère teinte de fond (`hover:bg-blue-500/20`).
- Les modifications s'appliquent sur l'ensemble des écrans d'administration : liste des packs, liste des utilisateurs, détail d'un pack et tous les formulaires (création/édition).

### 3. Intégration globale des radars tactiques
- Regroupement de toutes les images radars (depuis `images/maps/`) vers le dossier public de l'application Next.js (`public/images/maps/`).
- Création d'un script (`update_scenarios_images.js`) pour analyser le champ `map` ou le texte de chaque scénario existant afin de lui lier automatiquement la bonne image de radar 2D associée, puis injection en base de données.

## Avancement (Session 5) — Éditeur d'overlay sur carte

### Objectif
Permettre aux admins d'enrichir le radar tactique d'un scénario avec une couche d'annotations (smokes, molos, flashes, HE, joueurs CT/T, notes textuelles, flèches directionnelles) — à la manière d'un coach dessinant sur une carte. La couche est sauvegardée sur le scénario et réaffichée côté joueur.

### Nouveaux fichiers
- `src/types/overlay.d.ts` — types `OverlayItemType` (`smoke | molotov | flash | he | player-ct | player-t | text | arrow`), `OverlayItem` (coords x/y en % 0–100, x2/y2 pour flèches, `label`, `size`), `MapOverlay { items: OverlayItem[] }`.
- `src/components/MapOverlayRenderer.tsx` — rendu SVG partagé (lecture seule ou interactif). `<svg viewBox="0 0 100 100" preserveAspectRatio="none">` positionné `absolute inset-0` par-dessus l'image. Chaque type a son dessin (cercle pointillé pour smoke, noyau rouge pour molo, cercle clair pour flash, petit cercle rouge foncé pour HE, cercles bleu/orange pour joueurs, polygone calculé pour pointe de flèche, rect + text pour note). Export `defaultSize(type)` pour tailles par défaut homogènes entre éditeur et preview.
- `src/components/admin/MapOverlayEditor.tsx` — éditeur modal interactif : toolbar (8 outils + cursor), click-pour-placer, drag-pour-déplacer, sélection, suppression (touche Suppr / bouton), panneau latéral d'édition (label, size via slider 0.8–8, coords X/Y numériques, X2/Y2 pour flèches), liste des items, clear all, save/cancel.

### Modifs
- `prisma/schema.prisma` : ajout de `overlay Json?` sur `Scenario` (optionnel, rétrocompatible).
- `src/types/scenario.d.ts` : ajout du champ `overlay?: MapOverlay` sur `Scenario`.
- `src/components/admin/ScenarioForm.tsx` :
  - Nouveau bloc "Map overlay" sous le champ Image URL : bouton "Open editor" / "Edit overlay", bouton "Clear", compteur d'items, preview miniature de la carte + overlay quand les deux sont renseignés.
  - Modal plein-écran fond noir (`fixed inset-0 z-50 backdrop-blur-sm`) qui embarque `MapOverlayEditor`.
  - Le payload de submit inclut désormais `overlay` (omis si 0 items).
- `src/components/ScenarioView.tsx` : wrapper relatif carré au-dessus de l'image `<Image fill object-contain>` + `<MapOverlayRenderer overlay={current.overlay} />` superposé, pour que le joueur voie les annotations pendant le scénario.

### Cohérence admin ↔ joueur
Les deux vues utilisent un conteneur strictement carré et identique pour que les coordonnées pourcentages matchent au pixel près :
```
aspectRatio: "1 / 1"
width: "100%"
maxWidth: "min(70vh, 100%)"
```
Problème initial : `aspectRatio 1/1 + maxHeight` produisait un rectangle dès que la largeur dépassait la hauteur max (la hauteur se faisait clamper, le ratio était cassé). Les annotations placées dans l'éditeur s'affichaient alors décalées côté joueur. Corrigé en passant par `maxWidth` pour forcer le carré.

### Rendu et tailles
- Tailles par défaut centralisées dans `defaultSize()` (éditeur + renderer partagent la même source).
- Police des labels à l'intérieur des formes auto-scale avec `size` (`letterFont = max(0.9, size * 0.75)`, `playerFont = max(0.9, size * 0.7)`) pour que "CT"/"T"/"S"/"M"/"F"/"HE" tiennent toujours dans le cercle.
- Flèches redessinées sans `<marker>` SVG (qui scalait mal avec `strokeWidth`) : ligne tronquée avant la pointe + polygone calculé à partir de dx/dy normalisés, taille fixe de 2.2 unités indépendante du stroke.
- Flèches < 1.5 unités (clic sans drag) supprimées au `mouseup` pour éviter les flèches fantômes.
- Drag d'une flèche déplace les deux extrémités ensemble (garde x2/y2 relatives à x/y).

### Persistance
Les routes JSON (`POST/PUT /api/scenarios/[id]`) font déjà un spread du payload — le champ `overlay` traverse sans modification. Prisma est prêt (`overlay Json?`) mais comme les routes utilisent encore les fichiers JSON (cf. CLAUDE.md), la migration Prisma reste à brancher.

### Reste à faire / pistes d'amélioration
- Upload d'image de fond custom depuis l'éditeur (actuellement on ne peut que référencer une URL côté formulaire).
- Undo/redo sur l'historique des modifications de l'overlay.
- Rotation pour joueurs/flèches.
- Presets (ex. "4 smokes Mid Mirage") pour accélérer la création de scénarios.
- Import/export de l'overlay au format JSON pour versionner les protocoles.

## Avancement (Session 6 - 2026-04-22 10:30) — Refinements UI, MindMap & Améliorations de l'Éditeur d'Overlay

### Modifications UI de la Page d'Accueil (`src/app/page.tsx`)
- **Mind Map des Fondamentaux** : La liste des 8 "Fundamentals" a été transformée en une carte mentale interactive (`src/components/MindMap.tsx`). Elle présente un nœud central "CS2 Mastery" avec des lignes reliant les 8 piliers disposés circulairement (sur desktop) ou en grille (sur mobile). Chaque pilier reste cliquable pour y accéder.
- **Section Marketing Premium** : Ajout d'une section "Call to Action" incitant les joueurs à débloquer les packs premium ("Take your decisions to the next level"). Cette section est positionnée de manière stratégique juste sous la section Hero (bannière principale).
- **Épuration de la Section Hero** : Retrait des petites cartes affichant les scores "Perfect", "Excellent", "Good", et "Blunder" (100, 75, 40, 0 pts) qui encombraient la vue initiale sans apporter de réelle valeur immédiate au visiteur.

### Améliorations de l'Éditeur et du Rendu d'Overlay
- **Redimensionnement des Icônes par Défaut** (`src/components/MapOverlayRenderer.tsx`) : Réduction de la taille par défaut des joueurs (T/CT) et des grenades (smoke, molotov, flash, he) pour qu'ils encombrent moins la carte.
- **Correction du Déplacement des Flèches** (`src/components/admin/MapOverlayEditor.tsx`) : La logique de déplacement en mode "drag" (déplacer un élément existant) a été corrigée pour les flèches. Désormais, l'intégralité de la flèche (sa queue `x/y` et sa pointe `x2/y2`) est translatée simultanément.
- **Copier/Coller (Ctrl+C / Ctrl+V)** (`src/components/admin/MapOverlayEditor.tsx`) : Ajout du support des raccourcis clavier Ctrl+C et Ctrl+V (ou Cmd sur Mac) permettant de dupliquer rapidement l'élément actuellement sélectionné. Le nouvel élément collé est légèrement décalé (offset de +3%) par rapport à l'original et automatiquement sélectionné.
- **Alignement Pixel-Perfect (Éditeur vs Vue Joueur)** (`src/components/ScenarioView.tsx`) : Pour pallier aux comportements imprévisibles de l'optimisation d'image intégrée de Next.js (`next/image`) avec le comportement CSS `object-contain`, le composant Next `<Image>` a été remplacé par une balise HTML standard `<img>`. Cela garantit que le rendu et l'échelle de l'image de fond (la carte) soient 100% identiques entre l'éditeur d'administration et ce que le joueur voit en jeu, évitant tout décalage du calque superposé.

## Avancement (Session 7 - 2026-04-22 11:30) — Restructuration des pages et navigation

### Refonte de la Navigation (Navbar)
- **Home** : La page d'accueil (Landing Page) est désormais accessible via l'onglet "Home".
- **Fundamentals** : Création d'une nouvelle page dédiée aux exercices et packs gratuits (`/fundamentals`). Elle regroupe tous les packs non-premium.
- **Premium** : L'onglet "Packs" a été renommé en "Premium" et redirige vers `/premium`. Cette page met en avant les packs payants avec une section marketing renforcée (arguments de vente, bénéfices tier-1).
- **Style Visuel** : L'onglet "Premium" utilise un dégradé doré (`from-yellow-400 to-yellow-200`) pour souligner son caractère exclusif.

### Mise à jour des Pages
- **Page d'Accueil (`src/app/page.tsx`)** : Tous les boutons d'action ("Start training", "Get premium packs", etc.) ont été redirigés vers leurs nouvelles destinations respectives (`/fundamentals` ou `/premium`).
- **Page Fundamentals (`src/app/fundamentals/page.tsx`)** : Filtre automatiquement pour n'afficher que les packs gratuits.
- **Page Premium (`src/app/premium/page.tsx`)** : Filtre pour n'afficher que les packs premium. Ajout d'une section marketing avec des icônes et des points clés (Pro Scenarios, Advanced Macro, Maximum ELO).
- **Cohérence des Liens** :
  - La redirection automatique de `/play` pointe désormais vers `/fundamentals`.
  - Le bouton "More packs" à la fin d'un scénario (`ScenarioView.tsx`) redirige vers `/fundamentals`.
  - Suppression de l'ancienne route index `/packs` au profit de la structure segmentée.

## Avancement (Session 10 - 2026-04-24) — Mode Bolt, ELO admin fix, gates ELO

### 1. Mode Bolt (`/bolt`) — ex-Defuse renommé

- **Renommage complet** : `DefuseView` → `BoltView`, route `/defuse` → `/bolt`, `packId: "defuse"` → `packId: "bolt"`, icône navbar changée (⚡ jaune au lieu de 🕐 rouge).
- **Navbar** : lien "Bolt" avec icône éclair jaune.

### 2. Correction ELO admin

- **Bug** : `handleChange` dans `UserForm.tsx` retournait toujours des strings (`e.target.value`), donc le champ ELO envoyait `"1200"` au lieu de `1200`. Prisma `Int` rejetait silencieusement.
- **Fix** : détection `type === "number"` → `parseInt(value, 10)`. Double sécurité dans l'API `PUT /api/users/[id]` : `elo: parseInt(String(data.elo), 10)`.

### 3. Gates ELO sur la difficulté (Marathon & Bolt)

- **`src/lib/eloGate.ts`** : utilitaire partagé. Seuils : Easy verrouillé au-dessus de 1299 ELO, Hard verrouillé en-dessous de 1100 ELO.
- **Marathon** : ajout d'un sélecteur de difficulté (Easy/Medium/Hard) mappé sur `beginner/intermediate/advanced` pour le facteur ELO. Les cartes verrouillées sont grises avec icône 🔒 et message (ex. "Reach 1100 ELO to unlock"). L'ELO actuel est affiché sous le sélecteur.
- **Bolt** : même système. `useEffect` auto-sélectionne la difficulté valide quand l'ELO de la session est chargé.
- **Règle** : ELO de départ = 1000 → Easy + Medium disponibles, Hard verrouillé. À partir de 1100 → tout déverrouillé. À partir de 1300 → Easy verrouillé.

### 4. Correction build Docker

- **Erreur** : `DefuseView.tsx:260` — apostrophe non échappée `TIME'S UP` → `TIME&apos;S UP`. Seule vraie erreur ESLint (pas un warning) qui faisait échouer `next build`.

## Avancement (Session 9 - 2026-04-24) — UX Compact, Marathon & ELO par qualité

### 1. Refonte UX/UI — Compacité & Modals

- **Suppression du système de Tier** : Le badge `Tier {n}` a été retiré de toutes les pages (Fundamentals, Premium, Packs, Themes, Admin). Remplacé par le badge `difficulty` (Beginner / Intermediate / Advanced) partout. Le champ `tier` est conservé en base pour rétro-compatibilité mais n'est plus affiché ni saisi.
- **PackForm élargi** : La modal d'édition de pack était `max-w-lg` (512 px) — trop étroite. Passée à `max-w-2xl`. Le formulaire passe de `w-[32rem]` à `w-full`, layout reorganisé en grille 3 colonnes (Fundamental / Difficulty / Price).
- **ScenarioForm élargi** : La modal scenario était aussi `max-w-lg` alors que le formulaire fait 768 px. Corrigé en `max-w-5xl`, scroll vertical sur la page pour les longs formulaires.
- **Map Overlay Editor** : Padding de la modal réduit (`p-6` → `p-4`), container avec `max-w-[96vw] max-h-[96vh] overflow-auto` pour utiliser tout l'espace écran.
- **Pages compactes** : Réduction des paddings et tailles de titres sur Landing (`text-7xl` → `text-5xl`, `pt-16 pb-20` → `pt-10 pb-10`), Fundamentals (`text-5xl` → `text-3xl`, `space-y-14` → `space-y-8`), Premium (section marketing condensée de tall centré → 2 colonnes inline). Grilles de packs passées à 4 colonnes sur xl. Cartes packs `p-6` → `p-4`.
- **Admin packs liste** : Images `h-40` → `h-28`, gap `gap-8` → `gap-4`, textes réduits.
- **Fallback images sans ad-blocker** : Remplacement des `https://via.placeholder.com/300x150` (bloqués par les ad-blockers) par des `<div>` CSS avec dégradé sombre + label "No image".

### 2. Corrections de Bugs

- **React error #31** (Objects are not valid as a React child) : L'API `/api/packs/[id]` retournait `scenarios: Array<{id: string}>` (relation Prisma) après le spread `{ ...pack, scenarioIds: ... }`. Le champ n'était pas écrasé. Corrigé en ajoutant `scenarios: pack.scenarios.length` dans le formattedPack.
- **Images 404** : `iem-rio-2026.jpg` corrigé en `iemrio2026.jpg` (nom réel sur disque). `pgl-major-2025.jpg` absent → `imageUrl` vidée dans `packs.json`.
- **Mentions FACEIT supprimées** : "FACEIT difficulty" → "Adaptive difficulty" sur la landing. "Faceit Level" → "Insight Level" sur le profil.

### 3. Background & Favicon

- **Background unique** : Suppression du `bg-gradient-to-b from-gray-900 to-gray-800` de `layout.tsx`. Nouveau fond global dans `globals.css` : `#0d0f14` + radial-gradient bleu primaire au top + grille de points 28 px (CSS pur, `radial-gradient` sur 1 px). Donne un look professionnel type Linear/Vercel sans image externe.
- **Community cards** : Ajout de `bg-no-repeat` pour éviter le tiling des images de fond dans les cartes.
- **Favicon** : Deux itérations. Version finale : hexagone bleu primaire (#00a8e8) avec un inset sombre et un lettermark "I" en bleu — style badge esport.

### 4. Mode Marathon (`/marathon`)

Nouveau mode de jeu accessible depuis la Navbar (icône éclair entre Fundamentals et Premium).

- **Page `/marathon`** : Machine d'état en 3 phases — Config → Loading → Playing.
  - **Config** : Sélection des 8 fondamentaux (pills avec check, impossible de tout désélectionner), choix du nombre de questions (10 / 20 / 30 / 50), résumé live "X fundamentals · Y questions".
  - **Loading** : Spinner pendant le fetch.
  - **Playing** : Header compact "Marathon Mode · N questions · fondamentaux sélectionnés" + bouton "← New config". Utilise `ScenarioView` avec un pack synthétique `{ id: "marathon", difficulty: "intermediate" }`.
- **API `/api/marathon`** : GET avec `?themes=decision,teamplay&count=20`. Requête Prisma sur les packs gratuits (`isPremium: false, isCommunity: false`) filtrés par theme. Collecte tous les scénarios, shuffle Fisher-Yates, slice(count). Mappe `videoUrl` → `video` pour compatibilité avec `ScenarioView`.

### 5. Système ELO par Qualité de Réponse

Remplacement de l'ancienne formule `delta = (scorePct - 50) * factor` (trop permissive, gains quasi assurés) par un système de delta **par réponse individuelle** :

| Qualité | Delta base |
|---------|-----------|
| Perfect | +10 |
| Excellent | +2 |
| Good | −6 |
| Blunder | −18 |

Facteurs de difficulté : Beginner ×0.6 · Intermediate ×0.9 · Advanced ×1.3.

- `ScenarioView.tsx` envoie désormais le breakdown `qualities: { perfect: N, excellent: N, good: N, blunder: N }` avec le POST score.
- `score/route.ts` calcule `sum(PER_QUALITY[q] * count[q]) * factor`. Fallback sur ancienne formule (seuil 70%) si `qualities` absent.
- Exemples intermédiaire : 4× Perfect = **+36** · 4× Excellent = **+7** · 4× Good = **−22** · 4× Blunder = **−65**. Il faut ~1 Perfect pour 2 Excellent pour être à l'équilibre.

## Avancement (Session 8 - 2026-04-22 12:30) — Système d'Image Dynamique & Upload

### Gestion des Assets (Images)
- **Composant `ImageSelector`** : Création d'un sélecteur d'images intelligent avec galerie visuelle, recherche en temps réel et prévisualisation.
- **Scan Automatique** : Ajout d'une route API (`/api/admin/images`) qui scanne récursivement le dossier `public/images` pour lister toutes les images disponibles.
- **Fonction d'Upload** : Intégration d'un système de transfert de fichiers via une nouvelle API (`/api/admin/images/upload`). Les images sont enregistrées dans `public/images/uploads` et immédiatement utilisables.
- **Intégration Admin** : Le sélecteur est désormais utilisé dans les formulaires de **Packs** et de **Scénarios**, éliminant le besoin de copier-coller des URLs manuellement.
- **Expérience Admin** : Amélioration drastique de la vitesse de création de contenu : scan -> recherche -> clic -> sélection.