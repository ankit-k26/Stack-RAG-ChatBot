import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import ChatPage from './components/ChatPage.jsx'
import { createSession, uploadDocument, sendMessage } from './lib/api.js'

let idCounter = 0
const nextId = () => `m${++idCounter}`

const EMPTY_DOCUMENT_STATUS = { hasDocument: false, fileName: null, chunkCount: 0 }

export default function App() {
  const [theme, setTheme] = useState('light')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)

  const [sessionId, setSessionId] = useState(null)
  const [documentStatus, setDocumentStatus] = useState(EMPTY_DOCUMENT_STATUS)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Every conversation needs a session on the backend to track its
  // uploaded document and short-term history — create one as soon as the
  // app loads.
  useEffect(() => {
    let cancelled = false
    createSession()
      .then(({ sessionId }) => {
        if (!cancelled) setSessionId(sessionId)
      })
      .catch(() => {
        if (!cancelled) {
          setMessages([
            {
              id: nextId(),
              role: 'system',
              content: "Couldn't reach the server to start a session. Is the backend running?",
            },
          ])
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSend = async (text) => {
    if (!sessionId) return
    const userMessage = { id: nextId(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    try {
      const { reply } = await sendMessage(sessionId, text)
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', content: reply }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'system',
          content: err.message || 'Something went wrong reaching the assistant.',
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleUploadFile = async (file) => {
    if (!sessionId) return
    setIsUploading(true)
    setUploadError(null)

    try {
      const { fileName, chunkCount } = await uploadDocument(sessionId, file)
      setDocumentStatus({ hasDocument: true, fileName, chunkCount })
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'system',
          content: `"${fileName}" is indexed — ask away.`,
        },
      ])
    } catch (err) {
      setUploadError(err.message || 'Could not upload that file.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleNewChat = async () => {
    setMessages([])
    setActiveChatId(null)
    setDocumentStatus(EMPTY_DOCUMENT_STATUS)
    setUploadError(null)
    setSidebarOpen(false)
    try {
      const { sessionId: newSessionId } = await createSession()
      setSessionId(newSessionId)
    } catch {
      // Keep the old session rather than leave the user stuck with none.
    }
  }

  const handleSelectChat = (chatId) => {
    // Chat history is a placeholder for now — selecting an entry just
    // switches the highlighted item without loading saved messages yet.
    setActiveChatId(chatId)
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-paper text-ink dark:bg-ink dark:text-paper">
      <Sidebar
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <ChatPage
        messages={messages}
        onSend={handleSend}
        isTyping={isTyping}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onOpenSidebar={() => setSidebarOpen(true)}
        documentStatus={documentStatus}
        isUploading={isUploading}
        uploadError={uploadError}
        onUploadFile={handleUploadFile}
      />
    </div>
  )
}
