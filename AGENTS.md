# AGENTS.md

This repository contains a Telegram bot built with grammy.

## Context

DoneCraftBot is a checklist-based task manager.
Primary UX is message → checklist.

---

## Coding rules

- Use TypeScript strict mode
- Prefer pure functions
- Avoid business logic inside handlers
- Validate external data with zod
- Keep handlers small and composable

---

## When adding features

1. Extend domain model first
2. Update session type
3. Add handler
4. Add localization
5. Update README roadmap

---

## Naming

Handlers: registerXHandlers
Domain: noun-based
Functions: verb-based

---

## Anti-patterns

- fat handlers
- hidden state
- implicit session mutations
- mixing transport & domain logic

---

## Recurrence engine (future)

Must be implemented outside bot process.
Use queue or scheduler.