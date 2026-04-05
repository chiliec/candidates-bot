import { describe, it, expect } from 'vitest'
import {
    computeStackMatch,
    computeExperienceFit,
    computeStoryDepth,
    computeThinkingQuality,
    computeCommunication,
    computeScore,
    getTier,
} from '../src/services/scoring.js'

describe('computeStackMatch', () => {
    it('returns 25 for 3+ keyword matches', () => {
        expect(computeStackMatch('React, TypeScript, Next.js, Tailwind', 'frontend')).toBe(25)
    })

    it('returns 15 for 2 keyword matches', () => {
        expect(computeStackMatch('React, TypeScript', 'frontend')).toBe(15)
    })

    it('returns 8 for 1 keyword match', () => {
        expect(computeStackMatch('React', 'frontend')).toBe(8)
    })

    it('returns 0 for no matches', () => {
        expect(computeStackMatch('Java, Spring Boot', 'frontend')).toBe(0)
    })

    it('is case-insensitive', () => {
        expect(computeStackMatch('REACT, TYPESCRIPT, NEXTJS', 'frontend')).toBe(25)
    })

    it('returns neutral score for "other" role with no keywords', () => {
        expect(computeStackMatch('anything', 'other')).toBe(12)
    })

    it('matches backend keywords correctly', () => {
        expect(computeStackMatch('Node.js, Express, PostgreSQL, Redis', 'backend')).toBe(25)
    })

    it('cross-role mismatch gives low score', () => {
        expect(computeStackMatch('Figma, Sketch, UI/UX', 'backend')).toBe(0)
    })
})

describe('computeExperienceFit', () => {
    it('gives max score for senior frontend', () => {
        expect(computeExperienceFit('5+', 'frontend')).toBe(20)
    })

    it('gives mid score for junior frontend', () => {
        expect(computeExperienceFit('1-3', 'frontend')).toBe(10)
    })

    it('gives low score for beginner', () => {
        expect(computeExperienceFit('<1', 'frontend')).toBe(5)
    })

    it('gives 3-5 years full score', () => {
        expect(computeExperienceFit('3-5', 'backend')).toBe(20)
    })

    it('returns default for unknown experience value', () => {
        expect(computeExperienceFit('unknown', 'frontend')).toBe(10)
    })
})

describe('computeStoryDepth', () => {
    it('returns 0 for very short text', () => {
        expect(computeStoryDepth('I code')).toBe(0)
    })

    it('returns low score for minimal text', () => {
        const text = 'I built a small website.'
        const score = computeStoryDepth(text)
        expect(score).toBeGreaterThan(0)
        expect(score).toBeLessThanOrEqual(25)
    })

    it('returns higher score for detailed text with specificity keywords', () => {
        const text = 'I built and shipped a real-time dashboard that optimized query performance. Reduced latency from 4s to 800ms for 50k daily users. Debugged race conditions in the WebSocket layer.'
        const score = computeStoryDepth(text)
        expect(score).toBeGreaterThanOrEqual(20)
    })

    it('penalizes filler phrases', () => {
        const withFiller = 'I am a hard worker and team player who is passionate about building software for users in production.'
        const withoutFiller = 'I built a production system for users that handles real traffic and serves thousands of requests.'
        expect(computeStoryDepth(withoutFiller)).toBeGreaterThan(computeStoryDepth(withFiller))
    })

    it('scores medium-length text in middle range', () => {
        const text = 'Built a REST API with Node.js and PostgreSQL that handles user authentication and data processing.'
        const score = computeStoryDepth(text)
        expect(score).toBeGreaterThan(5)
        expect(score).toBeLessThanOrEqual(25)
    })

    it('never exceeds max of 25', () => {
        const longText = 'I built, shipped, debugged, optimized, reduced, increased, deployed, designed, implemented, migrated, refactored, integrated, automated, and scaled a massive system serving millions of users with high requests per second and low latency achieving 99.99% uptime with full test coverage and excellent performance.'
        expect(computeStoryDepth(longText)).toBeLessThanOrEqual(25)
    })

    it('never goes below 0', () => {
        const fillerOnly = 'I am a hard worker and team player who is passionate about being a fast learner and self-motivated detail-oriented quick learner.'
        expect(computeStoryDepth(fillerOnly)).toBeGreaterThanOrEqual(0)
    })
})

describe('computeThinkingQuality', () => {
    it('returns 0 for very short answer', () => {
        expect(computeThinkingQuality('Check logs')).toBe(0)
    })

    it('scores structured thinking higher', () => {
        const good = 'First I would check the monitoring dashboard to identify which endpoints are slow. Then I would look at the database query logs to find slow queries. After that, I would implement caching for the most frequently accessed data and optimize the database indexes.'
        const score = computeThinkingQuality(good)
        expect(score).toBeGreaterThanOrEqual(10)
    })

    it('caps at 20', () => {
        const longAnswer = 'I would built shipped debugged optimized reduced the system, then implemented automated deployed integrated migrated refactored scaled everything with excellent performance and high uptime for millions of users handling thousands of requests per second.'
        expect(computeThinkingQuality(longAnswer)).toBeLessThanOrEqual(20)
    })
})

describe('computeCommunication', () => {
    it('gives base score for completing the flow', () => {
        const score = computeCommunication({}, '', '')
        expect(score).toBe(5) // base 50%
    })

    it('gives higher score for substantive answers', () => {
        const long = 'This is a substantive answer that goes into detail about the technical approach and implementation strategy for solving the problem at hand.'
        const score = computeCommunication({}, long, long)
        expect(score).toBeGreaterThan(5)
    })

    it('penalizes suspicious speed', () => {
        const times = { stack: 1, proudProject: 2, scenarioAnswer: 2 }
        const normal = { stack: 30, proudProject: 60, scenarioAnswer: 45 }
        const fast = computeCommunication(times, 'x'.repeat(60), 'x'.repeat(60))
        const normalScore = computeCommunication(normal, 'x'.repeat(60), 'x'.repeat(60))
        expect(fast).toBeLessThan(normalScore)
    })

    it('never exceeds 10', () => {
        const times = { stack: 60, proudProject: 120, scenarioAnswer: 90 }
        const long = 'x'.repeat(200)
        expect(computeCommunication(times, long, long)).toBeLessThanOrEqual(10)
    })

    it('never goes below 0', () => {
        const times = { a: 1, b: 1, c: 1 }
        expect(computeCommunication(times, '', '')).toBeGreaterThanOrEqual(0)
    })
})

describe('getTier', () => {
    it('returns hot for 70+', () => {
        expect(getTier(70)).toBe('hot')
        expect(getTier(100)).toBe('hot')
        expect(getTier(85)).toBe('hot')
    })

    it('returns decent for 40-69', () => {
        expect(getTier(40)).toBe('decent')
        expect(getTier(69)).toBe('decent')
        expect(getTier(55)).toBe('decent')
    })

    it('returns low for 0-39', () => {
        expect(getTier(0)).toBe('low')
        expect(getTier(39)).toBe('low')
        expect(getTier(20)).toBe('low')
    })
})

describe('computeScore (integration)', () => {
    it('scores a strong frontend candidate high', () => {
        const score = computeScore({
            stack: 'React, TypeScript, Next.js, Tailwind CSS, GraphQL',
            role: 'frontend',
            experience: '5+',
            proudProject: 'I built and shipped a real-time analytics dashboard for a logistics company. It handles 50k daily active users with WebSocket-based live updates. I optimized the rendering pipeline and reduced initial page load from 4 seconds to 800ms using code splitting and lazy loading.',
            scenarioAnswer: 'First, I would profile the page using Chrome DevTools and Lighthouse to identify the bottleneck. I would check if it is a rendering issue, large bundle size, or excessive re-renders. Then I would implement virtualization for lists, optimize images, and consider server-side rendering for the critical path. I would also check if we can use a CDN for static assets.',
            answerTimes: { stack: 15, proudProject: 90, scenarioAnswer: 75 },
        })

        expect(score.total).toBeGreaterThanOrEqual(70)
        expect(score.stackMatch).toBe(25)
        expect(score.experienceFit).toBe(20)
    })

    it('scores a weak candidate low', () => {
        const score = computeScore({
            stack: 'everything',
            role: 'backend',
            experience: '<1',
            proudProject: 'I am a hard worker and team player',
            scenarioAnswer: 'I would fix the problem quickly.',
            answerTimes: { stack: 2, proudProject: 3, scenarioAnswer: 2 },
        })

        expect(score.total).toBeLessThan(40)
        expect(score.stackMatch).toBe(0)
    })

    it('scores a mid-level candidate in decent range', () => {
        const score = computeScore({
            stack: 'Python, Django, PostgreSQL',
            role: 'backend',
            experience: '3-5',
            proudProject: 'Built a REST API for an e-commerce platform that handles product catalog, user accounts, and order processing. Used Django REST Framework with PostgreSQL.',
            scenarioAnswer: 'I would check the application logs first, then look at database query performance. Maybe add some caching with Redis for frequently accessed endpoints.',
            answerTimes: { stack: 20, proudProject: 45, scenarioAnswer: 40 },
        })

        expect(score.total).toBeGreaterThanOrEqual(40)
        expect(score.total).toBeLessThanOrEqual(100)
    })

    it('handles missing fields gracefully', () => {
        const score = computeScore({
            answerTimes: {},
        })

        expect(score.total).toBeGreaterThanOrEqual(0)
        expect(score.stackMatch).toBeGreaterThanOrEqual(0)
    })
})
