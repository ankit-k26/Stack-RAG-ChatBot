# Stacks — client

The React + Vite + Tailwind frontend. See the top-level README for how
this fits together with `server/`.

## Getting started

```bash
npm install
cp .env.example .env   # only needed if the backend isn't on localhost:3001
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## Project structure

```
src/
  App.jsx                 top-level state: session, messages, document status
  lib/api.js               fetch wrappers for the backend's session/upload/chat routes
  index.css                Tailwind layers + base styles (focus rings,
                            scrollbars, the "dogear" signature motif)
  components/
    Sidebar.jsx            logo, New chat, scrollable history, fixed Login
    NewChatButton.jsx
    ChatHistoryItem.jsx
    LoginButton.jsx
    ThemeToggle.jsx        light/dark switch (UI only for now)
    ChatPage.jsx            header + document status + messages + input
    DocumentStatus.jsx      "no document" / "indexing…" / "indexed X" bar
    ChatMessages.jsx        scrollable message list, empty state, typing indicator
    MessageBubble.jsx       user (right) / assistant (left) / system bubbles
    ChatInput.jsx           auto-growing textarea + attach-file + send buttons
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

## What's still a placeholder

- Chat history in `Sidebar.jsx` is a hardcoded list (`DUMMY_HISTORY`) —
  selecting an entry highlights it but doesn't load saved messages yet.
- `LoginButton.jsx` is UI-only.
