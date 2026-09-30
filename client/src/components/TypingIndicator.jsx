export default function TypingIndicator() {
  return (
    <div className=bubble-row bubble-row--assistant>
      <div className=bubble-avatar bubble-avatar--assistant>
        <svg width=14 height=14 viewBox=0 0 32 32 fill=none>
          <rect x=4 y=20 width=24 height=4 rx=2 fill=#00C9B1 opacity=.5/>
          <rect x=4 y=14 width=24 height=4 rx=2 fill=#00C9B1 opacity=.75/>
          <rect x=4 y=8  width=24 height=4 rx=2 fill=#00C9B1/>
        </svg>
      </div>
      <div className=bubble bubble--assistant>
        <div className=bubble-role>Stacks</div>
        <div className=typing-dots>
          <span className=typing-dot style={{animationDelay:'0ms'}}/>
          <span className=typing-dot style={{animationDelay:'150ms'}}/>
          <span className=typing-dot style={{animationDelay:'300ms'}}/>
        </div>
      </div>
    </div>
  )
}
