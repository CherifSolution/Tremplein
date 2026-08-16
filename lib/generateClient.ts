import { GenerateTask } from '../pages/api/generate'
import { ProfileDraft } from './profileTypes'

export async function generate<T>(task: GenerateTask, profile: ProfileDraft, context: Record<string, unknown>): Promise<T> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, profile, context }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error || 'Une erreur inconnue est survenue.')
  }

  return data as T
}
