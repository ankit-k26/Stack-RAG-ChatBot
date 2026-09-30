import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import WelcomeScreen from './WelcomeScreen.jsx'

export default function ChatMessages({ messages, isTyping, onSuggestion }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  if (messages.length === 0 && !isTyping) {
    return <WelcomeScreen onSuggestion={onSuggestion}/>
  }

  return (
    <div className=messages-scroll>
      <div className=messages-list>
        {messages.map((msg, idx) => (
          <MessageBubble key={msg.id} message={msg} index={idx}/>
        ))}
        {isTyping && <TypingIndicator/>}
        <div ref={bottomRef}/>
      </div>
    </div>
  )
}
