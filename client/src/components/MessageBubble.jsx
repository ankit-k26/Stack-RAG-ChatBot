import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

function parseContent(content) {
  const blocks = []
  const codeRegex = /`(\w*)\n?([\s\S]*?)`/g
  let last = 0; let m
  while ((m = codeRegex.exec(content)) !== null) {
    if (m.index > last) blocks.push({ type: 'text', content: content.slice(last, m.index) })
    blocks.push({ type: 'code', lang: m[1] || 'text', content: m[2].trimEnd() })
    last = m.index + m[0].length
  }
  if (last < content.length) blocks.push({ type: 'text', content: content.slice(last) })
  return blocks
}

function CodeBlock({ lang, content }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className=code-block>
      <div className=code-block-header>
        <span className=code-block-lang>{lang}</span>
        <button className=code-copy-btn onClick={copy}>
          {copied ? <><Check size={11}/> Copied</> : <><Copy size={11}/> Copy</>}
        </button>
      </div>
      <pre className=code-pre><code>{content}</code></pre>
    </div>
  )
}

function renderInline(text) {
  const parts = text.split(/([^]+)/g)
  return parts.map((p, i) =>
    p.startsWith('') && p.endsWith('')
      ? <code key={i} className=inline-code>{p.slice(1, -1)}</code>
      : p
  )
}

function TextBlock({ content }) {
  const lines = content.split('\n')
  return (
    <div className=text-block>
      {lines.map((line, i) => {
        if (/^### /.test(line)) return <h3 key={i} className=md-h3>{renderInline(line.slice(4))}</h3>
        if (/^## /.test(line)) return <h2 key={i} className=md-h2>{renderInline(line.slice(3))}</h2>
        if (/^# /.test(line)) return <h1 key={i} className=md-h1>{renderInline(line.slice(2))}</h1>
        if (/^\*\*\*/.test(line) || /^---/.test(line)) return <hr key={i} className=md-hr/>
        if (/^[-*] /.test(line)) return <li key={i} className=md-li>{renderInline(line.slice(2))}</li>
        if (/^\d+\. /.test(line)) return <li key={i} className=md-li md-li--num>{renderInline(line.replace(/^\d+\. /, ''))}</li>
        if (line === '') return <div key={i} className=md-spacer/>
        return <p key={i} className=md-p>{renderInline(line)}</p>
      })}
    </div>
  )
}

const ROLE_LABELS = { user: 'You', assistant: 'Stacks', system: 'System' }

export default function MessageBubble({ message, index }) {
  const { role, content } = message
  const blocks = parseContent(content)
  const isUser = role === 'user'
  const isSystem = role === 'system'

  return (
    <div
      className={ubble-row bubble-row--}
      style={{ animationDelay: ${Math.min(index * 30, 200)}ms }}
    >
      {!isUser && (
        <div className={ubble-avatar bubble-avatar--}>
          {isSystem ? '!' : (
            <svg width=14 height=14 viewBox=0 0 32 32 fill=none>
              <rect x=4 y=20 width=24 height=4 rx=2 fill=#00C9B1 opacity=.5/>
              <rect x=4 y=14 width=24 height=4 rx=2 fill=#00C9B1 opacity=.75/>
              <rect x=4 y=8  width=24 height=4 rx=2 fill=#00C9B1/>
            </svg>
          )}
        </div>
      )}
      <div className={ubble bubble--}>
        <div className=bubble-role>{ROLE_LABELS[role]}</div>
        <div className=bubble-content>
          {blocks.map((b, i) =>
            b.type === 'code'
              ? <CodeBlock key={i} lang={b.lang} content={b.content}/>
              : <TextBlock key={i} content={b.content}/>
          )}
        </div>
      </div>
    </div>
  )
}
