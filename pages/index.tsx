import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Mail, Map, MessagesSquare, Rocket, Linkedin, ArrowRight } from 'lucide-react'
import { tools } from '../lib/tools'
import { loadProfile, loadToolHistory } from '../lib/profileStorage'
import { ProfileDraft, isProfileComplete } from '../lib/profileTypes'

const icons: Record<string, any> = { FileText, Mail, Map, MessagesSquare, Rocket, Linkedin }
const toolCodes: Record<string, string> = {
  cv: 'CV',
  'lettre-motivation': 'LM',
  'plan-carriere': 'PC',
  'preparation-entretien': 'EN',
  pitch: 'PI',
  linkedin: 'LK',
}

export default function Home() {
  const [profile, setProfile] = useState<ProfileDraft | null | undefined>(undefined)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [dossierRef, setDossierRef] = useState('')

  useEffect(() => {
    setProfile(loadProfile())
    const c: Record<string, number> = {}
    tools.forEach(t => {
      c[t.key] = loadToolHistory(t.key).length
    })
    setCounts(c)
    setDossierRef(`TRM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 8999)}`)
  }, [])

  const profileReady = profile ? isProfileComplete(profile) : false

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <span className="eyebrow-mono">Dossier n° {dossierRef || '········'}</span>
          <span className="font-serif text-lg font-semibold text-navy">Tremplin</span>
        </div>

        <div className="mt-6 paper-card p-8">
          <p className="eyebrow-mono">Couverture du dossier</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">
            {profile?.identity.firstName ? `Dossier de ${profile.identity.firstName} ${profile.identity.lastName}` : 'Ton dossier de candidature'}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-ink/70">
            Un seul profil, six pièces à instruire : CV, lettre de motivation, plan de carrière,
            préparation d'entretien, pitch et profil LinkedIn.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className={`stamp ${profileReady ? 'stamp-ledger' : ''}`}>
              {profileReady ? 'Profil validé' : profile ? 'Profil incomplet' : 'Profil non ouvert'}
            </span>
            <Link href="/profil" className="dossier-btn">
              {profile ? 'Modifier mon profil' : 'Ouvrir mon dossier'} <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <p className="eyebrow-mono mt-10 mb-3">Pièces du dossier</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {tools.map(tool => {
            const Icon = icons[tool.icon] || FileText
            const count = counts[tool.key] || 0
            const locked = !profileReady
            return (
              <Link key={tool.key} href={profileReady ? tool.href : '/profil'} className="group block">
                <div className="folder-tab inline-block" style={{ clipPath: 'polygon(0 0, 55% 0, 62% 100%, 0% 100%)' }}>
                  {toolCodes[tool.key]}
                </div>
                <div className="paper-card -mt-px p-5 transition-shadow group-hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-navy/5 text-navy">
                      <Icon size={18} />
                    </div>
                    <span className="eyebrow-mono !text-[0.62rem]">
                      {locked ? 'Profil requis' : count > 0 ? `${count} pièce${count > 1 ? 's' : ''}` : 'Non instruit'}
                    </span>
                  </div>
                  <h2 className="mt-4 font-serif text-lg font-semibold text-ink">{tool.name}</h2>
                  <p className="mt-1.5 text-sm leading-6 text-ink/70">{tool.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
