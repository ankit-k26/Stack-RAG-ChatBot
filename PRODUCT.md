# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite (client), Express (server). Existing codebase.

## Users

Individual knowledge workers — researchers, students, and writers — who want to interrogate their own documents privately, in their own environment, without their data leaving their machine.

## Product Purpose

Stacks is a document-grounded RAG chatbot. You upload a document, then ask it questions. It answers from the document's content and is honest when it cannot — it explicitly says so when no document has been uploaded, or when the document doesn't contain the answer. Authenticated users get their conversation history saved; guests get the same full experience, just ephemeral.

## Positioning

Three things simultaneously: radical honesty (it never hallucinates; it says when the answer isn't there), full local/private execution (Ollama + Qdrant — no data leaves the machine), and frictionless guest mode (works instantly without signing up). No neighboring product can truthfully claim all three.

## Operating Context

- A user uploads one document per session (PDF, DOCX, or plain text).
- They ask natural-language questions about it in a chat interface.
- The app retrieves relevant chunks via vector similarity (Qdrant + qwen3-embedding:0.6b) and passes them to a local LLM (gemma4:31b-cloud via Ollama) for grounded answer generation.
- Logged-in users can browse, rename, and delete past conversations from a sidebar.
- Guest sessions are held only in server memory; nothing is written to disk.
- The app runs locally on a developer/researcher's machine with Docker for Qdrant and MongoDB.

## Capabilities and Constraints

- One document per session; uploading a new one replaces the previous.
- Supported formats: PDF, DOCX, plain text. Max upload: 20 MB.
- Auth: email or username login, bcrypt-hashed passwords, server-side sessions via httpOnly cookie.
- No admin UI yet (isAdmin field exists on User, not wired up).
- No document re-hydration after server restart — retrieval context is lost; messages and filename still display.
- Multiple documents per session: not yet implemented (roadmap).
- Guest access gating behind login: optional, not yet implemented.

## Brand Commitments

Name: **Stacks**. No existing visual identity, color palette, logo, or typography constraints — design direction is fully open.

## Evidence on Hand

- Full README with architecture diagram, API reference, and troubleshooting guide.
- Working codebase: React + Vite frontend, Express backend, MongoDB (auth + history), Qdrant (vectors), Ollama (local models).
- No existing design system, marketing copy, testimonials, or press.

## Product Principles

1. **Honest by default.** The product never invents an answer. Silence and "I don't know" are first-class responses.
2. **Private by design.** Data stays local. No account required to use the full capability.
3. **Zero friction to value.** A guest can upload a document and get a grounded answer in seconds, with no sign-up wall.
4. **Earned trust over decoration.** UI confidence comes from accuracy and transparency, not from visual noise or marketing language.
5. **Depth for the committed user.** The logged-in experience — history, rename, delete — rewards users who engage regularly, without penalizing those who don't.
