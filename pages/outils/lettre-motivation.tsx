import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageShell } from '../../components/PageShell'
import { ProfileDraft } from '../../lib/profileTypes'
import { loadProfile, pushToolHistory } from '../../lib/profileStorage'
import { generate } from '../../lib/generateClient'
import { exportPdfDocument } from '../../lib/pdfExport'
import { createSimpleDocument } from '../../lib/simpleDocument'
import { Download, Sparkles } from 'lucide-react'

type LetterResult = { letter: string }

const tones = ['Professionnel et engageant', 'Formel', 'Direct et confiant', 'Chaleureux']

export default function LettreMotivation() {
  const [profile, setProfile] = useState<ProfileDraft | null>(null)
  const [jobOffer, setJobOffer] = useState('')
  const [tone, setTone] = useState(tones[0])
  const [letter, setLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setProfile(loadProfile())
  }, [])

  if (!profile) {
    return (
      <PageShell title="Lettre de motivation">
        <p className="text-ink/70">Aucun profil trouvé. <Link href="/profil" className="underline">Complète ton profil</Link> pour générer une lettre.</p>
      </PageShell>
    )
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await generate<LetterResult>('cover-letter', profile, { jobOffer, tone })
      setLetter(data.letter)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    const doc = createSimpleDocument({
      eyebrow: 'Lettre de motivation',
      title: `${profile.identity.firstName} ${profile.identity.lastName}`.trim() || 'Lettre de motivation',
      sections: [{ heading: '', paragraphs: letter.split('\n').filter(Boolean) }],
    })
    await exportPdfDocument(doc, 'Lettre_de_motivation.pdf')
    pushToolHistory('lettre-motivation', { date: new Date().toISOString() })
  }

  return (
    <PageShell title="Lettre de motivation" subtitle="Générée à partir de ton profil et de l'offre visée.">
      <div className="space-y-6">
        <section className="paper-card p-6">
          <label className="field-label">Offre d'emploi</label>
          <textarea
            value={jobOffer}
            onChange={e => setJobOffer(e.target.value)}
            rows={6}
            placeholder="Colle ici l'offre d'emploi (ou décris le poste)"
            className="field-line mt-2"
          />
          <label className="field-label mt-4">Ton</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {tones.map(t => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${tone === t ? 'bg-navy text-paper-card' : 'bg-manila/30 text-ink/70'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="dossier-btn mt-5"
          >
            <Sparkles size={15} /> {loading ? 'Rédaction en cours...' : 'Générer la lettre'}
          </button>
          {error && <p className="mt-2 text-sm text-stamp">{error}</p>}
        </section>

        {letter && (
          <section className="paper-card p-6">
            <textarea
              value={letter}
              onChange={e => setLetter(e.target.value)}
              rows={16}
              className="field-line"
            />
            <button
              onClick={handleDownload}
              className="dossier-btn mt-4"
            >
              <Download size={16} /> Télécharger en PDF
            </button>
          </section>
        )}
      </div>
    </PageShell>
  )
}
