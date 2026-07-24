import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import ChatPage from './components/ChatPage.jsx'
import LoginModal from './components/LoginModal.jsx'
import { useAuth } from './context/AuthContext.jsx'
import {
  createSession,
  uploadDocument,
  sendMessage,
  fetchConversationHistory,
  fetchConversation,
  renameConversation,
  deleteConversation,
} from './lib/api.js'

let idCounter = 0
const nextId = () => `m${++idCounter}`

const EMPTY_DOCUMENT_STATUS = { hasDocument: false, fileName: null, chunkCount: 0 }

export default function App() {
  const { user, logout } = useAuth()
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('stacks-theme')
    if (stored === 'light' || stored === 'dark') return stored
    // Fall back to the OS/browser preference if nothing was saved yet
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)

  const [sessionId, setSessionId] = useState(null)
  const [documentStatus, setDocumentStatus] = useState(EMPTY_DOCUMENT_STATUS)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const refreshHistory = async () => {
    if (!user) {
      setHistory([])
      return
    }
    setHistoryLoading(true)
    try {
      const { conversations } = await fetchConversationHistory()
      setHistory(conversations)
    } catch {
      // Sidebar just shows an empty list if this fails — not worth
      // surfacing a hard error for a background refresh.
    } finally {
      setHistoryLoading(false)
    }
  }

  // Reload the saved-chats list whenever login state changes (login,
  // logout, or the initial /me check resolving).
  useEffect(() => {
    refreshHistory()
  }, [user])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('stacks-theme', theme)
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
      if (user) {
        setActiveChatId(sessionId)
        refreshHistory()
      }
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

  const handleSelectChat = async (chatSessionId) => {
    setActiveChatId(chatSessionId)
    setSidebarOpen(false)
    setUploadError(null)

    try {
      const { conversation } = await fetchConversation(chatSessionId)
      setSessionId(conversation.sessionId)
      setMessages(
        conversation.messages.map((m) => ({
          id: nextId(),
          role: m.role,
          content: m.content,
        }))
      )
      setDocumentStatus({
        hasDocument: Boolean(conversation.fileName),
        fileName: conversation.fileName,
        chunkCount: conversation.chunkCount,
      })
    } catch (err) {
      setMessages([
        {
          id: nextId(),
          role: 'system',
          content: err.message || "Couldn't load that conversation.",
        },
      ])
    }
  }

  const handleRenameChat = async (chatSessionId, newTitle) => {
    // Update the sidebar immediately; roll back if the request fails.
    const previous = history
    setHistory((prev) =>
      prev.map((c) => (c.sessionId === chatSessionId ? { ...c, title: newTitle } : c))
    )
    try {
      await renameConversation(chatSessionId, newTitle)
    } catch {
      setHistory(previous)
    }
  }

  const handleDeleteChat = async (chatSessionId) => {
    const previous = history
    setHistory((prev) => prev.filter((c) => c.sessionId !== chatSessionId))

    try {
      await deleteConversation(chatSessionId)
      if (chatSessionId === activeChatId) {
        handleNewChat()
      }
    } catch {
      setHistory(previous)
    }
  }

  const handleLogout = async () => {
    console.log('[Stacks] logging out — resetting chat view')
    try {
      await logout()
    } finally {
      // Reset regardless of whether the API call succeeded — the person
      // clicked "log out," so the screen should reflect that either way.
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
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-paper text-ink dark:bg-ink dark:text-paper">
      <Sidebar
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenLogin={() => setIsLoginOpen(true)}
        history={history}
        historyLoading={historyLoading}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        onLogout={handleLogout}
      />
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}
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