import { useState, useRef, useCallback } from 'react'
import { PaperclipIcon, SendIcon, FileTextIcon, XCircleIcon, Loader2Icon, UploadCloudIcon } from 'lucide-react'

const ACCEPT = '.pdf,.doc,.docx,.txt'

export default function ChatInput({
  onSend,
  onUploadFile,
  documentStatus,
  isUploading,
  uploadError,
  disabled,
}) {
  const [text, setText] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)
  const textareaRef = useRef(null)

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, disabled, onSend])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e) => {
    setText(e.target.value)
    // Auto-grow
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onUploadFile(file)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onUploadFile(file)
  }

  const canSend = text.trim().length > 0 && !disabled

  return (
    <div
      className="chat-input-container"
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="chat-input-wrap">
        {/* Status pills above input */}
        {(documentStatus?.hasDocument || uploadError || isUploading) && (
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            {isUploading && (
              <div className="upload-status-pill">
                <Loader2Icon size={12} style={{ animation: 'spin 0.7s linear infinite' }} />
                <span>Indexing document…</span>
              </div>
            )}
            {!isUploading && documentStatus?.hasDocument && (
              <div className="upload-status-pill">
                <FileTextIcon size={12} />
                <span className="file-name">{documentStatus.fileName}</span>
                <span style={{ opacity: 0.6 }}>· {documentStatus.chunkCount} chunks</span>
              </div>
            )}
            {uploadError && (
              <div className="upload-error-pill">
                <XCircleIcon size={12} />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        )}

        <div
          className="chat-input-box"
          style={dragOver ? { borderColor: 'rgba(79,143,255,0.6)', boxShadow: 'var(--shadow-blue)' } : undefined}
        >
          {/* File attach */}
          <div className="chat-input-actions">
            <button
              className="chat-input-attach"
              onClick={() => fileRef.current?.click()}
              disabled={isUploading}
              title="Upload document (PDF, DOCX, TXT)"
              aria-label="Upload document"
            >
              {isUploading ? (
                <Loader2Icon size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
              ) : (
                <PaperclipIcon size={16} />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {/* Text area */}
          <textarea
            ref={textareaRef}
            className="chat-input-textarea"
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={
              dragOver
                ? 'Drop file here…'
                : documentStatus?.hasDocument
                  ? `Ask about ${documentStatus.fileName}…`
                  : 'Ask anything, or upload a document…'
            }
            disabled={disabled}
            rows={1}
            aria-label="Message input"
          />

          {/* Send */}
          <button
            className="chat-input-send"
            onClick={handleSend}
            disabled={!canSend}
            title="Send message"
            aria-label="Send message"
          >
            <SendIcon size={15} />
          </button>
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 8 }}>
          Stacks answers from your document — never from the internet.
        </p>
      </div>
    </div>
  )
}
