# Stacks — RAG Chatbot Frontend (Phase 1)

A frontend-only scaffold for a document-retrieval chatbot, built with
React, Vite, and Tailwind CSS. No backend, API calls, or auth yet —
everything runs on local React state and is structured to make wiring
up a real backend in Phase 2 straightforward.

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## Project structure

```
src/
  App.jsx                 top-level state: theme, active chat, messages
  index.css                Tailwind layers + base styles (focus rings,
                            scrollbars, the "dogear" signature motif)
  components/
    Sidebar.jsx            logo, New chat, scrollable history, fixed Login
    NewChatButton.jsx
    ChatHistoryItem.jsx
    LoginButton.jsx
    ThemeToggle.jsx        light/dark switch (UI only for now)
    ChatPage.jsx            header + messages + input, for the main pane
    ChatMessages.jsx        scrollable message list + empty/welcome state
    MessageBubble.jsx       user (right) / assistant (left) bubbles
    ChatInput.jsx           auto-growing textarea, Enter to send
```

## Design notes

The identity is "Stacks" — a nod to library stacks / document stacks,
since this is a chatbot that retrieves answers from a pile of uploaded
documents. The palette is warm paper and deep ink with a single gold
accent standing in for "retrieval." AI messages and history entries
carry a small folded-corner (`dogear`) detail, like an index card —
the one recurring signature element, used sparingly.

Dark mode is class-based (`darkMode: 'class'` in `tailwind.config.js`)
and toggled by adding/removing `dark` on `<html>`; `App.jsx` holds that
state today, ready to swap for a persisted preference later.

## What's stubbed for Phase 2

- Chat history in `Sidebar.jsx` is a hardcoded list (`DUMMY_HISTORY`).
- Sending a message in `App.jsx` appends the user's text locally and
  fakes an assistant reply after a short delay — swap that block for a
  real API call.
- `LoginButton.jsx` and `ThemeToggle.jsx` are UI-only.
