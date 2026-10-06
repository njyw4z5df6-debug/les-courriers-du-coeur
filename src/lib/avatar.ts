export const avatarSymbols: Record<string, string> = {
  fleur: '❀',
  soleil: '☼',
  lune: '☾',
  plume: '✦',
  coeur: '♡',
  olivier: '❧',
  papillon: '𓆩♡𓆪',
  lettre: '✉',
  etoile: '✧',
  marguerite: '✿',
  branche: '⌇',
  constellation: '⋆',
}

export function avatarSymbol(name?: string, fallback = '♡') {
  return (name && avatarSymbols[name]) || fallback
}
