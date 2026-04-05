import { SCORING, type ScoreBreakdown, type Tier } from '../config/scoring.js'
import { ROLES, type RoleKey } from '../config/roles.js'

const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val))

export function computeStackMatch(stack: string, roleKey: RoleKey): number {
    const role = ROLES[roleKey]
    if (!role || role.stackKeywords.length === 0) return 12 // neutral for "other"

    const lower = stack.toLowerCase()
    let matches = 0
    for (const kw of role.stackKeywords) {
        if (lower.includes(kw.toLowerCase())) matches++
    }

    if (matches === 0) return 0
    if (matches === 1) return 8
    if (matches === 2) return 15
    return SCORING.weights.stackMatch // 25
}

export function computeExperienceFit(experience: string, roleKey: RoleKey): number {
    const role = ROLES[roleKey]
    if (!role) return 10
    return role.experienceWeights[experience] ?? 10
}

function computeTextScore(text: string, maxPoints: number): number {
    const { minAnswerLength, goodAnswerLength, specificityKeywords, fillerPhrases } = SCORING.heuristics
    const len = text.trim().length
    const lower = text.toLowerCase()

    // Length score (proportional to max)
    let lengthScore: number
    if (len < minAnswerLength) lengthScore = 0
    else if (len < 50) lengthScore = maxPoints * 0.2
    else if (len < goodAnswerLength) lengthScore = maxPoints * 0.6
    else lengthScore = maxPoints * 0.8

    // Specificity bonus
    let specificityBonus = 0
    for (const kw of specificityKeywords) {
        if (lower.includes(kw.toLowerCase())) specificityBonus++
    }
    specificityBonus = Math.min(specificityBonus, Math.ceil(maxPoints * 0.2))

    // Filler penalty
    let fillerPenalty = 0
    for (const phrase of fillerPhrases) {
        if (lower.includes(phrase.toLowerCase())) fillerPenalty += Math.ceil(maxPoints * 0.2)
    }

    return clamp(Math.round(lengthScore + specificityBonus - fillerPenalty), 0, maxPoints)
}

export function computeStoryDepth(text: string): number {
    return computeTextScore(text, SCORING.weights.storyDepth)
}

export function computeThinkingQuality(text: string): number {
    return computeTextScore(text, SCORING.weights.thinkingQuality)
}

export function computeCommunication(
    answerTimes: Record<string, number>,
    proudProject: string,
    scenarioAnswer: string,
): number {
    const max = SCORING.weights.communication
    let score = Math.round(max * 0.5) // base for completing

    // Length balance: at least 2 substantive answers
    const substantive = [proudProject, scenarioAnswer].filter(a => (a?.trim().length ?? 0) > 50)
    if (substantive.length >= 2) score += Math.round(max * 0.3)

    // Suspicious speed check
    const times = Object.values(answerTimes)
    if (times.length > 0) {
        const total = times.reduce((sum, t) => sum + t, 0)
        if (total < SCORING.heuristics.suspiciousSpeedTotal) {
            score -= 3
        } else {
            score += Math.round(max * 0.2)
        }
    }

    return clamp(score, 0, max)
}

export function getTier(total: number): Tier {
    if (total >= SCORING.tiers.hot) return 'hot'
    if (total >= SCORING.tiers.decent) return 'decent'
    return 'low'
}

export function computeScore(candidate: {
    stack?: string
    role?: string
    experience?: string
    proudProject?: string
    scenarioAnswer?: string
    answerTimes: Record<string, number>
}): ScoreBreakdown {
    const roleKey = (candidate.role?.toLowerCase() ?? 'other') as RoleKey
    const stackMatch = computeStackMatch(candidate.stack ?? '', roleKey)
    const experienceFit = computeExperienceFit(candidate.experience ?? '', roleKey)
    const storyDepth = computeStoryDepth(candidate.proudProject ?? '')
    const thinkingQuality = computeThinkingQuality(candidate.scenarioAnswer ?? '')
    const communication = computeCommunication(
        candidate.answerTimes,
        candidate.proudProject ?? '',
        candidate.scenarioAnswer ?? '',
    )

    return {
        stackMatch,
        experienceFit,
        storyDepth,
        thinkingQuality,
        communication,
        total: stackMatch + experienceFit + storyDepth + thinkingQuality + communication,
    }
}
