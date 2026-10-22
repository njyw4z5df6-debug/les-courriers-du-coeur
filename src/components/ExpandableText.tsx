import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

type Props = { text: string; className?: string; style?: React.CSSProperties }

/** Compact reading preview; the complete text stays available without navigation. */
export function ExpandableText({ text, className, style }: Props) {
  const [expanded, setExpanded] = useState(false)
  const canExpand = text.length > 180 || text.split('\n').length > 3
  return (
    <div>
      <p className={className} style={{
        ...style,
        ...(!expanded && canExpand ? {
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden',
        } : {}),
      }}>{text}</p>
      {canExpand && (
        <button type="button" aria-expanded={expanded}
          onClick={() => setExpanded(value => !value)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 0,
            background: 'transparent', color: '#87594e', font: 'inherit',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '6px 0',
            textDecoration: 'underline', textUnderlineOffset: 4 }}>
          {expanded ? 'Réduire' : 'Lire la suite'}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
    </div>
  )
}
