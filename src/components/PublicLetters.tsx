import { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'

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

  return (
    <section className="public-letters" id="courriers">
      <div className="section-heading public-letters-heading">
        <div>
          <p className="script-label">Des mots partagés avec confiance</p>
          <h2>Lire les courriers</h2>
        </div>
        <p>Seuls les courriers validés après modération apparaissent ici.</p>
      </div>

      {loading ? (
        <p className="public-letters-empty">Chargement des courriers…</p>
      ) : letters.length === 0 ? (
        <div className="public-letters-empty">
          <BookOpen size={28} />
          <strong>Aucun courrier publié pour le moment.</strong>
          <span>Les premiers mots apparaîtront ici après validation.</span>
        </div>
      ) : (
        <div className="public-letters-grid">
          {letters.map((letter) => (
            <article className="public-letter-card" key={letter.id}>
              <div className="public-letter-meta">
                <span>{letter.pseudo}</span>
                <span>{letter.categorie}</span>
                <time>{new Date(letter.created_at).toLocaleDateString('fr-FR')}</time>
              </div>
              <p>{letter.message}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
