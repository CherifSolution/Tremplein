import { countryRules, CountryKey } from './countryRules'
import { ProfileDraft, emptyProfile } from './profileTypes'

const STORAGE_KEY = 'tremplin_profile'

const normalizeCountry = (raw: any): CountryKey => {
  if (raw && countryRules[raw as CountryKey]) return raw as CountryKey
  return 'France'
}

function buildProfile(raw: any): ProfileDraft {
  if (!raw || typeof raw !== 'object') return emptyProfile
  return {
    ...emptyProfile,
    ...raw,
    country: normalizeCountry(raw.country),
    identity: { ...emptyProfile.identity, ...(raw.identity || {}) },
    contact: { ...emptyProfile.contact, ...(raw.contact || {}) },
    experiences: Array.isArray(raw.experiences) && raw.experiences.length ? raw.experiences : emptyProfile.experiences,
    education: Array.isArray(raw.education) && raw.education.length ? raw.education : emptyProfile.education,
    skills: Array.isArray(raw.skills) ? raw.skills : emptyProfile.skills,
    languages: Array.isArray(raw.languages) && raw.languages.length ? raw.languages : emptyProfile.languages,
  }
}

export function loadProfile(): ProfileDraft | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return buildProfile(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveProfile(profile: ProfileDraft) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

// Chaque outil garde son propre historique de générations sous sa propre clé,
// pour ne jamais mélanger les documents entre outils.
export function loadToolHistory<T>(toolKey: string): T[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(`tremplin_history_${toolKey}`)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function pushToolHistory<T>(toolKey: string, entry: T, max = 10) {
  if (typeof window === 'undefined') return
  const current = loadToolHistory<T>(toolKey)
  const next = [entry, ...current].slice(0, max)
  window.localStorage.setItem(`tremplin_history_${toolKey}`, JSON.stringify(next))
}
