import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageShell } from '../../components/PageShell'
import { ProfileDraft } from '../../lib/profileTypes'
import { loadProfile, pushToolHistory } from '../../lib/profileStorage'
import { generate } from '../../lib/generateClient'
import { exportPdfDocument } from '../../lib/pdfExport'
import { createSimpleDocument } from '../../lib/simpleDocument'
import { Download, Sparkles } from 'lucide-react'

type PitchResult = {
  titre: string
  pitchCourt: string
  sections: Array<{ titre: string; contenu: string }>
}

export default function Pitch() {
  const [profile, setProfile] = useState<ProfileDraft | null>(null)
  const [idea, setIdea] = useState('')
  const [market, setMarket] = useState('')
  const [businessModel, setBusinessModel] = useState('')
  const [result, setResult] = useState<PitchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setProfile(loadProfile())
  }, [])

  if (!profile) {
    return (
      <PageShell title="Pitch / business plan">
        <p className="text-ink/70">Aucun profil trouvé. <Link href="/profil" className="underline">Complète ton profil</Link> pour continuer.</p>
      </PageShell>
    )
  }

  const handleGenerate = async () => {
    if (!idea.trim()) {
      setError('Décris ton idée pour générer un pitch.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await generate<PitchResult>('pitch', profile, { idea, market, businessModel })
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!result) return
    const doc = createSimpleDocument({
      eyebrow: 'Pitch',
      title: result.titre,
      intro: result.pitchCourt,
      sections: result.sections.map(s => ({ heading: s.titre, paragraphs: [s.contenu] })),
    })
    await exportPdfDocument(doc, 'Pitch.pdf')
    pushToolHistory('pitch', { date: new Date().toISOString(), idea })
  }

  return (
    <PageShell title="Pitch / business plan" subtitle="Structure une idée en pitch clair et convaincant.">
      <div className="space-y-6">
        <section className="paper-card p-6 space-y-4">
          <div>
            <label className="field-label">Ton idée / projet</label>
            <textarea value={idea} onChange={e => setIdea(e.target.value)} rows={3} className="field-line mt-2" />
          </div>
          <div>
            <label className="field-label">Marché visé (optionnel)</label>
            <input value={market} onChange={e => setMarket(e.target.value)} className="field-line mt-2" />
          </div>
          <div>
            <label className="field-label">Modèle économique envisagé (optionnel)</label>
            <input value={businessModel} onChange={e => setBusinessModel(e.target.value)} className="field-line mt-2" />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="dossier-btn"
          >
            <Sparkles size={15} /> {loading ? 'Structuration en cours...' : 'Générer le pitch'}
          </button>
          {error && <p className="text-sm text-stamp">{error}</p>}
        </section>

        {result && (
          <section className="paper-card p-6">
            <h2 className="font-serif text-lg font-semibold text-navy">{result.titre}</h2>
            <p className="mt-2 text-sm italic text-ink/60">{result.pitchCourt}</p>
            <div className="mt-5 space-y-4">
              {result.sections.map((s, i) => (
                <div key={i}>
                  <p className="font-serif text-sm font-semibold text-navy">{s.titre}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink/80">{s.contenu}</p>
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
