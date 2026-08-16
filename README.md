# Tremplin

Suite d'outils carrière pour étudiants et jeunes diplômés, 100% côté client
(aucun compte, aucune base de données — tout est stocké dans le navigateur).

## Outils

- **CV** — génère un CV adapté au pays visé (France, Bénin, Canada, Belgique,
  Suisse), plusieurs styles et couleurs, optimisable par IA face à une offre
- **Lettre de motivation** — rédigée à partir du profil et d'une offre collée
- **Plan de carrière** — feuille de route étape par étape vers un objectif
- **Préparation d'entretien** — questions probables + réponses suggérées à
  partir d'une offre
- **Pitch / business plan** — structure une idée en pitch clair
- **Profil LinkedIn** — titre + résumé "À propos", plusieurs variantes

## Fonctionnement

Un seul profil (`/profil`), rempli une fois et stocké en local
(`localStorage`), alimente les six outils. Chaque outil n'ajoute que son
contexte propre (offre d'emploi, objectif, idée...) puis appelle une unique
route API `/api/generate`, paramétrée par `task`, qui construit le bon prompt
et interroge le modèle IA (Gemini par défaut).

## Lancer en local

```bash
npm install
cp .env.local.example .env.local   # puis renseigner GEMINI_API_KEY
npm run dev
```

Ouvrir http://localhost:3000
"# Tremplein" 
