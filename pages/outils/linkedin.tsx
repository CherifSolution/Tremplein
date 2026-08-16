import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageShell } from '../../components/PageShell'
import { ProfileDraft } from '../../lib/profileTypes'
import { loadProfile, pushToolHistory } from '../../lib/profileStorage'
import { generate } from '../../lib/generateClient'
import { Sparkles, Copy, Check } from 'lucide-react'

type LinkedinResult = { titres: string[]; resumes: string[] }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="inline-flex items-center gap-1 text-xs font-semibold text-navy/70 hover:text-navy"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copié' : 'Copier'}
    </button>
  )
}

export default function Linkedin() {
  const [profile, setProfile] = useState<ProfileDraft | null>(null)
  const [result, setResult] = useState<LinkedinResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setProfile(loadProfile())
  }, [])

  if (!profile) {
    return (
      <PageShell title="Profil LinkedIn">
        <p className="text-ink/70">Aucun profil trouvé. <Link href="/profil" className="underline">Complète ton profil</Link> pour générer des variantes.</p>
      </PageShell>
    )
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await generate<LinkedinResult>('linkedin', profile, {})
      setResult(data)
      pushToolHistory('linkedin', { date: new Date().toISOString() })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell title="Profil LinkedIn" subtitle="Titre et résumé générés à partir de ton profil, prêts à copier.">
      <div className="space-y-6">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="dossier-btn"
        >
          <Sparkles size={15} /> {loading ? 'Génération en cours...' : 'Générer mes variantes'}
        </button>
        {error && <p className="text-sm text-stamp">{error}</p>}

        {result && (
          <>
            <section className="paper-card p-6">
              <h2 className="font-serif text-sm font-semibold text-navy">Titres</h2>
              <div className="mt-3 space-y-3">
                {result.titres.map((t, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 border border-paper-line/70 bg-white/40 px-4 py-2.5">
                    <p className="text-sm text-ink">{t}</p>
                    <CopyButton text={t} />
                  </div>
                ))}
              </div>
            </section>

            <section className="paper-card p-6">
              <h2 className="font-serif text-sm font-semibold text-navy">Résumés "À propos"</h2>
              <div className="mt-3 space-y-4">
                {result.resumes.map((r, i) => (
                  <div key={i} className="border border-paper-line/70 bg-white/40 p-4">
                    <div className="flex items-center justify-between">
                      <p className="eyebrow-mono">Variante {i + 1}</p>
                      <CopyButton text={r} />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink/80 whitespace-pre-wrap">{r}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </PageShell>
  )
}
