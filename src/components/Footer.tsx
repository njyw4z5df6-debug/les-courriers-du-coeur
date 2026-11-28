import { useState } from 'react'
import { Instagram } from 'lucide-react'
import { CONTACT_EMAIL, SITE_HOST, SITE_URL } from '../config/site'

export function Footer() {
  const [info, setInfo] = useState<'bienveillance' | 'confidentialite' | null>(null)

  return (
    <footer className="site-footer" id="confidentialite">
      <div className="footer-brand"><span>♡</span><strong>Les Courriers <i>du Cœur</i></strong></div>
      <p>Un espace pour déposer ses mots, à son rythme et sans jugement.</p>
      <div className="footer-links">
        <button type="button" onClick={() => setInfo(info === 'bienveillance' ? null : 'bienveillance')}>Règles de bienveillance</button>
        <button type="button" onClick={() => setInfo(info === 'confidentialite' ? null : 'confidentialite')}>Confidentialité</button>
        <a href={`mailto:${CONTACT_EMAIL}`}>Nous écrire</a>
        <a href={SITE_URL} rel="home">{SITE_HOST}</a>
        <a href="https://www.instagram.com/lescourriersducoeur.fr/" target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:7}}><Instagram size={17} aria-hidden="true" /> Retrouvez-nous sur Instagram</a>
      </div>

      {info === 'bienveillance' && (
        <div className="footer-info">
          <strong>♡ Ici, on échange avec bienveillance.</strong>
          <p>Respect, écoute et absence de jugement sont essentiels. Les insultes, propos haineux, discriminatoires, humiliants, menaçants ou le harcèlement ne sont pas acceptés. Pour préserver chacun, les courriers et réponses sont modérés avant publication. Pour signaler un contenu préoccupant, utilisez le lien « Nous écrire » en indiquant le courrier concerné, sans recopier d'informations sensibles.</p>
        </div>
      )}

      {info === 'confidentialite' && (
        <div className="footer-info">
          <strong>♡ Votre histoire vous appartient.</strong>
          <p>Votre adresse e-mail n’est pas affichée publiquement : seul votre pseudonyme apparaît sur le site. Évitez de partager dans vos courriers des informations permettant de vous identifier ou d’identifier une autre personne. Les contenus publiés restent accessibles aux membres selon les conditions d’accès du site.</p>
        </div>
      )}

      <p className="copyright">© {new Date().getFullYear()} Les Courriers du Cœur · Fait avec douceur</p>
    </footer>
  )
}
