export type CountryKey = 'France' | 'International'

export type CountryRule = {
  name: string
  countryKey: CountryKey
  showPhoto: boolean
  recommendedPages: string
  sections: string[]
}

export const countryRules: Record<CountryKey, CountryRule> = {
  France: {
    name: 'France',
    countryKey: 'France',
    showPhoto: true,
    recommendedPages: '1 à 2 pages',
    sections: ['Coordonnées', 'Profil', 'Expériences', 'Formation', 'Compétences', 'Langues', "Centres d'intérêt"],
  },
  International: {
    name: 'International',
    countryKey: 'International',
    showPhoto: false,
    recommendedPages: '1 à 2 pages',
    sections: ['Coordonnées', 'Profil', 'Expériences', 'Formation', 'Compétences', 'Langues', "Centres d'intérêt"],
  },
}
