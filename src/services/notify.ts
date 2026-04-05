import { InlineKeyboard, type Api } from 'grammy'
import type { Candidate } from '../models/Candidate.js'

const ADMIN_IDS: number[] = (process.env.ADMIN_IDS ?? '')
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n))

const TIER_EMOJI: Record<string, string> = {
    hot: '🔥',
    decent: '👍',
    low: '🤷',
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}

function truncate(text: string, max: number): string {
    if (text.length <= max) return text
    return text.slice(0, max - 1) + '…'
}

export function buildAdminCard(candidate: Candidate): string {
    const score = candidate.score
    const tier = candidate.tier ?? 'low'
    const emoji = TIER_EMOJI[tier] ?? '🤷'
    const total = score?.total ?? 0
    const who = candidate.username ? `@${candidate.username}` : `#${candidate.telegramId}`

    const lines: string[] = []

    // Header
    lines.push(`${emoji} <b>New Candidate — Score: ${total}/100</b>`)

    // Returning candidate?
    if (candidate.archivedSubmissions.length > 0) {
        const prev = candidate.archivedSubmissions[candidate.archivedSubmissions.length - 1]
        lines.push(`↩️ Returning candidate — previous score: ${prev.score?.total ?? '?'}`)
    }

    lines.push('')
    lines.push(`${who} · ${candidate.role ?? '?'} · ${candidate.experience ?? '?'} years`)

    // Suspicious bot flag
    if (candidate.suspiciousBot) {
        lines.push('⚠️ <i>Suspiciously fast answers</i>')
    }

    // Score breakdown
    if (score) {
        lines.push('')
        lines.push('━━ Score Breakdown ━━')
        lines.push(
            `Stack: ${score.stackMatch}/25 · Exp: ${score.experienceFit}/20 · Story: ${score.storyDepth}/25 · Think: ${score.thinkingQuality}/20 · Comms: ${score.communication}/10`,
        )
    }

    // Stack
    if (candidate.stack) {
        lines.push('')
        lines.push('━━ Stack ━━')
        lines.push(escapeHtml(truncate(candidate.stack, 300)))
    }

    // Proud project
    if (candidate.proudProject) {
        lines.push('')
        lines.push('━━ Proud Project ━━')
        lines.push(`<i>${escapeHtml(truncate(candidate.proudProject, 500))}</i>`)
    }

    // Scenario answer
    if (candidate.scenarioAnswer) {
        lines.push('')
        lines.push('━━ Scenario Answer ━━')
        lines.push(`<i>${escapeHtml(truncate(candidate.scenarioAnswer, 500))}</i>`)
    }

    return lines.join('\n')
}

export function buildAdminKeyboard(candidateId: string): InlineKeyboard {
    return new InlineKeyboard()
        .text('👍 Interested', `admin:interested:${candidateId}`)
        .text('👎 Pass', `admin:pass:${candidateId}`)
        .row()
        .text('📅 Schedule', `admin:schedule:${candidateId}`)
        .text('💬 Note', `admin:note:${candidateId}`)
}

export async function notifyAdmins(api: Api, candidate: Candidate): Promise<void> {
    if (ADMIN_IDS.length === 0) return

    const text = buildAdminCard(candidate)
    const keyboard = buildAdminKeyboard(String(candidate.telegramId))

    for (const adminId of ADMIN_IDS) {
        await api
            .sendMessage(adminId, text, {
                parse_mode: 'HTML',
                reply_markup: keyboard,
            })
            .catch(() => {})
    }
}
