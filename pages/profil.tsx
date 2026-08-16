import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { PageShell } from '../components/PageShell'
import { StepWizard } from '../components/StepWizard'
import { countryRules, CountryKey } from '../lib/countryRules'
import { ProfileDraft, ProfileEducation, ProfileExperience, ProfileLanguage, emptyProfile } from '../lib/profileTypes'
import { loadProfile, saveProfile } from '../lib/profileStorage'

const steps = ['Identité & contact', 'Parcours', 'Objectif professionnel']

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`

const inputClass = 'field-line mt-1'
const labelClass = 'field-label'

export default function Profil() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<ProfileDraft>(emptyProfile)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const existing = loadProfile()
    if (existing) setProfile(existing)
  }, [])

  const patch = (p: Partial<ProfileDraft>) => setProfile(prev => ({ ...prev, ...p }))

  const updateExperience = (id: string, p: Partial<ProfileExperience>) =>
    setProfile(prev => ({ ...prev, experiences: prev.experiences.map(e => (e.id === id ? { ...e, ...p } : e)) }))
  const addExperience = () =>
    setProfile(prev => ({ ...prev, experiences: [...prev.experiences, { id: createId('exp'), title: '', company: '', location: '', startDate: '', endDate: '', description: '' }] }))
  const removeExperience = (id: string) => setProfile(prev => ({ ...prev, experiences: prev.experiences.filter(e => e.id !== id) }))

  const updateEducation = (id: string, p: Partial<ProfileEducation>) =>
    setProfile(prev => ({ ...prev, education: prev.education.map(e => (e.id === id ? { ...e, ...p } : e)) }))
  const addEducation = () =>
    setProfile(prev => ({ ...prev, education: [...prev.education, { id: createId('edu'), degree: '', institution: '', location: '', startDate: '', endDate: '' }] }))
  const removeEducation = (id: string) => setProfile(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }))

  const updateLanguage = (id: string, p: Partial<ProfileLanguage>) =>
    setProfile(prev => ({ ...prev, languages: prev.languages.map(l => (l.id === id ? { ...l, ...p } : l)) }))
  const addLanguage = () => setProfile(prev => ({ ...prev, languages: [...prev.languages, { id: createId('lang'), language: '', level: '' }] }))
  const removeLanguage = (id: string) => setProfile(prev => ({ ...prev, languages: prev.languages.filter(l => l.id !== id) }))

  const updateSkill = (index: number, value: string) =>
    setProfile(prev => ({ ...prev, skills: prev.skills.map((s, i) => (i === index ? value : s)) }))
  const addSkill = () => setProfile(prev => ({ ...prev, skills: [...prev.skills, ''] }))
  const removeSkill = (index: number) => setProfile(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }))

  const handleSave = () => {
    saveProfile(profile)
    setSaved(true)
    setTimeout(() => router.push('/'), 600)
  }

  const canGoNext = step < steps.length ? true : Boolean(profile.identity.firstName && profile.contact.email)

  return (
    <PageShell title="Ton profil" subtitle="Rempli une seule fois, il alimente tous les outils de Tremplin.">
      <StepWizard
        steps={steps}
        currentStep={step}
        onStepChange={setStep}
        onPrevious={() => setStep(s => Math.max(1, s - 1))}
        onNext={() => (step === steps.length ? handleSave() : setStep(s => s + 1))}
        canGoNext={canGoNext}
        isLastStep={step === steps.length}
        nextLabel={step === steps.length ? (saved ? 'Enregistré ✓' : 'Enregistrer le profil') : undefined}
      >
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Prénom</label>
                <input className={inputClass} value={profile.identity.firstName} onChange={e => patch({ identity: { ...profile.identity, firstName: e.target.value } })} />
              </div>
              <div>
                <label className={labelClass}>Nom</label>
                <input className={inputClass} value={profile.identity.lastName} onChange={e => patch({ identity: { ...profile.identity, lastName: e.target.value } })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Email</label>
                <input className={inputClass} value={profile.contact.email} onChange={e => patch({ contact: { ...profile.contact, email: e.target.value } })} />
              </div>
              <div>
                <label className={labelClass}>Téléphone</label>
                <input className={inputClass} value={profile.contact.phone} onChange={e => patch({ contact: { ...profile.contact, phone: e.target.value } })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Ville / Pays</label>
                <input className={inputClass} value={profile.contact.location} onChange={e => patch({ contact: { ...profile.contact, location: e.target.value } })} />
              </div>
              <div>
                <label className={labelClass}>Pays de référence pour tes documents</label>
                <select className={inputClass} value={profile.country} onChange={e => patch({ country: e.target.value as CountryKey })}>
                  {Object.values(countryRules).map(rule => (
                    <option key={rule.countryKey} value={rule.countryKey}>{rule.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>LinkedIn (optionnel)</label>
                <input className={inputClass} value={profile.contact.linkedin} onChange={e => patch({ contact: { ...profile.contact, linkedin: e.target.value } })} />
              </div>
              <div>
                <label className={labelClass}>Portfolio (optionnel)</label>
                <input className={inputClass} value={profile.contact.portfolio} onChange={e => patch({ contact: { ...profile.contact, portfolio: e.target.value } })} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Photo (optionnel)</label>
              <input
                type="file"
                accept="image/*"
                className="mt-2 block w-full text-sm text-ink/80"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  if (file.size > 2 * 1024 * 1024) {
                    alert('Photo trop lourde (max 2 Mo).')
                    return
                  }
                  const reader = new FileReader()
                  reader.onload = () => {
                    if (typeof reader.result === 'string') patch({ identity: { ...profile.identity, photoDataUrl: reader.result } })
                  }
                  reader.readAsDataURL(file)
                }}
              />
              {profile.identity.photoDataUrl && (
                <img src={profile.identity.photoDataUrl} alt="Aperçu" className="mt-3 h-20 w-20 rounded-full object-cover border-2 border-manila" />
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-semibold text-navy">Expériences</h3>
                <button type="button" onClick={addExperience} className="eyebrow-mono hover:text-navy">+ Ajouter</button>
              </div>
              <div className="mt-3 space-y-4">
                {profile.experiences.map(exp => (
                  <div key={exp.id} className="border border-paper-line/70 bg-white/40 p-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input className={inputClass} placeholder="Intitulé du poste" value={exp.title} onChange={e => updateExperience(exp.id, { title: e.target.value })} />
                      <input className={inputClass} placeholder="Entreprise" value={exp.company} onChange={e => updateExperience(exp.id, { company: e.target.value })} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <input className={inputClass} placeholder="Lieu" value={exp.location} onChange={e => updateExperience(exp.id, { location: e.target.value })} />
                      <input className={inputClass} placeholder="Début (ex. 2022)" value={exp.startDate} onChange={e => updateExperience(exp.id, { startDate: e.target.value })} />
                      <input className={inputClass} placeholder="Fin (ou vide si actuel)" value={exp.endDate} onChange={e => updateExperience(exp.id, { endDate: e.target.value })} />
                    </div>
                    <textarea className={inputClass} rows={3} placeholder="Missions, réalisations, résultats" value={exp.description} onChange={e => updateExperience(exp.id, { description: e.target.value })} />
                    {profile.experiences.length > 1 && (
                      <button type="button" onClick={() => removeExperience(exp.id)} className="text-xs font-medium text-stamp">Retirer cette expérience</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-semibold text-navy">Formation</h3>
                <button type="button" onClick={addEducation} className="eyebrow-mono hover:text-navy">+ Ajouter</button>
              </div>
              <div className="mt-3 space-y-4">
                {profile.education.map(ed => (
                  <div key={ed.id} className="border border-paper-line/70 bg-white/40 p-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input className={inputClass} placeholder="Diplôme" value={ed.degree} onChange={e => updateEducation(ed.id, { degree: e.target.value })} />
                      <input className={inputClass} placeholder="Établissement" value={ed.institution} onChange={e => updateEducation(ed.id, { institution: e.target.value })} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <input className={inputClass} placeholder="Lieu" value={ed.location} onChange={e => updateEducation(ed.id, { location: e.target.value })} />
                      <input className={inputClass} placeholder="Début" value={ed.startDate} onChange={e => updateEducation(ed.id, { startDate: e.target.value })} />
                      <input className={inputClass} placeholder="Fin" value={ed.endDate} onChange={e => updateEducation(ed.id, { endDate: e.target.value })} />
                    </div>
                    {profile.education.length > 1 && (
                      <button type="button" onClick={() => removeEducation(ed.id)} className="text-xs font-medium text-stamp">Retirer</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-semibold text-navy">Compétences</h3>
                <button type="button" onClick={addSkill} className="eyebrow-mono hover:text-navy">+ Ajouter</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <input className="field-line w-auto min-w-[10rem]" placeholder="Compétence" value={skill} onChange={e => updateSkill(index, e.target.value)} />
                    <button type="button" onClick={() => removeSkill(index)} className="text-xs text-stamp">✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-semibold text-navy">Langues</h3>
                <button type="button" onClick={addLanguage} className="eyebrow-mono hover:text-navy">+ Ajouter</button>
              </div>
              <div className="mt-3 space-y-2">
                {profile.languages.map(lang => (
                  <div key={lang.id} className="flex items-center gap-2">
                    <input className={inputClass} placeholder="Langue" value={lang.language} onChange={e => updateLanguage(lang.id, { language: e.target.value })} />
                    <input className={inputClass} placeholder="Niveau" value={lang.level} onChange={e => updateLanguage(lang.id, { level: e.target.value })} />
                    <button type="button" onClick={() => removeLanguage(lang.id)} className="text-xs text-stamp shrink-0">✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Centres d'intérêt</label>
              <textarea className={inputClass} rows={2} value={profile.interests} onChange={e => patch({ interests: e.target.value })} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Poste / métier visé</label>
              <input className={inputClass} placeholder="Ex. Chef de projet digital" value={profile.targetJob} onChange={e => patch({ targetJob: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Secteur visé</label>
              <input className={inputClass} placeholder="Ex. Marketing digital, Finance, Santé..." value={profile.sector} onChange={e => patch({ sector: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Objectif professionnel (1 à 5 ans)</label>
              <textarea className={inputClass} rows={3} placeholder="Ex. Devenir chef de produit dans une entreprise tech en 3 ans" value={profile.careerGoal} onChange={e => patch({ careerGoal: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Profil professionnel / accroche</label>
              <textarea className={inputClass} rows={4} placeholder="Je suis un professionnel spécialisé en..." value={profile.personalProfile} onChange={e => patch({ personalProfile: e.target.value })} />
            </div>
            <p className="text-xs text-ink/50">Ce profil sera utilisé par tous les outils (CV, lettre, plan de carrière, entretien, pitch, LinkedIn) — tu n'auras plus à ressaisir ces informations.</p>
          </div>
        )}
      </StepWizard>
    </PageShell>
  )
}
