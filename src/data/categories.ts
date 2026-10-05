export type Category = {
  name: string
  symbol: string
  tone: 'rose' | 'sand' | 'sage' | 'clay'
}

export const categories: Category[] = [
  { name: 'Addictions', symbol: '♡', tone: 'rose' },
  { name: 'Parentalité à distance', symbol: '❀', tone: 'rose' },
  { name: 'Deuil', symbol: '☼', tone: 'sand' },
  { name: 'Violences', symbol: '☾', tone: 'clay' },
  { name: 'Anxiété / Dépression', symbol: '♧', tone: 'sage' },
  { name: 'Travail / Burn-out', symbol: '✦', tone: 'clay' },
  { name: 'Projets de vie (expatriation)', symbol: '◎', tone: 'sand' },
  { name: 'Conflits familiaux / Séparation conjugale', symbol: '♢', tone: 'sage' },
]
