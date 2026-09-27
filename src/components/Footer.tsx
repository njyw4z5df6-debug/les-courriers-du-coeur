export function Footer() {
  return (
    <footer className="site-footer" id="confidentialite">
      <div className="footer-brand"><span>♡</span><strong>Les Courriers <i>du Cœur</i></strong></div>
      <p>Un espace pour déposer ses mots, à son rythme et sans jugement.</p>
      <div className="footer-links">
        <a href="#bienveillance">Règles de bienveillance</a>
        <a href="#confidentialite">Confidentialité</a>
        <a href="mailto:bonjour@lescourriersducoeur.fr">Contact</a>
      </div>
      <p className="copyright">© {new Date().getFullYear()} Les Courriers du Cœur · Fait avec douceur</p>
    </footer>
  )
}
