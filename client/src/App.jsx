import { useState, useEffect, useCallback, Suspense, lazy } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import Topbar from './components/layout/Topbar.jsx'
import MessageList from './components/chat/MessageList.jsx'
import ChatInput from './components/chat/ChatInput.jsx'
import AuthModal from './components/auth/AuthModal.jsx'
import { ErrorBoundary } from './components/ui/ErrorBoundary.jsx'
import {
  createSession, uploadDocument, sendMessage,
  fetchConversationHistory, fetchConversation,
  renameConversation, deleteConversation,
} from './lib/api.js'

// Lazy-load heavy components
const BackgroundScene = lazy(() => import('./canvas/BackgroundScene.jsx'))
const AdminPanel = lazy(() => import('./components/admin/AdminPanel.jsx'))

let idCounter = 0
const nextId = () => String(++idCounter)
const EMPTY_DOC = { hasDocument: false, fileName: null, chunkCount: 0 }

export default function App() {
  const { user, logout } = useAuth()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [documentStatus, setDocumentStatus] = useState(EMPTY_DOC)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('auto')

  // ── Bootstrap session ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    createSession()
      .then(({ sessionId: sid }) => { if (!cancelled) setSessionId(sid) })
      .catch(() => {
        if (!cancelled) {
          setMessages([{
            id: nextId(), role: 'system',
            content: "⚠️ Couldn't reach the server. Is the backend running?",
          }])
        }
      })
    return () => { cancelled = true }
  }, [])

  // ── Refresh history ───────────────────────────────────────────────────────
  const refreshHistory = useCallback(async () => {
    if (!user) { setHistory([]); return }
    setHistoryLoading(true)
    try {
      const { conversations } = await fetchConversationHistory()
      setHistory(conversations)
    } catch {
      /* silent */
    } finally {
      setHistoryLoading(false)
    }
  }, [user])

  useEffect(() => { refreshHistory() }, [refreshHistory])

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async (text) => {
    if (!sessionId) return
    const ts = Date.now()
    setMessages(p => [...p, { id: nextId(), role: 'user', content: text, timestamp: ts }])
    setIsTyping(true)
    try {
      const { reply } = await sendMessage(sessionId, text, selectedModel)
      setMessages(p => [...p, { id: nextId(), role: 'assistant', content: reply, timestamp: Date.now() }])
      if (user) { setActiveChatId(sessionId); refreshHistory() }
    } catch (err) {
      setMessages(p => [...p, { id: nextId(), role: 'system', content: err.message || 'Something went wrong.' }])
    } finally {
      setIsTyping(false)
    }
  }, [sessionId, user, refreshHistory])

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = useCallback(async (file) => {
    if (!sessionId) return
    setIsUploading(true); setUploadError(null)
    try {
      const { fileName, chunkCount } = await uploadDocument(sessionId, file)
      setDocumentStatus({ hasDocument: true, fileName, chunkCount })
    } catch (err) {
      setUploadError(err.message || 'Upload failed.')
    } finally {
      setIsUploading(false)
    }
  }, [sessionId])

  // ── New chat ──────────────────────────────────────────────────────────────
  const handleNewChat = useCallback(async () => {
    setMessages([]); setActiveChatId(null); setDocumentStatus(EMPTY_DOC)
    setUploadError(null); setSidebarOpen(false)
    try {
      const { sessionId: sid } = await createSession()
      setSessionId(sid)
    } catch { /* keep old */ }
  }, [])

  // ── Select chat ───────────────────────────────────────────────────────────
  const handleSelectChat = useCallback(async (chatSessionId) => {
    setActiveChatId(chatSessionId); setSidebarOpen(false); setUploadError(null)
    try {
      const { conversation } = await fetchConversation(chatSessionId)
      setSessionId(conversation.sessionId)
      setMessages(conversation.messages.map(m => ({ id: nextId(), role: m.role, content: m.content })))
      setDocumentStatus({
        hasDocument: Boolean(conversation.fileName),
        fileName: conversation.fileName,
        chunkCount: conversation.chunkCount,
      })
    } catch (err) {
      setMessages([{ id: nextId(), role: 'system', content: err.message || "Couldn't load conversation." }])
    }
  }, [])

  const handleRenameChat = useCallback(async (chatSessionId, title) => {
    const prev = history
    setHistory(h => h.map(c => c.sessionId === chatSessionId ? { ...c, title } : c))
    try { await renameConversation(chatSessionId, title) } catch { setHistory(prev) }
  }, [history])

  const handleDeleteChat = useCallback(async (chatSessionId) => {
    const prev = history
    setHistory(h => h.filter(c => c.sessionId !== chatSessionId))
    try {
      await deleteConversation(chatSessionId)
      if (chatSessionId === activeChatId) handleNewChat()
    } catch { setHistory(prev) }
  }, [history, activeChatId, handleNewChat])

  const handleLogout = useCallback(async () => {
    try { await logout() } finally {
      setMessages([]); setActiveChatId(null); setDocumentStatus(EMPTY_DOC)
      setUploadError(null); setSidebarOpen(false)
      try { const { sessionId: sid } = await createSession(); setSessionId(sid) } catch { /* keep old */ }
    }
  }, [logout])

  return (
    <>
      {/* Fallback CSS gradient background — always visible */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse at 20% 50%, #0e1440 0%, #070812 60%, #12083a 100%)',
        }}
      />

      {/* Animated WebGL background — fails silently if WebGL unavailable */}
      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <BackgroundScene />
        </Suspense>
      </ErrorBoundary>

      <div className="app-shell" style={{ position: 'relative', zIndex: 1 }}>
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          history={history}
          historyLoading={historyLoading}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
          onOpenLogin={() => setLoginOpen(true)}
          onLogout={handleLogout}
        />

        {/* Main area */}
        <div className="main-area">
          <Topbar
            onOpenSidebar={() => setSidebarOpen(true)}
            onOpenLogin={() => setLoginOpen(true)}
            onOpenAdmin={() => setAdminOpen(true)}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />

          <div className="chat-area">
            <MessageList
              messages={messages}
              isTyping={isTyping}
              onSuggestion={handleSend}
              hasDocument={documentStatus.hasDocument}
            />

            <ChatInput
              onSend={handleSend}
              onUploadFile={handleUpload}
              documentStatus={documentStatus}
              isUploading={isUploading}
              uploadError={uploadError}
              disabled={!sessionId || isTyping}
            />
          </div>
        </div>

        {/* Auth modal */}
        <AnimatePresence>
          {loginOpen && (
            <AuthModal key="auth" onClose={() => setLoginOpen(false)} />
          )}
        </AnimatePresence>

        {/* Admin panel */}
        <AnimatePresence>
          {adminOpen && user?.isAdmin && (
            <ErrorBoundary fallback={null}>
              <Suspense fallback={null}>
                <AdminPanel key="admin" onClose={() => setAdminOpen(false)} />
              </Suspense>
            </ErrorBoundary>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
