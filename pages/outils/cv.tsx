import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageShell } from '../../components/PageShell'
import { CVPreview } from '../../components/CVPreview'
import { countryRules } from '../../lib/countryRules'
import { cvModels, cvPalettes, PaletteKey, TemplateKey } from '../../lib/cvTemplates'
import { ProfileDraft, ProfileExperience } from '../../lib/profileTypes'
import { loadProfile, pushToolHistory, saveProfile } from '../../lib/profileStorage'
import { exportPdfDocument } from '../../lib/pdfExport'
import { generate } from '../../lib/generateClient'
import { Sparkles, Download } from 'lucide-react'

type OptimizeResult = { accrocheOptimisee: string; experiencesOptimisees: Array<Partial<ProfileExperience>> }

export default function CvTool() {
  const [profile, setProfile] = useState<ProfileDraft | null>(null)
  const [template, setTemplate] = useState<TemplateKey>('classique')
  const [palette, setPalette] = useState<PaletteKey>('bleu')
  const [jobOffer, setJobOffer] = useState('')
  const [optimizing, setOptimizing] = useState(false)
  const [optimizeError, setOptimizeError] = useState('')
  const [preview, setPreview] = useState<OptimizeResult | null>(null)

  useEffect(() => {
    setProfile(loadProfile())
  }, [])

  useEffect(() => {
    if (profile) saveProfile(profile)
  }, [profile])

  if (!profile) {
    return (
      <PageShell title="CV">
        <p className="text-ink/70">Aucun profil trouvé. <Link href="/profil" className="underline">Complète ton profil</Link> pour générer un CV.</p>
      </PageShell>
    )
  }

  const countryRule = countryRules[profile.country] ?? countryRules.France

  const handleOptimize = async () => {
    if (!jobOffer.trim()) {
      setOptimizeError("Colle une offre d'emploi pour optimiser ton CV.")
      return
    }
    setOptimizing(true)
    setOptimizeError('')
    setPreview(null)
    try {
      const data = await generate<OptimizeResult>('cv-optimize', profile, { jobOffer })
      setPreview(data)
    } catch (err) {
      setOptimizeError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setOptimizing(false)
    }
  }

  const acceptOptimization = () => {
    if (!preview) return
    setProfile(prev => prev && ({
      ...prev,
      personalProfile: preview.accrocheOptimisee,
      experiences: preview.experiencesOptimisees.map((exp, i) => ({
        id: prev.experiences[i]?.id ?? `exp-${i}`,
        title: exp.title || '',
        company: exp.company || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        description: exp.description || '',
      })),
    }))
    setPreview(null)
  }

  const sanitize = (v: string) => v.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-zA-Z0-9_-]/g, '_')

  const handleDownload = async () => {
    const fileName = `CV_${sanitize(profile.identity.firstName || 'Prenom')}_${sanitize(profile.identity.lastName || 'Nom')}.pdf`
    const { createPdfDocument } = await import('../../lib/pdfDocument')
    const doc = createPdfDocument(profile, countryRule, palette)
    await exportPdfDocument(doc, fileName)
    pushToolHistory('cv', { date: new Date().toISOString(), template, palette })
  }

  return (
    <PageShell title="CV" subtitle={`Basé sur ton profil, adapté aux usages ${countryRule.name}.`} backHref="/" wide>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <section className="paper-card p-6">
            <h2 className="font-serif text-sm font-semibold text-navy">Style</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {cvModels.map(m => (
                <button
                  key={m.key}
                  onClick={() => setTemplate(m.key)}
                  className={`border px-3 py-2 text-sm font-medium text-left ${template === m.key ? 'border-navy bg-navy text-paper-card' : 'border-paper-line text-ink/70'}`}
                >
                  {m.name}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.keys(cvPalettes) as PaletteKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => setPalette(key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${palette === key ? cvPalettes[key].accent : 'bg-manila/30 text-ink/70'}`}
                >
                  {cvPalettes[key].label}
                </button>
              ))}
            </div>
          </section>

          <section className="paper-card p-6">
            <h2 className="font-serif text-sm font-semibold text-navy flex items-center gap-1.5"><Sparkles size={15} /> Optimiser pour une offre</h2>
            <textarea
              value={jobOffer}
              onChange={e => setJobOffer(e.target.value)}
              rows={5}
              placeholder="Colle ici l'offre d'emploi visée"
              className="field-line mt-3"
            />
            <button
              onClick={handleOptimize}
              disabled={optimizing}
              className="dossier-btn mt-3"
            >
              {optimizing ? 'Optimisation en cours...' : 'Optimiser mon CV'}
            </button>
            {optimizeError && <p className="mt-2 text-sm text-stamp">{optimizeError}</p>}

            {preview && (
              <div className="mt-4 border border-paper-line/70 bg-white/50 p-4">
                <p className="eyebrow-mono">Aperçu de l'accroche optimisée</p>
                <p className="mt-1 text-sm text-ink/80">{preview.accrocheOptimisee}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={acceptOptimization} className="dossier-btn">Appliquer</button>
                  <button onClick={() => setPreview(null)} className="dossier-btn-ghost">Ignorer</button>
                </div>
              </div>
            )}
          </section>

          <button
            onClick={handleDownload}
            className="dossier-btn w-full"
          >
            <Download size={16} /> Télécharger le CV en PDF
          </button>
        </div>

        <div>
          <CVPreview draft={profile} countryRule={countryRule} template={template} palette={palette} />
        </div>
      </div>
    </PageShell>
  )
}
