import { CountryKey } from './countryRules'

export type ProfileExperience = {
  id: string
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  description: string
}

export type ProfileEducation = {
  id: string
  degree: string
  institution: string
  location: string
  startDate: string
  endDate: string
}

export type ProfileLanguage = {
  id: string
  language: string
  level: string
}

// Profil unique partagé par tous les outils de Tremplin.
// Rempli une seule fois sur /profil, puis lu (jamais redemandé) par chaque outil.
export type ProfileDraft = {
  country: CountryKey
  targetJob: string
  sector: string
  careerGoal: string
  personalProfile: string
  identity: {
    firstName: string
    lastName: string
    photoDataUrl?: string
  }
  contact: {
    email: string
    phone: string
    location: string
    linkedin: string
    portfolio: string
  }
  experiences: ProfileExperience[]
  education: ProfileEducation[]
  skills: string[]
  languages: ProfileLanguage[]
  interests: string
}

export const emptyProfile: ProfileDraft = {
  country: 'France',
  targetJob: '',
  sector: '',
  careerGoal: '',
  personalProfile: '',
  identity: {
    firstName: '',
    lastName: '',
    photoDataUrl: undefined,
  },
  contact: {
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
  },
  experiences: [
    {
      id: 'exp-1',
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
    },
  ],
  skills: ['', ''],
  languages: [
    {
      id: 'lang-1',
      language: '',
      level: '',
    },
  ],
  interests: '',
}

export function isProfileComplete(profile: ProfileDraft): boolean {
  return Boolean(
    profile.identity.firstName &&
    profile.identity.lastName &&
    profile.contact.email &&
    profile.experiences.some(e => e.title || e.company)
  )
}
