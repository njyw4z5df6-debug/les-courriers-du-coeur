import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Feather } from 'lucide-react'

type PublicLetter = {
  id: number
  created_at: string
  pseudo: string
  categorie: string
  message: string
}

export function PublicLetters() {
  const [letters, setLetters] = useState<PublicLetter[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Tous')

  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!url || !key) {
      setLoading(false)
      return
    }

    fetch(url + '/rest/v1/courriers?select=id,created_at,pseudo,categorie,message&valide=eq.true&statut=eq.valide&order=created_at.desc', {
      headers: { apikey: key, Authorization: 'Bearer ' + key },
    })
      .then((response) => {
        if (!response.ok) throw new Error()
        return response.json()
      })
      .then((data) => setLetters(data))
      .catch(() => setLetters([]))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(
    () => ['Tous', ...Array.from(new Set(letters.map((letter) => letter.categorie).filter(Boolean)))],
    [letters],
  )

  const visibleLetters = useMemo(
    () => activeCategory === 'Tous'
      ? letters
      : letters.filter((letter) => letter.categorie === activeCategory),
    [letters, activeCategory],
  )

  return (
    <section className="public-letters" id="courriers">
      <div className="public-letters-inner">
        <div className="section-heading public-letters-heading">
          <div>
            <p className="script-label">Des mots partagés avec confiance</p>
            <h2>Lire les courriers</h2>
          </div>
          <div className="public-letters-intro">
            <Feather size={18} />
            <p>Seuls les courriers validés après modération apparaissent ici.</p>
          </div>
        </div>

        {!loading && letters.length > 0 && (
          <div className="public-letters-toolbar">
            <div className="public-letters-filters" aria-label="Filtrer les courriers par catégorie">
              {categories.map((category) => (
                <button
                  className={activeCategory === category ? 'public-filter is-active' : 'public-filter'}
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <span className="public-letters-count">
              {visibleLetters.length} courrier{visibleLetters.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {loading ? (
          <p className="public-letters-empty">Chargement des courriers…</p>
        ) : letters.length === 0 ? (
          <div className="public-letters-empty">
            <BookOpen size={28} />
            <strong>Aucun courrier publié pour le moment.</strong>
            <span>Les premiers mots apparaîtront ici après validation.</span>
          </div>
        ) : visibleLetters.length === 0 ? (
          <div className="public-letters-empty">
            <BookOpen size={28} />
            <strong>Aucun courrier dans cette catégorie.</strong>
            <span>Vous pouvez choisir une autre catégorie juste au-dessus.</span>
          </div>
        ) : (
          <div className="public-letters-grid">
            {visibleLetters.map((letter) => (
              <article className="public-letter-card" key={letter.id}>
                <div className="public-letter-top">
                  <div className="public-letter-author">
                    <span className="public-letter-avatar">{letter.pseudo.slice(0, 1).toUpperCase()}</span>
                    <div>
                      <strong>{letter.pseudo}</strong>
                      <time>{new Date(letter.created_at).toLocaleDateString('fr-FR')}</time>
                    </div>
                  </div>
                  <span className="public-letter-category">{letter.categorie}</span>
                </div>

                <div className="public-letter-separator" />

                <p className="public-letter-message">{letter.message}</p>

                <div className="public-letter-signature">♡</div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
