import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import ChatPage from './components/ChatPage.jsx'

let idCounter = 0
const nextId = () => `m${++idCounter}`

export default function App() {
  const [theme, setTheme] = useState('light')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const handleSend = (text) => {
    const userMessage = { id: nextId(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])

    // Placeholder AI reply — wired to a real backend in the next phase.
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'assistant',
          content:
            "This is a placeholder reply. Once the backend is connected, I'll answer using the documents you upload.",
        },
      ])
    }, 400)
  }

  const handleNewChat = () => {
    setMessages([])
    setActiveChatId(null)
    setSidebarOpen(false)
  }

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId)
    setMessages([])
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
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
    </div>
  )
}
