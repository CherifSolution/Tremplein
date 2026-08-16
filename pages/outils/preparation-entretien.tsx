import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageShell } from '../../components/PageShell'
import { ProfileDraft } from '../../lib/profileTypes'
import { loadProfile, pushToolHistory } from '../../lib/profileStorage'
import { generate } from '../../lib/generateClient'
import { Sparkles, ChevronDown } from 'lucide-react'

type PrepResult = { questions: Array<{ question: string; reponseSuggeree: string }> }

export default function PreparationEntretien() {
  const [profile, setProfile] = useState<ProfileDraft | null>(null)
  const [jobOffer, setJobOffer] = useState('')
  const [result, setResult] = useState<PrepResult | null>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setProfile(loadProfile())
  }, [])

  if (!profile) {
    return (
      <PageShell title="Préparation d'entretien">
        <p className="text-ink/70">Aucun profil trouvé. <Link href="/profil" className="underline">Complète ton profil</Link> pour te préparer.</p>
      </PageShell>
    )
  }

  const handleGenerate = async () => {
    if (!jobOffer.trim()) {
      setError("Colle l'offre d'emploi pour préparer ton entretien.")
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await generate<PrepResult>('interview-prep', profile, { jobOffer })
      setResult(data)
      pushToolHistory('preparation-entretien', { date: new Date().toISOString() })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell title="Préparation d'entretien" subtitle="Questions probables et pistes de réponse, basées sur ton profil.">
      <div className="space-y-6">
        <section className="paper-card p-6">
          <label className="field-label">Offre d'emploi</label>
          <textarea
            value={jobOffer}
            onChange={e => setJobOffer(e.target.value)}
            rows={6}
            placeholder="Colle ici l'offre d'emploi visée"
            className="field-line mt-2"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="dossier-btn mt-4"
          >
            <Sparkles size={15} /> {loading ? 'Préparation en cours...' : 'Générer les questions'}
          </button>
          {error && <p className="mt-2 text-sm text-stamp">{error}</p>}
        </section>

        {result && (
          <section className="space-y-3">
            {result.questions.map((q, i) => (
              <div key={i} className="border border-paper-line/70 bg-paper-card overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <p className="font-serif text-sm font-semibold text-navy">{q.question}</p>
                  <ChevronDown size={16} className={`shrink-0 text-navy/50 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
                </button>
                {openIndex === i && (
                  <div className="px-5 pb-4 text-sm leading-relaxed text-ink/70 border-t border-paper-line/60 pt-3">
                    {q.reponseSuggeree}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </PageShell>
  )
}
