const SUGGESTIONS = [
  { label: 'Summarize this document', icon: '📄' },
  { label: 'What are the key points?', icon: '🎯' },
  { label: 'List the main topics', icon: '📋' },
  { label: 'Explain the core concepts', icon: '💡' },
]

const OrbSVG = () => (
  <svg className=welcome-orb viewBox=0 0 200 200 xmlns=http://www.w3.org/2000/svg>
    <defs>
      <radialGradient id=orbGrad cx=35% cy=30% r=65%>
        <stop offset=0%   stopColor=#00E5D0 stopOpacity=1/>
        <stop offset=45%  stopColor=#00C9B1 stopOpacity=1/>
        <stop offset=80%  stopColor=#008F7F stopOpacity=1/>
        <stop offset=100% stopColor=#004A44 stopOpacity=1/>
      </radialGradient>
      <radialGradient id=orbGlow cx=50% cy=50% r=50%>
        <stop offset=0%   stopColor=#00C9B1 stopOpacity=0.35/>
        <stop offset=100% stopColor=#00C9B1 stopOpacity=0/>
      </radialGradient>
      <filter id=blur-glow>
        <feGaussianBlur stdDeviation=18 result=blur/>
        <feMerge><feMergeNode in=blur/><feMergeNode in=SourceGraphic/></feMerge>
      </filter>
    </defs>
    <ellipse cx=100 cy=100 rx=80 ry=80 fill=url(#orbGlow) filter=url(#blur-glow)/>
    <circle cx=100 cy=100 r=60 fill=url(#orbGrad)/>
    <ellipse cx=80 cy=78 rx=18 ry=10 fill=white opacity=0.18/>
  </svg>
)

export default function WelcomeScreen({ onSuggestion }) {
  return (
    <div className=welcome>
      <div className=welcome-orb-wrap>
        <OrbSVG/>
      </div>
      <div className=welcome-text>
        <h1 className=welcome-title>Ask anything about your documents</h1>
        <p className=welcome-sub>Upload a PDF, TXT, DOCX, or CSV and interrogate it with AI</p>
      </div>
      <div className=welcome-chips>
        {SUGGESTIONS.map(s => (
          <button key={s.label} className=welcome-chip onClick={() => onSuggestion(s.label)}>
            <span className=welcome-chip-icon>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
