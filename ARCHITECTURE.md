# Architecture

## Core model

Task = atomic execution unit

Attributes (future):
- text
- done
- priority (urgent / important)
- recurrence
- reminder
- createdAt

---

## Flow

User message → handler → session/db → checklist render

Bot is event-driven.
Handlers must stay stateless.
Persistence is abstracted from handlers.

---

## Layers

Transport: Telegram / grammy
Application: handlers
Domain: task model
Infrastructure: DB / scheduler

---

## Principles

- Chat-first UX
- Minimal commands
- Inline actions over menus
- State in session → DB later
- Handlers must be composable

---

## Future architecture

Bot → API layer → Worker (scheduler) → DB

Reminder engine must be external to bot runtime.
