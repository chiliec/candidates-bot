# Candidate Screening Bot — Full Redesign

**Date:** 2026-04-03
**Status:** Design approved
**Approach:** Branching flow + rule-based scoring (no LLM)

## Summary

Redesign the Axveer candidate Telegram bot from a simple 4-question form into a smart, fun screening tool that:

- Feels like chatting with a cool teammate (2-3 min)
- Shadow-scores every candidate (0-100) without rejecting anyone
- Showcases real Axveer team members and projects during the flow
- Delivers prioritized, richly-formatted candidate cards to admins in Telegram
- Gives admins one-tap actions (interested / pass / schedule / note)
- Works in English and Russian
- Scales to 200 candidates/month with zero manual triage

## 1. Candidate Conversation Flow

Four phases, one smooth chat:

### Phase 1 — Welcome & Language (~10 sec)

- Candidate sends `/start`
- Bot shows language picker: 🇬🇧 English / 🇷🇺 Русский (inline buttons)
- Warm greeting sets casual tone: "Hey! Cool that you found us 🤙"

### Phase 2 — The Basics (~30 sec)

- **Role** (buttons): Frontend, Backend, Mobile, Fullstack, QA, DevOps, Design, Other
- **Experience** (buttons): <1 year, 1-3, 3-5, 5+
- **Tech stack** (free text): one message, whatever they type

### Phase 3 — The Real Questions (~60-90 sec)

Two free-text questions designed to extract genuine signal:

**Question 1 (all roles):** "Tell us about something you built that you're proud of"

- Real devs light up here. Generic/AI answers are obvious.

**Question 2 (role-specific scenario):** No right answer, reveals thinking process.

| Role | Scenario Question (EN) |
|------|----------------------|
| Frontend | "You get a design that's gorgeous but slow to render. What do you do?" |
| Backend | "Your API starts timing out under load. Walk us through your first moves." |
| Mobile | "The app crashes only on certain devices in production. How do you hunt it down?" |
| Fullstack | "The frontend team says the API is too slow. The backend team says the frontend makes too many requests. You're in the middle. What's your move?" |
| QA | "You find a critical bug 2 hours before release. What's your play?" |
| DevOps | "Deployment pipeline breaks at 2am and the on-call dev is unreachable. What do you do?" |
| Design | "The PM wants a feature that's fast to build. The users want something beautiful. You have a week. How do you approach it?" |
| Other | "Tell us about a tough technical problem you solved and how you approached it." |

**Team showcase moment** — between Q1 and Q2, bot drops a role-relevant team fact (see Section 5).

### Phase 4 — Wrap & Sell (~20 sec)

- Link to Axveer website/team page
- Friendly close: "We'll check this out and get back to you soon. Welcome aboard the process 🤙"

**Total time: ~2-3 minutes.**

## 2. Shadow Scoring System

Every candidate gets a score from 0-100, computed automatically. Candidates never see their score.

### Dimensions

| Dimension | Max Points | What It Measures | Method |
|-----------|-----------|-----------------|--------|
| Stack Match | 25 | Relevant tech for the role | Keyword matching against per-role dictionary |
| Experience Fit | 20 | Seniority matches hiring needs | Config-driven weights per experience level per role |
| Story Depth | 25 | Real project vs. fluff | Heuristics: answer length, specific details (numbers, tech names, action verbs), absence of filler phrases |
| Thinking Quality | 20 | Structured approach to scenario | Same heuristics: mentions tradeoffs, considers multiple angles, structured thinking |
| Communication | 10 | Clear writing ability | Response length ratio (not too short, not a wall), response time signal |

### Tiers

| Tier | Score Range | Admin Display |
|------|-----------|---------------|
| 🔥 Hot | 70-100 | Review ASAP |
| 👍 Decent | 40-69 | Worth a look |
| 🤷 Low | 0-39 | Review when you have time |

### Scoring Heuristics Detail

**Stack Match (0-25):**
- Each role has a `stackKeywords` list in config
- Count keyword matches in candidate's stack answer (case-insensitive)
- 0 matches = 0pts, 1 = 8pts, 2 = 15pts, 3+ = 25pts

**Experience Fit (0-20):**
- Per-role config maps experience levels to points
- Example: Frontend hiring for seniors → "5+" = 20, "3-5" = 20, "1-3" = 10, "<1" = 5

**Story Depth (0-25):**
- Length score: <20 chars = 0, 20-50 = 5, 50-150 = 15, 150+ = 20
- Specificity bonus (up to +5): +1 per specificity keyword found (built, shipped, debugged, optimized, reduced, users, requests, etc.)
- Filler penalty: -5 per filler phrase detected ("I am a hard worker", "team player", "passionate about")
- Clamped to 0-25

**Thinking Quality (0-20):**
- Same length + specificity heuristics as Story Depth, scaled to 0-20
- Applied to scenario answer

**Communication (0-10):**
- Response time signal: all answers in <15 seconds total → -3 (suspicious copy-paste)
- Answer length balance: at least 2 answers > 50 chars → +5
- Base 5 points for completing the flow

### Design Principles

- No hard cutoffs — everyone gets through, just ranked
- Scoring config is a JSON file — tweak weights/keywords/thresholds without code changes
- Score breakdown is transparent to admins — they see per-dimension scores, not just total
- Anti-gaming: response time tracking as a signal, not a hard rule

## 3. Admin Notifications

### Format: Full Card

Every completed candidate triggers a Telegram message to all admin IDs:

```
🔥 New Candidate — Score: 78/100

@ivan_dev · Frontend · 3-5 years

━━ Score Breakdown ━━
Stack: 22/25 · Exp: 20/20 · Story: 15/25 · Think: 16/20 · Comms: 5/10

━━ Stack ━━
React, TypeScript, Next.js, Tailwind, GraphQL

━━ Proud Project ━━
"Built a real-time dashboard for logistics company..."

━━ Scenario Answer ━━
"First I'd profile with Lighthouse, check bundle size..."

[👍 Interested] [👎 Pass] [📅 Schedule] [💬 Note]
```

Tier emoji (🔥/👍/🤷) displayed based on score.

### Returning Candidates

If a candidate has a previous submission:
```
↩️ Returning candidate — previous score: 45
```
Appended to the card header.

## 4. Admin Actions

All actions are inline keyboard buttons on the candidate card.

### 👍 Interested
- Sets `status: interested` in DB
- Sends candidate: "Hey! Our team liked your profile. Someone will reach out to you soon 🤙"
- Confirms to admin: "✅ @ivan_dev marked as interested, candidate notified"

### 👎 Pass
- Sets `status: passed` in DB
- No message sent to candidate (silent pass)
- Confirms to admin: "✅ @ivan_dev passed"

### 📅 Schedule
- Bot prompts admin: "Send @ivan_dev a scheduling link? Reply with a URL or message"
- Admin replies with text/link (bot tracks pending action per admin via in-memory map keyed by adminId; next text message from that admin within 5 minutes is treated as the reply)
- Bot forwards to candidate: "Great news! The team wants to talk. Here's a link to pick a time: [link]"
- Sets `status: scheduled` in DB
- If admin doesn't reply within 5 minutes, pending action expires silently

### 💬 Note
- Bot prompts: "Write a note about @ivan_dev"
- Admin replies with text (same pending-action mechanism as Schedule — next message within 5 minutes)
- Note attached to candidate record with admin ID and timestamp
- Visible to all admins on subsequent views

### Principles
- Every action gives instant feedback to the admin
- Actions are idempotent — tapping "Interested" twice doesn't send two messages to the candidate
- Status can be changed (interested → scheduled, etc.)

## 5. Team Showcase

Between the "proud project" question and the scenario question, the bot sends one role-relevant team fact.

### Rules
- One fact per conversation — not a sales pitch
- Real names, real projects — feels human
- Stored in `config/roles.ts` — easy to update
- Tone: casual flex — confident but not arrogant

### Examples

| Role | Team Fact (EN) |
|------|---------------|
| Frontend | "Fun fact — our frontend crew recently shipped a real-time logistics dashboard handling 50k daily users. You'd fit right in 👀" |
| Mobile | "Our iOS team is Maksim, Sergei, and Vadim — they're deep into macOS and iOS apps. Tight crew." |
| Backend | "Yauheni on our backend team is a .NET beast who built microservices handling millions of transactions. Just so you know what level we play at 😏" |
| QA | "Denis and Pavel from our QA team specialize in healthcare — if you're into regulated, high-stakes testing, you'll love it here." |
| DevOps | "We take infra seriously — IaC, CI/CD, security compliance. Not just 'push to prod and pray.'" |
| Design | "Ksu, our CCO, leads the creative direction — design here isn't an afterthought, it's core to everything." |
| Fullstack | "Nikolay on our team does full-stack with self-hosted solutions and AI integration. If you like owning the whole stack, you're in good company." |

Each fact also has an `ru` translation in config.

## 6. Data Model

### Candidate Schema

```typescript
class Candidate {
  // Identity
  telegramId: number            // unique, indexed
  username?: string             // @handle
  firstName?: string            // from Telegram profile
  language: 'en' | 'ru'        // chosen at start

  // Flow state
  step: number                  // current question index (0-based)
  completed: boolean            // all questions answered

  // Answers
  role: string                  // "Frontend", "Backend", etc.
  experience: string            // "<1", "1-3", "3-5", "5+"
  stack: string                 // free text
  proudProject: string          // free text
  scenarioAnswer: string        // free text (role-specific)

  // Scoring
  score: {
    stackMatch: number          // 0-25
    experienceFit: number       // 0-20
    storyDepth: number          // 0-25
    thinkingQuality: number     // 0-20
    communication: number       // 0-10
    total: number               // 0-100
  }
  tier: 'hot' | 'decent' | 'low'

  // Admin workflow
  status: 'new' | 'interested' | 'scheduled' | 'passed' | 'abandoned'
  adminNotes: Array<{
    adminId: number
    text: string
    createdAt: Date
  }>
  notifiedAt?: Date             // when admin card was sent

  // Timing signals
  startedAt: Date               // when /start was pressed
  completedAt?: Date            // when last answer submitted
  answerTimes: Record<string, number>  // seconds per question

  // Archived (for returning candidates)
  archivedSubmissions: Array<{
    role: string
    experience: string
    stack: string
    proudProject: string
    scenarioAnswer: string
    score: { stackMatch: number; experienceFit: number; storyDepth: number; thinkingQuality: number; communication: number; total: number }
    completedAt: Date
  }>

  // Flags
  suspiciousBot: boolean        // all answers in <15 seconds total
  restartCount: number          // /start count in last 24h (for rate limiting)
  lastRestartAt?: Date          // timestamp of last /start

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

### Changes from Current Model
- Explicit typed answer fields instead of generic `answers: Record<string, string>`
- Score object with per-dimension breakdown
- Status workflow for admin decisions
- Answer timing captured per question
- Language moved to Candidate
- `User` model dropped (not needed; reintroduce if user preferences grow beyond language)

### Archived Submissions
When a returning candidate sends `/start`, the current submission is copied to an `archivedSubmissions` array before reset. Admins see "Returning candidate — previous score: X" on the new card.

## 7. Configuration Architecture

All tunable values live in config files, not code.

### config/roles.ts

Per-role configuration: labels, keywords, questions, team facts, experience weights.

```typescript
interface RoleConfig {
  label: { en: string; ru: string }
  stackKeywords: string[]
  scenarioQuestion: { en: string; ru: string }
  teamFact: { en: string; ru: string }
  experienceWeights: Record<string, number>  // "<1" | "1-3" | "3-5" | "5+"
}
```

Adding a new role = add one object. Zero code changes.

### config/scoring.ts

Weights, thresholds, heuristic parameters.

```typescript
interface ScoringConfig {
  weights: { stackMatch: number; experienceFit: number; storyDepth: number; thinkingQuality: number; communication: number }
  tiers: { hot: number; decent: number }
  heuristics: {
    minAnswerLength: number       // 20 chars
    goodAnswerLength: number      // 150 chars
    specificityKeywords: string[] // ["built", "shipped", "debugged", ...]
    fillerPhrases: string[]       // ["team player", "passionate about", ...]
    suspiciousSpeed: number       // 5 seconds
  }
}
```

### config/messages.ts

All user-facing bot copy in EN and RU.

```typescript
interface Messages {
  welcome: { en: string; ru: string }
  askRole: { en: string; ru: string }
  askExperience: { en: string; ru: string }
  askStack: { en: string; ru: string }
  askProudProject: { en: string; ru: string }
  completion: { en: string; ru: string }
  alreadyCompleted: { en: string; ru: string }
  rateLimited: { en: string; ru: string }
  tooShort: { en: string; ru: string }
  nudge: { en: string; ru: string }
  interestedNotification: { en: string; ru: string }
  scheduleNotification: { en: string; ru: string }
  // ... all messages
}
```

## 8. Anti-Spam & Edge Cases

### Rate Limiting
- Max 3 `/start` restarts per 24 hours per telegramId
- After limit: "You've already started a few times today. Come back tomorrow with fresh eyes 😉"

### Input Validation
- Free-text answers: minimum 20 characters, maximum 2000 characters (truncated silently)
- Empty/whitespace-only answers rejected with nudge
- Commands mid-flow (`/help`, `/whatever`) ignored; bot re-sends current question

### Duplicate / Returning Candidates
- Completed candidate sends `/start` → previous submission archived, new flow starts fresh
- Admin card shows "Returning candidate — previous score: X"
- Previous submissions preserved in DB, not overwritten

### Conversation Timeout
- Implemented via a periodic check (cron job or bot startup sweep): scan for candidates where `completed === false` and `updatedAt` exceeds threshold
- 24 hours of inactivity → gentle nudge: "Still there? You were doing great. Pick up where you left off 👇" with current question repeated
- 72 hours → marked as `status: abandoned`, no further nudges
- State persists indefinitely — returning after weeks continues from saved step (candidate can always resume or restart with `/start`)

### Bot Detection (Lightweight)
- If all answers arrive within 15 seconds total → `suspiciousBot` flag on admin card
- Not blocked, just flagged — admins decide

### Error Handling
- DB connection failure → "Oops, something hiccupped on our end. Try again in a minute?"
- Unknown callback data → ignored silently
- Bot restart mid-conversation → candidate continues from saved step (DB-backed state)
- Admin notification failure → logged, does not block candidate experience

## Architecture Overview

```
Telegram User ──► grammy Bot
                      │
                      ├── handlers/flow.ts     ── conversation orchestration
                      ├── handlers/admin.ts    ── admin action callbacks
                      ├── services/scoring.ts  ── score computation
                      ├── services/notify.ts   ── admin card formatting + sending
                      │
                      ├── config/roles.ts      ── role definitions
                      ├── config/scoring.ts    ── scoring parameters
                      ├── config/messages.ts   ── all i18n copy
                      │
                      └── models/Candidate.ts  ── MongoDB via typegoose
```

No external APIs. No LLM calls. Pure configuration-driven branching with heuristic scoring. The entire system runs on a single process with grammy runner + MongoDB.

### Step Mapping

The `step` field maps to conversation phases:

| Step | Phase | Action |
|------|-------|--------|
| 0 | Language | Show language picker |
| 1 | Role | Show role buttons |
| 2 | Experience | Show experience buttons |
| 3 | Stack | Ask for tech stack (free text) |
| 4 | Proud Project | Ask about a project they built (free text) |
| 5 | Team Fact + Scenario | Send team fact, then ask role-specific scenario (free text) |
| 6 | Complete | Calculate score, send completion message, notify admins |
