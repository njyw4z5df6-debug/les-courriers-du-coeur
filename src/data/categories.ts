export type Category = {
  name: string
  symbol: string
  tone: 'rose' | 'sand' | 'sage' | 'clay'
}

export const categories: Category[] = [
  { name: 'Addictions', symbol: '♡', tone: 'rose' },
  { name: 'Parentalité à distance', symbol: '❀', tone: 'rose' },
  { name: 'Deuil ambigu', symbol: '☼', tone: 'sand' },
  { name: 'Violences', symbol: '☾', tone: 'clay' },
  { name: 'Anxiété / Dépression', symbol: '♧', tone: 'sage' },
  { name: 'Burn-out', symbol: '⌒', tone: 'sand' },
  { name: 'Séparation conjugale', symbol: '♢', tone: 'sage' },
  { name: 'Travail', symbol: '✦', tone: 'clay' },
  { name: 'Projets de vie', symbol: '◎', tone: 'sand' },
  { name: 'Expatriation', symbol: '△', tone: 'clay' },
]
