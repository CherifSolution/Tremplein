import Link from 'next/link'
import { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'

type PageShellProps = {
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  dossierRef?: string
  children: ReactNode
  wide?: boolean
}

export function PageShell({ title, subtitle, backHref = '/', backLabel = "Retour au dossier", dossierRef, children, wide }: PageShellProps) {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className={`mx-auto ${wide ? 'max-w-5xl' : 'max-w-2xl'}`}>
        <div className="flex items-center justify-between">
          <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-navy-light transition-colors">
            <ArrowLeft size={15} /> {backLabel}
          </Link>
          {dossierRef && <span className="eyebrow-mono">Réf. {dossierRef}</span>}
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-ink/70">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </main>
  )
}
