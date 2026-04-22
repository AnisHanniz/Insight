# Push to Vercel — procédure

Vercel est branché sur la branche `main` du repo `AnisHanniz/Insight`. Tout push sur `main` déclenche un build + deploy prod automatique. Tout push sur une autre branche (ou ouverture de PR) déclenche un deploy preview isolé.

---

## Flow rapide (direct sur main)

Pour un petit fix persso, sans CI/review :

```bash
cd /home/nad/iqcs

# 1. Vérifie l'état
git status

# 2. Vérifie que ça compile localement
npm run lint
npm run typecheck

# 3. Stage + commit
git add -A
git commit -m "fix: description courte"

# 4. Sync avec remote (au cas où)
git pull --rebase origin main

# 5. Push → Vercel build auto
git push
```

Vercel build visible sur https://vercel.com/anishanniz (ou email de notification). Build ~1-3 min. URL prod refresh automatique.

---

## Flow propre (via PR + preview)

Pour toute modif non triviale. Tu obtiens une URL preview pour tester avant merge.

```bash
# 1. Nouvelle branche depuis main à jour
git checkout main
git pull
git checkout -b feat/nom-court

# 2. Code + test local
npm run dev

# 3. Vérifs
npm run lint
npm run typecheck

# 4. Commit + push branche
git add -A
git commit -m "feat: description"
git push -u origin feat/nom-court

# 5. Ouvre PR
gh pr create --fill
# Copie l'URL PR depuis la sortie

# 6. Vercel poste un commentaire sur la PR avec l'URL preview (~1-3 min)
#    Teste sur cette URL. Si KO, re-push sur la même branche → preview se met à jour.

# 7. Merge quand satisfait
gh pr merge --squash --delete-branch
# Ou via UI GitHub → Merge

# 8. Merge sur main → Vercel re-deploy prod auto
```

---

## Surveiller le deploy

- **Dashboard** : https://vercel.com/anishanniz → ton projet → onglet "Deployments"
- **Status inline GitHub** : chaque commit sur `main` affiche un check Vercel (✔ succès, ✘ échec)
- **Logs en direct** : clique sur le deploy en cours → "Build Logs"

Si build échoue, logs Vercel disent exactement où. Causes fréquentes :
- Erreur TS → `npm run typecheck` localement avant push
- Variable d'env manquante → ajouter sur Vercel → Settings → Environment Variables → redeploy
- Migration Prisma non appliquée → voir section ci-dessous

---

## Changement de schéma Prisma

Si tu modifies `prisma/schema.prisma` :

```bash
# 1. Localement, génère + applique la migration sur ta DB locale
npx prisma migrate dev --name description_migration

# 2. Ça crée un dossier dans prisma/migrations/. Commit-le :
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: schema change XYZ"

# 3. Push
git push

# 4. Sur Vercel, le build exécute `prisma generate` automatiquement (via ton build script).
#    MAIS `prisma migrate deploy` n'est PAS dans le build par défaut.
#    Pour que la DB prod applique la migration, deux options :
```

**Option A (recommandée)** — ajouter `prisma migrate deploy` au build Vercel :
Dans `package.json` :
```json
"build": "prisma generate && prisma migrate deploy && next build"
```
→ chaque deploy applique les nouvelles migrations avant le build Next.

**Option B** — manuel via Vercel CLI ou console Neon :
```bash
# Depuis ton laptop avec DATABASE_URL pointant sur la DB prod (temporairement) :
DATABASE_URL="<url_prod_neon>" npx prisma migrate deploy
```

---

## Variables d'environnement

Changement de `.env.local` ≠ changement sur Vercel. Vercel ignore `.env.local` (c'est gitignored).

Pour ajouter/modifier une variable en prod :
1. https://vercel.com/anishanniz/insight/settings/environment-variables
2. Add (ou edit) → choisir l'environnement : Production / Preview / Development
3. Après modif, **redeploy** (Deployments → dernier deploy → menu ⋯ → Redeploy) pour que la nouvelle valeur prenne effet.

Variables critiques (rappel) :
- `DATABASE_URL`
- `NEXTAUTH_URL` (= URL prod Vercel, pas localhost !)
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (si OAuth Google)
- `STEAM_API_KEY` (si Steam)

---

## Rollback rapide

Si un deploy prod casse :

- **Via dashboard** : Deployments → trouve le dernier deploy qui marchait → menu ⋯ → "Promote to Production".
- **Via git** : `git revert <sha>` → push → nouveau deploy corrigé.

Le rollback via dashboard est instantané (pas de rebuild), c'est la voie la plus rapide en cas d'incident.

---

## Cheatsheet ultra-courte

| Action | Commande |
|---|---|
| Test local | `npm run dev` |
| Vérif pré-push | `npm run lint && npm run typecheck` |
| Deploy prod direct | `git commit -am "…" && git push` |
| Deploy preview | `git push -u origin <branche>` + `gh pr create --fill` |
| Merge + deploy prod | `gh pr merge --squash --delete-branch` |
| Rollback prod | Dashboard Vercel → Promote to Production sur ancien deploy |
| Voir logs build | Dashboard Vercel → Deployments → clique deploy |

---

## Erreurs fréquentes

| Erreur | Cause | Fix |
|---|---|---|
| `failed to push (fetch first)` | Remote a des commits en plus | `git pull --rebase origin main` |
| Build Vercel : `Cannot find module '@prisma/client'` | `prisma generate` pas lancé | Déjà dans `build` script ; vérifier `package.json` |
| Build Vercel : `NEXTAUTH_URL is not defined` | Var d'env manquante | Settings → Environment Variables |
| `403` sur OAuth en prod | `NEXTAUTH_URL` pointe localhost | Mettre l'URL Vercel réelle |
| Preview OK mais prod KO | Var d'env seulement en "Preview" | Ajouter à "Production" aussi |
