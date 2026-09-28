import { Menu, PenLine, X } from 'lucide-react'
import { useState } from 'react'

const links = [
  ['Accueil', '#accueil'],
  ['Lire les courriers', '#courriers'],
  ['Les catégories', '#categories'],
  ['Notre histoire', '#histoire'],
]

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <a className="brand" href="#accueil" aria-label="Les Courriers du Cœur, accueil">
        <span className="brand-mark" aria-hidden="true"><span>♡</span></span>
        <span>Les Courriers<br /><i>du Cœur</i></span>
      </a>
      <button className="menu-button" type="button" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? 'main-nav is-open' : 'main-nav'} aria-label="Navigation principale">
        {links.map(([label, href]) => <a href={href} key={href} onClick={() => setOpen(false)}>{label}</a>)}
        <a className="nav-write" href="#ecrire" onClick={() => setOpen(false)}><PenLine size={16} /> Écrire mon courrier</a>
      </nav>
    </header>
  )
}
