export interface ScoringConfig {
    weights: {
        stackMatch: number
        experienceFit: number
        storyDepth: number
        thinkingQuality: number
        communication: number
    }
    tiers: {
        hot: number
        decent: number
    }
    heuristics: {
        minAnswerLength: number
        goodAnswerLength: number
        specificityKeywords: string[]
        fillerPhrases: string[]
        suspiciousSpeedTotal: number
    }
}

export const SCORING: ScoringConfig = {
    weights: {
        stackMatch: 25,
        experienceFit: 20,
        storyDepth: 25,
        thinkingQuality: 20,
        communication: 10,
    },
    tiers: {
        hot: 70,
        decent: 40,
    },
    heuristics: {
        minAnswerLength: 20,
        goodAnswerLength: 150,
        specificityKeywords: [
            'built', 'shipped', 'debugged', 'optimized', 'reduced', 'increased',
            'deployed', 'designed', 'implemented', 'migrated', 'refactored',
            'integrated', 'automated', 'scaled', 'users', 'requests', 'rps',
            'latency', 'uptime', 'coverage', 'performance',
            // Russian equivalents
            'построил', 'запустил', 'отладил', 'оптимизировал', 'уменьшил',
            'увеличил', 'задеплоил', 'спроектировал', 'реализовал', 'мигрировал',
            'рефакторил', 'интегрировал', 'автоматизировал', 'масштабировал',
            'пользователей', 'запросов',
        ],
        fillerPhrases: [
            'i am a hard worker', 'team player', 'passionate about',
            'fast learner', 'self-motivated', 'detail-oriented',
            'quick learner', 'highly motivated', 'strong work ethic',
            // Russian equivalents
            'командный игрок', 'быстро учусь', 'мотивированный',
            'ответственный', 'стрессоустойчивый', 'коммуникабельный',
        ],
        suspiciousSpeedTotal: 15,
    },
}

export type Tier = 'hot' | 'decent' | 'low'

export interface ScoreBreakdown {
    stackMatch: number
    experienceFit: number
    storyDepth: number
    thinkingQuality: number
    communication: number
    total: number
}
