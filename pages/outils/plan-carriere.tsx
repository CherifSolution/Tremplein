import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageShell } from '../../components/PageShell'
import { ProfileDraft } from '../../lib/profileTypes'
import { loadProfile, pushToolHistory } from '../../lib/profileStorage'
import { generate } from '../../lib/generateClient'
import { exportPdfDocument } from '../../lib/pdfExport'
import { createSimpleDocument } from '../../lib/simpleDocument'
import { Download, Sparkles, Milestone } from 'lucide-react'

type PlanResult = {
  resume: string
  etapes: Array<{ titre: string; periode: string; actions: string[] }>
}

export default function PlanCarriere() {
  const [profile, setProfile] = useState<ProfileDraft | null>(null)
  const [goal, setGoal] = useState('')
  const [timeframe, setTimeframe] = useState('3 ans')
  const [constraints, setConstraints] = useState('')
  const [plan, setPlan] = useState<PlanResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const p = loadProfile()
    setProfile(p)
    if (p?.careerGoal) setGoal(p.careerGoal)
  }, [])

  if (!profile) {
    return (
      <PageShell title="Plan de carrière">
        <p className="text-ink/70">Aucun profil trouvé. <Link href="/profil" className="underline">Complète ton profil</Link> pour générer un plan.</p>
      </PageShell>
    )
  }

  const handleGenerate = async () => {
    if (!goal.trim()) {
      setError('Décris ton objectif pour générer un plan.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await generate<PlanResult>('career-plan', profile, { goal, timeframe, constraints })
      setPlan(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!plan) return
    const doc = createSimpleDocument({
      eyebrow: 'Plan de carrière',
      title: goal,
      intro: plan.resume,
      sections: plan.etapes.map(e => ({ heading: `${e.titre} — ${e.periode}`, bullets: e.actions })),
    })
    await exportPdfDocument(doc, 'Plan_de_carriere.pdf')
    pushToolHistory('plan-carriere', { date: new Date().toISOString(), goal })
  }

  return (
    <PageShell title="Plan de carrière" subtitle="Une feuille de route concrète vers ton objectif.">
      <div className="space-y-6">
        <section className="paper-card p-6 space-y-4">
          <div>
            <label className="field-label">Objectif visé</label>
            <input
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="Ex. Devenir chef de produit dans une entreprise tech"
              className="field-line mt-2"
            />
          </div>
          <div>
            <label className="field-label">Horizon temporel</label>
            <input value={timeframe} onChange={e => setTimeframe(e.target.value)} className="field-line mt-2" />
          </div>
          <div>
            <label className="field-label">Contraintes (optionnel)</label>
            <textarea
              value={constraints}
              onChange={e => setConstraints(e.target.value)}
              rows={3}
              placeholder="Ex. Rester dans la même ville, budget formation limité..."
              className="field-line mt-2"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="dossier-btn"
          >
            <Sparkles size={15} /> {loading ? 'Construction du plan...' : 'Générer mon plan'}
          </button>
          {error && <p className="text-sm text-stamp">{error}</p>}
        </section>

        {plan && (
          <section className="paper-card p-6">
            <p className="text-sm text-ink/80">{plan.resume}</p>
            <div className="mt-5 space-y-4">
              {plan.etapes.map((etape, i) => (
                <div key={i} className="border border-paper-line/70 bg-white/40 p-4">
                  <div className="flex items-center gap-2">
                    <Milestone size={15} className="text-navy/60" />
                    <p className="font-semibold text-navy">{etape.titre}</p>
                    <span className="text-xs text-navy/60 ml-auto">{etape.periode}</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {etape.actions.map((a, j) => (
                      <li key={j} className="text-sm text-ink/80">• {a}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button
              onClick={handleDownload}
              className="dossier-btn mt-5"
            >
              <Download size={16} /> Télécharger en PDF
            </button>
          </section>
        )}
      </div>
    </PageShell>
  )
}
