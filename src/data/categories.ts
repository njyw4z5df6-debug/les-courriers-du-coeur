export type Category = {
  name: string
  symbol: string
  tone: 'rose' | 'sand' | 'sage' | 'clay'
}

export const categories: Category[] = [
  { name: 'Amour & couple', symbol: '♡', tone: 'rose' },
  { name: 'Rupture & séparation', symbol: '◇', tone: 'clay' },
  { name: 'Famille', symbol: '⌂', tone: 'sand' },
  { name: 'Parentalité', symbol: '❀', tone: 'rose' },
  { name: 'Amitié', symbol: '∞', tone: 'sage' },
  { name: 'Solitude', symbol: '☾', tone: 'sand' },
  { name: 'Deuil', symbol: '♢', tone: 'sage' },
  { name: 'Confiance en soi', symbol: '✦', tone: 'clay' },
  { name: 'Reconstruction', symbol: '⌁', tone: 'sage' },
]
