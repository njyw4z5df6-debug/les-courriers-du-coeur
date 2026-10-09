import { Menu, PenLine, UserRound, X } from 'lucide-react'
import { useState } from 'react'

const links = [
  ['Accueil', 'accueil'],
  ['Lire les courriers', 'tous-les-courriers'],
  ['Les catégories', 'categories'],
  ['La plume du jour', 'plume-du-jour'],
  ['Notre histoire', 'histoire'],
]

export function Header() {
  const [open, setOpen] = useState(false)

  function goToSection(id: string) {
    setOpen(false)
    if (window.location.pathname !== '/') {
      window.location.href = '/#' + id
      return
    }
    const target = document.getElementById(id)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.history.replaceState(null, '', '/#' + id)
    } else {
      window.location.href = '/#' + id
    }
  }

  return (
    <header className="site-header">
      <a className="brand brand-luxe" href="/#accueil" aria-label="Les Courriers du Cœur, accueil" onClick={(e) => { e.preventDefault(); goToSection('accueil') }}>
        <span className="brand-seal" aria-hidden="true">
          <span className="brand-envelope">⌁</span>
          <span className="brand-wax">♡</span>
        </span>
        <span className="brand-words"><strong>LES COURRIERS</strong><i>du Cœur</i></span>
      </a>
      <button className="menu-button" type="button" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? 'main-nav is-open' : 'main-nav'} aria-label="Navigation principale">
        {links.map(([label, id]) => <a href={'/#' + id} key={id} onClick={(e) => { e.preventDefault(); goToSection(id) }}>{label}</a>)}
        <a href="/compte" onClick={() => setOpen(false)}><UserRound size={15} /> Mon compte</a>
        <a className="nav-write" href="/ecrire" onClick={() => setOpen(false)}><PenLine size={16} /> Écrire mon courrier</a>
      </nav>
    </header>
  )
}
