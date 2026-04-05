import { describe, it, expect } from 'vitest'
import { ROLES, ROLE_KEYS, EXPERIENCE_OPTIONS, getRoleByLabel } from '../src/config/roles.js'
import { SCORING } from '../src/config/scoring.js'
import { MESSAGES } from '../src/config/messages.js'

describe('roles config', () => {
    it('has all 8 roles defined', () => {
        expect(ROLE_KEYS).toHaveLength(8)
        for (const key of ROLE_KEYS) {
            expect(ROLES[key]).toBeDefined()
        }
    })

    it('every role has en and ru labels', () => {
        for (const key of ROLE_KEYS) {
            const role = ROLES[key]
            expect(role.label.en).toBeTruthy()
            expect(role.label.ru).toBeTruthy()
        }
    })

    it('every role has a scenario question in both languages', () => {
        for (const key of ROLE_KEYS) {
            const role = ROLES[key]
            expect(role.scenarioQuestion.en).toBeTruthy()
            expect(role.scenarioQuestion.ru).toBeTruthy()
        }
    })

    it('every role has a team fact in both languages', () => {
        for (const key of ROLE_KEYS) {
            const role = ROLES[key]
            expect(role.teamFact.en).toBeTruthy()
            expect(role.teamFact.ru).toBeTruthy()
        }
    })

    it('every role has experience weights for all options', () => {
        for (const key of ROLE_KEYS) {
            const role = ROLES[key]
            for (const exp of EXPERIENCE_OPTIONS) {
                expect(role.experienceWeights[exp]).toBeDefined()
                expect(role.experienceWeights[exp]).toBeGreaterThanOrEqual(0)
                expect(role.experienceWeights[exp]).toBeLessThanOrEqual(20)
            }
        }
    })

    it('non-other roles have stack keywords', () => {
        for (const key of ROLE_KEYS) {
            if (key === 'other') continue
            expect(ROLES[key].stackKeywords.length).toBeGreaterThan(0)
        }
    })
})

describe('getRoleByLabel', () => {
    it('finds role by English label', () => {
        expect(getRoleByLabel('Frontend')).toBe('frontend')
        expect(getRoleByLabel('Backend')).toBe('backend')
        expect(getRoleByLabel('QA')).toBe('qa')
    })

    it('finds role by Russian label', () => {
        expect(getRoleByLabel('Фронтенд')).toBe('frontend')
        expect(getRoleByLabel('Бэкенд')).toBe('backend')
    })

    it('is case-insensitive', () => {
        expect(getRoleByLabel('frontend')).toBe('frontend')
        expect(getRoleByLabel('BACKEND')).toBe('backend')
    })

    it('returns undefined for unknown label', () => {
        expect(getRoleByLabel('Astronaut')).toBeUndefined()
    })
})

describe('scoring config', () => {
    it('weights sum to 100', () => {
        const { stackMatch, experienceFit, storyDepth, thinkingQuality, communication } = SCORING.weights
        expect(stackMatch + experienceFit + storyDepth + thinkingQuality + communication).toBe(100)
    })

    it('hot tier threshold is higher than decent', () => {
        expect(SCORING.tiers.hot).toBeGreaterThan(SCORING.tiers.decent)
    })

    it('has specificity keywords', () => {
        expect(SCORING.heuristics.specificityKeywords.length).toBeGreaterThan(0)
    })

    it('has filler phrases', () => {
        expect(SCORING.heuristics.fillerPhrases.length).toBeGreaterThan(0)
    })

    it('min answer length is reasonable', () => {
        expect(SCORING.heuristics.minAnswerLength).toBeGreaterThan(0)
        expect(SCORING.heuristics.minAnswerLength).toBeLessThan(100)
    })
})

describe('messages config', () => {
    it('every message has en and ru', () => {
        for (const [key, value] of Object.entries(MESSAGES)) {
            expect(value.en, `${key}.en is empty`).toBeTruthy()
            expect(value.ru, `${key}.ru is empty`).toBeTruthy()
        }
    })

    it('has all required message keys', () => {
        const required = [
            'chooseLang', 'welcome', 'askRole', 'askExperience', 'askStack',
            'askProudProject', 'askScenario', 'completion', 'alreadyCompleted',
            'rateLimited', 'tooShort', 'buttonNudge', 'noCandidate',
            'errorMessage', 'nudgeTimeout', 'interestedNotification',
            'scheduleNotification', 'schedulePrompt', 'notePrompt',
        ]
        for (const key of required) {
            expect(MESSAGES).toHaveProperty(key)
        }
    })
})
