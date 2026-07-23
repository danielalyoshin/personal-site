import type { Project } from '../content/types'

/** Pick legible label text color for a given accent (YIQ luma split). */
function labelInk(accent: string): string {
  const r = parseInt(accent.slice(1, 3), 16)
  const g = parseInt(accent.slice(3, 5), 16)
  const b = parseInt(accent.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 >= 150 ? '#17181c' : '#ffffff'
}

const SPINE_FONT = 'var(--font-chassis)'

/**
 * Standing cassette, spine facing the viewer — the shelf object.
 * Purely decorative inside its labelled link; crisp flat planes only.
 */
export function CassetteSpine({ tape }: { tape: Project }) {
  const { accent, labelVariant, spineLabel } = tape.vhs
  const text = spineLabel.toUpperCase()
  return (
    <svg viewBox="0 0 60 420" aria-hidden="true" focusable="false">
      <rect x="1" y="2" width="58" height="416" rx="7" fill="#1a1c22" />
      <rect
        x="1.75"
        y="2.75"
        width="56.5"
        height="414.5"
        rx="6.5"
        fill="none"
        stroke="#2e323b"
        strokeWidth="1.5"
      />
      <path d="M2 30 h56" stroke="#101216" strokeWidth="2" />
      <path d="M2 392 h56" stroke="#101216" strokeWidth="2" />
      <circle cx="30" cy="16" r="3" fill="#2a2e37" />
      <circle cx="30" cy="406" r="3" fill="#2a2e37" />

      {labelVariant === 'classic' && (
        <g>
          <rect x="7" y="38" width="46" height="302" rx="3" fill="#f2f1ec" />
          <rect x="7" y="46" width="46" height="16" fill={accent} />
          <rect
            x="7"
            y="66"
            width="46"
            height="7"
            fill={accent}
            opacity="0.55"
          />
          <text
            transform="rotate(90)"
            x="88"
            y="-30"
            dominantBaseline="central"
            fontFamily={SPINE_FONT}
            fontWeight={700}
            fontSize="15"
            letterSpacing="2"
            fill="#17181c"
          >
            {text}
          </text>
        </g>
      )}
      {labelVariant === 'rental' && (
        <g>
          <rect x="7" y="38" width="46" height="302" rx="3" fill={accent} />
          <text
            transform="rotate(90)"
            x="52"
            y="-30"
            dominantBaseline="central"
            fontFamily={SPINE_FONT}
            fontWeight={800}
            fontSize="15"
            letterSpacing="2"
            fill={labelInk(accent)}
          >
            {text}
          </text>
        </g>
      )}
      {labelVariant === 'studio' && (
        <g>
          <rect x="7" y="40" width="46" height="5" fill={accent} />
          <text
            transform="rotate(90)"
            x="60"
            y="-30"
            dominantBaseline="central"
            fontFamily={SPINE_FONT}
            fontWeight={600}
            fontSize="15"
            letterSpacing="3"
            fill="#c9cdd7"
          >
            {text}
          </text>
        </g>
      )}

      <text
        x="30"
        y="380"
        textAnchor="middle"
        fontFamily={SPINE_FONT}
        fontWeight={800}
        fontSize="10"
        letterSpacing="1.5"
        fill="#5c626e"
      >
        VHS
      </text>
    </svg>
  )
}

/** Cassette seen face-on — the object that flies between shelf and deck slot. */
export function CassetteFace({ tape }: { tape: Project }) {
  const { accent, labelVariant, spineLabel } = tape.vhs
  const labelBg =
    labelVariant === 'rental'
      ? accent
      : labelVariant === 'classic'
        ? '#f2f1ec'
        : '#14161b'
  const ink =
    labelVariant === 'rental'
      ? labelInk(accent)
      : labelVariant === 'classic'
        ? '#17181c'
        : '#c9cdd7'
  return (
    <svg viewBox="0 0 420 240" aria-hidden="true" focusable="false">
      <rect
        x="2"
        y="2"
        width="416"
        height="236"
        rx="12"
        fill="#1a1c22"
        stroke="#2e323b"
        strokeWidth="2"
      />
      <rect x="52" y="32" width="316" height="94" rx="8" fill="#0b0c10" />
      <circle
        cx="128"
        cy="79"
        r="33"
        fill="#191b21"
        stroke="#3a3f4a"
        strokeWidth="6"
      />
      <circle
        cx="292"
        cy="79"
        r="33"
        fill="#191b21"
        stroke="#3a3f4a"
        strokeWidth="6"
      />
      <circle cx="128" cy="79" r="11" fill="#2a2e37" />
      <circle cx="292" cy="79" r="11" fill="#2a2e37" />
      <rect x="30" y="150" width="360" height="66" rx="4" fill={labelBg} />
      {labelVariant === 'classic' && (
        <rect x="30" y="150" width="360" height="14" fill={accent} />
      )}
      {labelVariant === 'studio' && (
        <rect x="30" y="150" width="360" height="5" fill={accent} />
      )}
      <text
        x="210"
        y="193"
        textAnchor="middle"
        fontFamily={SPINE_FONT}
        fontWeight={800}
        fontSize="24"
        letterSpacing="3"
        fill={ink}
      >
        {spineLabel.toUpperCase()}
      </text>
    </svg>
  )
}
