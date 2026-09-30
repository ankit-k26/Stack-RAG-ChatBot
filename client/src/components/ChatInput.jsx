import { useRef, useEffect, useState } from 'react'
import { Paperclip, ArrowUp, X, FileText, Loader2 } from 'lucide-react'

export default function ChatInput({ onSend, onUploadFile, documentStatus, isUploading, uploadError, disabled }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [text])

  const submit = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    textareaRef.current.style.height = 'auto'
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  const onFile = (e) => {
    const file = e.target.files?.[0]
    if (file) { onUploadFile(file); e.target.value = '' }
  }

  return (
    <div className=input-area>
      {/* Document badge */}
      {documentStatus.hasDocument && (
        <div className=doc-badge>
          <FileText size={12}/>
          <span className=doc-badge-name>{documentStatus.fileName}</span>
          <span className=doc-badge-chunks>{documentStatus.chunkCount} chunks</span>
        </div>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className=upload-error>
          <X size={12}/> {uploadError}
        </div>
      )}

      <div className=input-shell>
        {/* Gradient border wrapper */}
        <div className=input-border>
          <div className=input-inner>
            {/* Attach */}
            <button
              className=input-btn input-btn--attach
              onClick={() => fileRef.current?.click()}
              disabled={isUploading}
              title=Upload document
              type=button
            >
              {isUploading ? <Loader2 size={16} className=spin/> : <Paperclip size={16}/>}
            </button>
            <input ref={fileRef} type=file accept=.pdf,.txt,.docx,.md,.csv hidden onChange={onFile}/>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              className=input-textarea
              placeholder=Ask anything about your documents…
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              disabled={disabled}
            />

            {/* Send */}
            <button
              className={input-btn input-btn--send}
              onClick={submit}
              disabled={!text.trim() || disabled}
              title=Send
              type=button
            >
              <ArrowUp size={16} strokeWidth={2.5}/>
            </button>
          </div>
        </div>
      </div>
      <p className=input-hint>Shift + Enter for new line &middot; supports PDF, TXT, DOCX, MD, CSV</p>
    </div>
  )
}
