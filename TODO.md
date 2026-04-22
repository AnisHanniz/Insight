# TODO — Session 3 (2026-04-22)

Liste d'items demandés par l'utilisateur. Cocher au fur et à mesure. Si session coupée, reprendre où on en est.

## Demandes utilisateur

- [ ] **1. Comptes de test** — fournir identifiants (info-only, pas de code)
- [ ] **2. Lancer le projet avec ngrok** — installer ngrok local (pas de sudo), start dev server, prévoir authtoken
- [ ] **3. Moins de lecture, plus visuel**
  - [ ] Supporter `video` (mp4/youtube) dans scenario
  - [ ] Agrandir/placer le média en haut du `ScenarioView`
  - [ ] Afficher image de pack sur `/packs` + `/packs/[id]`
  - [ ] Admin form : preview média
- [ ] **4. Re-ajouter packs payants + packs par tournoi**
  - [ ] Champ `tournament?: string` + `tier?: "S"|"A"|"B"` adapté tournoi (OU conserver tier numérique + champ `tournament`)
  - [ ] Champ `isPremium: boolean`
  - [ ] Pack exemple « IEM Rio 2026 Decision Pack » (premium, tournament)
- [ ] **5. Paywall UI**
  - [ ] Badge « PREMIUM » sur carte + détail
  - [ ] Bouton Play remplacé par « Unlock » si premium et user non propriétaire
  - [ ] Placeholder Stripe (pas de charge réelle cette session)
- [ ] **6. Système ELO par compte**
  - [ ] `User.elo` déjà présent (seed users.json)
  - [ ] Profil affiche ELO + barre de progression
  - [ ] À la fin d'un pack, calcul delta ELO basé sur score %
  - [ ] Endpoint `POST /api/users/[id]/score` pour persister delta
- [ ] **7. Profil type FaceIt**
  - [ ] Avatar (upload URL ou fichier → `/public/avatars/{userId}.{ext}`)
  - [ ] Page profil : avatar + nom + ELO + historique packs joués
  - [ ] Endpoint `POST /api/users/[id]/avatar`
- [ ] **8. Liste de liens (admin + user)** — info dans message final
- [ ] **9. Ce fichier TODO.md** ✓ (fait)

## Notes d'implémentation

### Fichiers à toucher
- `src/types/pack.d.ts` — add `tournament?`, `isPremium?`
- `src/types/scenario.d.ts` — add `video?`
- `src/types/next-auth.d.ts` — add `elo`, `image`
- `public/data/packs.json` — add IEM Rio example
- `public/data/users.json` — ensure `elo`, `image` fields
- `src/components/ScenarioView.tsx` — media top, compact axes
- `src/components/admin/PackForm.tsx` — tournament, isPremium fields
- `src/components/admin/ScenarioForm.tsx` — video field + preview
- `src/app/profile/page.tsx` — FaceIt-style layout
- `src/app/api/users/[id]/route.ts` — accept avatar, elo updates
- `src/app/api/users/[id]/score/route.ts` — NEW (POST pack result → ELO delta)
- `src/app/api/users/[id]/avatar/route.ts` — NEW (upload avatar)
- `src/app/packs/page.tsx` + `src/app/packs/[id]/page.tsx` — premium badge + paywall gate

### Décisions
- ELO delta formula (simple) : `delta = round((scorePct - 50) * difficultyFactor)` avec difficultyFactor = {beginner: 0.3, intermediate: 0.6, advanced: 1.0}. Range typique: -15..+30.
- Paywall : client-side only (visuel) pour cette session. Vraie validation Stripe = backlog.
- Avatar upload : via FormData côté client, stocké `/public/avatars/`.

## Ce qui est à faire après cette session
- Wire API routes on Prisma (toujours désynchronisé avec JSON)
- Stripe réel pour packs payants
- Historique packs joués par user (persister verdicts)
- ELO graph sur profil (chart.js ou recharts)
- Leaderboard global
- Tournament packs réels : IEM Katowice, IEM Cologne, PGL Major, BLAST Premier, ESL Pro League
