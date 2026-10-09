import { useEffect, useState } from 'react'
import { BarChart3, Users, Eye, Mail, MessageCircle, CreditCard, RefreshCw } from 'lucide-react'

type Member = { id: string; pseudo: string; email: string; created_at: string; confirmed: boolean; subscription_status: string }
type Stats = {
  updatedAt: string
  members: { total: number; today: number; last7Days: number; thisMonth: number; recent: Member[]; incomplete: boolean }
  letters: { total: number; published: number; pending: number }
  replies: { total: number; pending: number }
  subscriptions: { active: number }
  visits: { available: boolean; message: string }
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return <div style={{ padding: '18px', background: '#fffaf5', border: '1px solid #e8dcd2', borderRadius: 16, minWidth: 0 }}>
    <div style={{ color: '#9d7368', marginBottom: 9 }}>{icon}</div>
    <strong style={{ display: 'block', fontSize: 26, color: '#503c37' }}>{value}</strong>
    <span style={{ fontSize: 13, color: '#75615b' }}>{label}</span>
  </div>
}

export function AdminStats({ token }: { token: string }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(false)

  async function load(accessToken: string, signal?: AbortSignal) {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin-stats', {
        headers: { Authorization: 'Bearer ' + accessToken },
        signal,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Erreur serveur (HTTP ' + response.status + ').')
      setStats(data)
    } catch (err) {
      if (signal?.aborted) return
      setError(err instanceof Error ? err.message : 'Chargement impossible.')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    void load(token, controller.signal)
    return () => controller.abort()
  }, [token])

  return <section style={{ margin: '24px 0 36px' }} aria-label="Statistiques du site">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
      <div>
        <p className="script-label" style={{ marginBottom: 3 }}>Votre communauté en un coup d'œil</p>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 9 }}><BarChart3 size={23} /> Statistiques</h2>
      </div>
      <button className="button button-secondary" type="button" onClick={() => void load(token)} disabled={loading}>
        <RefreshCw size={15} /> {loading ? 'Chargement…' : 'Actualiser'}
      </button>
    </div>
    {error && <p role="alert" style={{ color: '#9b322e', fontSize: 14, padding: 14, background: '#fff3ef', borderRadius: 10 }}>{error}</p>}
    {stats && <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: 12 }}>
        <StatTile icon={<Users size={22} />} label="Comptes inscrits" value={stats.members.total} />
        <StatTile icon={<Users size={22} />} label="Nouveaux aujourd’hui" value={stats.members.today} />
        <StatTile icon={<Users size={22} />} label="Inscriptions sur 7 jours" value={stats.members.last7Days} />
        <StatTile icon={<Mail size={22} />} label="Courriers publiés" value={stats.letters.published} />
        <StatTile icon={<MessageCircle size={22} />} label="Réponses reçues" value={stats.replies.total} />
        <StatTile icon={<CreditCard size={22} />} label="Abonnements actifs" value={stats.subscriptions.active} />
      </div>
      <div style={{ marginTop: 12, padding: '14px 17px', borderRadius: 14, background: '#f7ede6', color: '#68504a', display: 'flex', gap: 12, alignItems: 'center', fontSize: 13 }}>
        <Eye size={21} style={{ flexShrink: 0 }} />
        <span><strong>Visiteurs :</strong> {stats.visits.message} Les chiffres d’inscription ci-dessus sont bien réels.</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, gap: 12, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0 }}>Dernières inscriptions</h3>
        <button type="button" className="button button-secondary" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Masquer la liste' : 'Voir les membres'}
        </button>
      </div>
      {expanded && <div style={{ marginTop: 14, overflowX: 'auto', border: '1px solid #e8dcd2', borderRadius: 14 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, textAlign: 'left' }}>
          <thead><tr style={{ background: '#f7ede6' }}><th style={{ padding: 12 }}>Pseudo</th><th style={{ padding: 12 }}>E-mail (privé)</th><th style={{ padding: 12 }}>Inscription</th><th style={{ padding: 12 }}>Compte</th></tr></thead>
          <tbody>{stats.members.recent.map(member => <tr key={member.id} style={{ borderTop: '1px solid #eee2d9' }}>
            <td style={{ padding: 12 }}>{member.pseudo}</td>
            <td style={{ padding: 12 }}>{member.email}</td>
            <td style={{ padding: 12 }}>{new Date(member.created_at).toLocaleDateString('fr-FR')}</td>
            <td style={{ padding: 12 }}>{member.confirmed ? 'Confirmé' : 'En attente'}</td>
          </tr>)}</tbody>
        </table>
        {stats.members.recent.length === 0 && <p style={{ padding: 15 }}>Aucune inscription pour le moment.</p>}
        {stats.members.incomplete && <p style={{ padding: 12 }}>Liste partielle : trop de comptes pour cet affichage.</p>}
      </div>}
      <p style={{ fontSize: 12, opacity: .7, marginTop: 10 }}>Mis à jour le {new Date(stats.updatedAt).toLocaleString('fr-FR')} · Visible uniquement dans l’espace administrateur.</p>
    </>}
    {!stats && loading && <p style={{ fontSize: 14 }}>Récupération des statistiques…</p>}
  </section>
}
