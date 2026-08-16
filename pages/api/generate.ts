import type { NextApiRequest, NextApiResponse } from 'next'

export type GenerateTask =
  | 'cv-optimize'
  | 'cover-letter'
  | 'career-plan'
  | 'interview-prep'
  | 'pitch'
  | 'linkedin'

type GenerateRequestBody = {
  task?: GenerateTask
  profile?: Record<string, unknown>
  context?: Record<string, unknown>
}

const MODEL_NAME = 'gemini-3.5-flash'

const sendJsonError = (res: NextApiResponse, status: number, message: string, details?: unknown) => {
  const payload: Record<string, unknown> = { error: message }
  if (details !== undefined) payload.details = details
  return res.status(status).json(payload)
}

const readJsonBody = (req: NextApiRequest): GenerateRequestBody => {
  if (req.body && typeof req.body === 'object') return req.body as GenerateRequestBody
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as GenerateRequestBody
    } catch {
      throw new Error('Corps JSON invalide.')
    }
  }
  return {}
}

// Résumé compact du profil, sans identité (nom/email/téléphone), pour ne jamais
// envoyer d'informations personnelles inutiles au modèle.
function summarizeProfile(profile: Record<string, unknown> | undefined): string {
  if (!profile) return 'Aucun profil renseigné.'
  const p = profile as any
  const lines: string[] = []
  if (p.targetJob) lines.push(`Poste visé : ${p.targetJob}`)
  if (p.sector) lines.push(`Secteur : ${p.sector}`)
  if (p.careerGoal) lines.push(`Objectif professionnel : ${p.careerGoal}`)
  if (p.personalProfile) lines.push(`Profil / accroche : ${p.personalProfile}`)
  if (Array.isArray(p.experiences) && p.experiences.length) {
    lines.push('Expériences :')
    p.experiences.forEach((exp: any) => {
      if (exp.title || exp.company) {
        lines.push(`- ${exp.title || ''} chez ${exp.company || ''} (${exp.startDate || '?'} – ${exp.endDate || 'présent'}) : ${exp.description || ''}`)
      }
    })
  }
  if (Array.isArray(p.education) && p.education.length) {
    lines.push('Formation :')
    p.education.forEach((ed: any) => {
      if (ed.degree || ed.institution) lines.push(`- ${ed.degree || ''} — ${ed.institution || ''}`)
    })
  }
  if (Array.isArray(p.skills) && p.skills.some(Boolean)) {
    lines.push(`Compétences : ${p.skills.filter(Boolean).join(', ')}`)
  }
  if (Array.isArray(p.languages) && p.languages.length) {
    const langs = p.languages.filter((l: any) => l.language).map((l: any) => `${l.language} (${l.level || 'niveau non précisé'})`)
    if (langs.length) lines.push(`Langues : ${langs.join(', ')}`)
  }
  return lines.join('\n') || 'Aucun profil renseigné.'
}

function buildPrompt(task: GenerateTask, profile: Record<string, unknown> | undefined, context: Record<string, unknown> | undefined): { prompt: string; jsonHint: string } {
  const profileSummary = summarizeProfile(profile)
  const ctx = (context || {}) as any

  switch (task) {
    case 'cv-optimize': {
      const jsonHint = `{
  "accrocheOptimisee": "...",
  "experiencesOptimisees": [
    { "title": "...", "company": "...", "location": "...", "startDate": "...", "endDate": "...", "description": "..." }
  ]
}`
      return {
        prompt: `Tu es un agent d'optimisation de CV.

Objectif : optimiser l'accroche et les descriptions d'expériences d'un CV pour mieux correspondre à une offre d'emploi, sans inventer de faits.

Règles strictes :
- Analyse d'abord l'offre d'emploi : compétences clés, mots-clés, exigences, niveau attendu.
- Compare ensuite le profil fourni.
- Reformule l'accroche et les descriptions d'expériences pour les aligner sur l'offre.
- Ne pas inventer de faits : ne change pas les noms, dates, diplômes, employeurs, lieux réels.
- Ne pas inclure d'informations d'identité (nom, email, téléphone, adresse).

Profil candidat (sans identité) :
${profileSummary}

Offre d'emploi :
${ctx.jobOffer || 'Non fournie.'}

Réponds UNIQUEMENT avec un JSON valide au format suivant :
${jsonHint}`,
        jsonHint,
      }
    }

    case 'cover-letter': {
      const jsonHint = `{ "letter": "..." }`
      return {
        prompt: `Tu es un coach carrière expert en lettres de motivation en français.

Rédige une lettre de motivation complète (structure : accroche, motivation pour le poste, apport concret au poste en t'appuyant sur le profil, formule de politesse) sur un ton ${ctx.tone || 'professionnel et engageant'}.
Ne pas inventer de faits absents du profil. Ne pas inclure de coordonnées (elles sont déjà sur le CV joint).

Profil candidat :
${profileSummary}

Offre d'emploi visée :
${ctx.jobOffer || 'Non fournie — rédige une lettre générique adaptée au poste visé du profil.'}

Réponds UNIQUEMENT avec un JSON valide : ${jsonHint}`,
        jsonHint,
      }
    }

    case 'career-plan': {
      const jsonHint = `{
  "resume": "...",
  "etapes": [
    { "titre": "...", "periode": "...", "actions": ["...", "..."] }
  ]
}`
      return {
        prompt: `Tu es un coach carrière. Construis un plan de carrière réaliste et actionnable en français.

Profil candidat :
${profileSummary}

Objectif visé : ${ctx.goal || 'Non précisé.'}
Horizon temporel : ${ctx.timeframe || 'Non précisé.'}
Contraintes : ${ctx.constraints || 'Aucune contrainte particulière.'}

Découpe le plan en 3 à 5 étapes chronologiques concrètes (compétences à acquérir, certifications, expériences à viser, jalons mesurables). Reste réaliste par rapport au profil fourni.

Réponds UNIQUEMENT avec un JSON valide : ${jsonHint}`,
        jsonHint,
      }
    }

    case 'interview-prep': {
      const jsonHint = `{
  "questions": [
    { "question": "...", "reponseSuggeree": "..." }
  ]
}`
      return {
        prompt: `Tu es un recruteur expérimenté. À partir de l'offre d'emploi et du profil du candidat, génère 6 à 8 questions d'entretien probables (mélange de questions classiques, techniques/situationnelles liées au poste), chacune avec une suggestion de réponse structurée basée sur le profil réel du candidat (sans inventer de faits).

Profil candidat :
${profileSummary}

Offre d'emploi :
${ctx.jobOffer || 'Non fournie.'}

Réponds UNIQUEMENT avec un JSON valide : ${jsonHint}`,
        jsonHint,
      }
    }

    case 'pitch': {
      const jsonHint = `{
  "titre": "...",
  "pitchCourt": "...",
  "sections": [
    { "titre": "...", "contenu": "..." }
  ]
}`
      return {
        prompt: `Tu es un consultant en stratégie qui aide à structurer une idée en pitch clair.

Idée / projet : ${ctx.idea || 'Non précisée.'}
Marché visé : ${ctx.market || 'Non précisé.'}
Modèle économique envisagé : ${ctx.businessModel || 'Non précisé.'}

Produis un pitch structuré en français : un pitch court (2-3 phrases percutantes), puis des sections (Problème, Solution, Marché, Modèle économique, Différenciation, Prochaines étapes).

Réponds UNIQUEMENT avec un JSON valide : ${jsonHint}`,
        jsonHint,
      }
    }

    case 'linkedin': {
      const jsonHint = `{
  "titres": ["...", "...", "..."],
  "resumes": ["...", "...", "..."]
}`
      return {
        prompt: `Tu es un expert en personal branding LinkedIn. À partir du profil ci-dessous, génère 3 variantes de titre LinkedIn (accroche courte, orientée mots-clés) et 3 variantes de résumé "À propos" (150-250 mots chacune, ton professionnel mais humain), sans inventer de faits absents du profil.

Profil candidat :
${profileSummary}

Réponds UNIQUEMENT avec un JSON valide : ${jsonHint}`,
        jsonHint,
      }
    }

    default:
      throw new Error(`Tâche inconnue : ${task}`)
  }
}

const getGeminiEndpoint = (apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return sendJsonError(res, 405, 'Méthode non autorisée. Utilisez POST.')
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return sendJsonError(res, 500, 'Clé API Gemini absente. Configurez GEMINI_API_KEY dans votre fichier .env.local.')
  }

  let body: GenerateRequestBody
  try {
    body = readJsonBody(req)
  } catch (error) {
    return sendJsonError(res, 400, error instanceof Error ? error.message : 'Corps JSON invalide.')
  }

  if (!body.task) {
    return sendJsonError(res, 400, 'Le paramètre "task" est obligatoire.')
  }

  let promptData: { prompt: string; jsonHint: string }
  try {
    promptData = buildPrompt(body.task, body.profile, body.context)
  } catch (error) {
    return sendJsonError(res, 400, error instanceof Error ? error.message : 'Tâche invalide.')
  }

  try {
    const response = await fetch(getGeminiEndpoint(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: promptData.prompt }] }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let message = "Échec de l'appel au modèle IA."
      if (response.status === 429) message = 'Quota dépassé ou trop de requêtes. Réessayez plus tard.'
      else if (response.status === 401 || response.status === 403) message = 'Clé API invalide ou non autorisée.'
      else if (errorText) message = `Erreur du modèle (${response.status}) : ${errorText}`
      return sendJsonError(res, response.status >= 500 ? 502 : 400, message, errorText)
    }

    const data = await response.json()
    const rawText = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? '')
      .join('')
      .trim()

    if (!rawText) {
      return sendJsonError(res, 502, 'La réponse du modèle est vide.')
    }

    const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim()

    let parsed: unknown
    try {
      parsed = JSON.parse(cleanedText)
    } catch {
      return sendJsonError(res, 502, "La réponse du modèle n'est pas un JSON valide.")
    }

    return res.status(200).json(parsed)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return sendJsonError(res, 502, `Impossible de contacter le modèle IA : ${message}`)
  }
}
