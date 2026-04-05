import { describe, it, expect } from 'vitest'
import { buildAdminCard, buildAdminKeyboard } from '../src/services/notify.js'

function makeCandidate(overrides: Record<string, any> = {}) {
    return {
        telegramId: 123456,
        username: 'ivan_dev',
        firstName: 'Ivan',
        language: 'en',
        role: 'Frontend',
        experience: '3-5',
        stack: 'React, TypeScript, Next.js',
        proudProject: 'Built a real-time dashboard for logistics.',
        scenarioAnswer: 'I would profile with Lighthouse first.',
        score: {
            stackMatch: 22,
            experienceFit: 20,
            storyDepth: 15,
            thinkingQuality: 16,
            communication: 5,
            total: 78,
        },
        tier: 'hot',
        status: 'new',
        suspiciousBot: false,
        archivedSubmissions: [],
        adminNotes: [],
        ...overrides,
    } as any
}

describe('buildAdminCard', () => {
    it('includes tier emoji and score', () => {
        const card = buildAdminCard(makeCandidate())
        expect(card).toContain('🔥')
        expect(card).toContain('78/100')
    })

    it('shows username', () => {
        const card = buildAdminCard(makeCandidate())
        expect(card).toContain('@ivan_dev')
    })

    it('falls back to telegramId when no username', () => {
        const card = buildAdminCard(makeCandidate({ username: undefined }))
        expect(card).toContain('#123456')
    })

    it('shows score breakdown', () => {
        const card = buildAdminCard(makeCandidate())
        expect(card).toContain('Stack: 22/25')
        expect(card).toContain('Exp: 20/20')
        expect(card).toContain('Story: 15/25')
        expect(card).toContain('Think: 16/20')
        expect(card).toContain('Comms: 5/10')
    })

    it('shows role and experience', () => {
        const card = buildAdminCard(makeCandidate())
        expect(card).toContain('Frontend')
        expect(card).toContain('3-5')
    })

    it('shows stack, proud project, and scenario answer', () => {
        const card = buildAdminCard(makeCandidate())
        expect(card).toContain('React, TypeScript, Next.js')
        expect(card).toContain('real-time dashboard')
        expect(card).toContain('Lighthouse')
    })

    it('shows suspicious bot flag', () => {
        const card = buildAdminCard(makeCandidate({ suspiciousBot: true }))
        expect(card).toContain('⚠️')
        expect(card).toContain('Suspiciously fast')
    })

    it('does not show suspicious flag for normal candidates', () => {
        const card = buildAdminCard(makeCandidate({ suspiciousBot: false }))
        expect(card).not.toContain('⚠️')
    })

    it('shows returning candidate info', () => {
        const card = buildAdminCard(
            makeCandidate({
                archivedSubmissions: [
                    { score: { total: 45 }, completedAt: new Date() },
                ],
            }),
        )
        expect(card).toContain('Returning candidate')
        expect(card).toContain('previous score: 45')
    })

    it('uses decent emoji for mid-tier', () => {
        const card = buildAdminCard(makeCandidate({ tier: 'decent' }))
        expect(card).toContain('👍')
    })

    it('uses low emoji for low tier', () => {
        const card = buildAdminCard(makeCandidate({ tier: 'low' }))
        expect(card).toContain('🤷')
    })

    it('escapes HTML in user content', () => {
        const card = buildAdminCard(
            makeCandidate({ stack: '<script>alert("xss")</script>' }),
        )
        expect(card).not.toContain('<script>')
        expect(card).toContain('&lt;script&gt;')
    })

    it('truncates very long answers', () => {
        const longText = 'x'.repeat(600)
        const card = buildAdminCard(makeCandidate({ proudProject: longText }))
        expect(card.length).toBeLessThan(longText.length + 500)
        expect(card).toContain('…')
    })
})

describe('buildAdminKeyboard', () => {
    it('creates keyboard with 4 action buttons', () => {
        const kb = buildAdminKeyboard('123456')
        const rows = kb.inline_keyboard
        expect(rows).toHaveLength(2) // 2 rows
        expect(rows[0]).toHaveLength(2) // interested, pass
        expect(rows[1]).toHaveLength(2) // schedule, note
    })

    it('encodes candidate ID in callback data', () => {
        const kb = buildAdminKeyboard('123456')
        const buttons = kb.inline_keyboard.flat()
        expect(buttons[0].callback_data).toBe('admin:interested:123456')
        expect(buttons[1].callback_data).toBe('admin:pass:123456')
        expect(buttons[2].callback_data).toBe('admin:schedule:123456')
        expect(buttons[3].callback_data).toBe('admin:note:123456')
    })

    it('has readable button labels', () => {
        const kb = buildAdminKeyboard('123456')
        const labels = kb.inline_keyboard.flat().map(b => b.text)
        expect(labels).toContain('👍 Interested')
        expect(labels).toContain('👎 Pass')
        expect(labels).toContain('📅 Schedule')
        expect(labels).toContain('💬 Note')
    })
})
