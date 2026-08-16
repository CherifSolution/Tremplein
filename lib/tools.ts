export type ToolKey =
  | 'cv'
  | 'lettre-motivation'
  | 'plan-carriere'
  | 'preparation-entretien'
  | 'pitch'
  | 'linkedin'

export type ToolMeta = {
  key: ToolKey
  name: string
  description: string
  href: string
  icon: string // nom d'icône lucide-react
  producesPdf: boolean
}

export const tools: ToolMeta[] = [
  {
    key: 'cv',
    name: 'CV',
    description: 'Génère un CV adapté au pays visé, en plusieurs modèles et couleurs.',
    href: '/outils/cv',
    icon: 'FileText',
    producesPdf: true,
  },
  {
    key: 'lettre-motivation',
    name: 'Lettre de motivation',
    description: "Rédige une lettre personnalisée à partir d'une offre d'emploi.",
    href: '/outils/lettre-motivation',
    icon: 'Mail',
    producesPdf: true,
  },
  {
    key: 'plan-carriere',
    name: 'Plan de carrière',
    description: 'Construit une feuille de route étape par étape vers ton objectif.',
    href: '/outils/plan-carriere',
    icon: 'Map',
    producesPdf: true,
  },
  {
    key: 'preparation-entretien',
    name: "Préparation d'entretien",
    description: "Anticipe les questions probables d'une offre et prépare tes réponses.",
    href: '/outils/preparation-entretien',
    icon: 'MessagesSquare',
    producesPdf: false,
  },
  {
    key: 'pitch',
    name: 'Pitch / business plan',
    description: 'Structure une idée en pitch clair ou mini business plan.',
    href: '/outils/pitch',
    icon: 'Rocket',
    producesPdf: true,
  },
  {
    key: 'linkedin',
    name: 'Profil LinkedIn',
    description: 'Génère titre et résumé optimisés à partir de ton profil.',
    href: '/outils/linkedin',
    icon: 'Linkedin',
    producesPdf: false,
  },
]
