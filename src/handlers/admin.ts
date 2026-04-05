import { Bot } from 'grammy'
import type { BotContext } from '../bot.js'
import { CandidateModel } from '../models/index.js'
import { MESSAGES, msg, type Language } from '../config/messages.js'

const ADMIN_IDS: number[] = (process.env.ADMIN_IDS ?? '')
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n))

const PENDING_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

interface PendingAction {
    type: 'schedule' | 'note'
    candidateTelegramId: number
    expiresAt: number
}

const pendingActions = new Map<number, PendingAction>()

function isAdmin(userId: number): boolean {
    return ADMIN_IDS.includes(userId)
}

function cleanExpired() {
    const now = Date.now()
    for (const [key, action] of pendingActions) {
        if (action.expiresAt < now) pendingActions.delete(key)
    }
}

export const registerAdminHandlers = (bot: Bot<BotContext>) => {
    // Admin action buttons — pass to next handler if not an admin action
    bot.on('callback_query:data', async (ctx, next) => {
        const data = ctx.callbackQuery.data
        if (!data.startsWith('admin:')) return next()
        if (!isAdmin(ctx.from.id)) {
            await ctx.answerCallbackQuery({ text: 'Not authorized.' })
            return
        }

        const parts = data.split(':')
        if (parts.length < 3) {
            await ctx.answerCallbackQuery()
            return
        }

        const action = parts[1]
        const candidateTelegramId = parseInt(parts[2], 10)
        if (isNaN(candidateTelegramId)) {
            await ctx.answerCallbackQuery()
            return
        }

        try {
            const candidate = await CandidateModel.findOne({ telegramId: candidateTelegramId })
            if (!candidate) {
                await ctx.answerCallbackQuery({ text: 'Candidate not found.' })
                return
            }

            const lang = (candidate.language === 'ru' ? 'ru' : 'en') as Language

            switch (action) {
                case 'interested': {
                    if (candidate.status === 'interested') {
                        await ctx.answerCallbackQuery({ text: 'Already marked as interested.' })
                        return
                    }
                    candidate.status = 'interested'
                    await candidate.save()

                    // Notify candidate
                    await ctx.api
                        .sendMessage(candidate.telegramId, msg(MESSAGES.interestedNotification, lang))
                        .catch(() => {})

                    const who = candidate.username ? `@${candidate.username}` : `#${candidate.telegramId}`
                    await ctx.answerCallbackQuery({ text: `✅ ${who} marked as interested, candidate notified` })
                    break
                }

                case 'pass': {
                    candidate.status = 'passed'
                    await candidate.save()

                    const who = candidate.username ? `@${candidate.username}` : `#${candidate.telegramId}`
                    await ctx.answerCallbackQuery({ text: `✅ ${who} passed` })
                    break
                }

                case 'schedule': {
                    cleanExpired()
                    pendingActions.set(ctx.from.id, {
                        type: 'schedule',
                        candidateTelegramId,
                        expiresAt: Date.now() + PENDING_TIMEOUT_MS,
                    })
                    const who = candidate.username ? `@${candidate.username}` : `#${candidate.telegramId}`
                    await ctx.answerCallbackQuery()
                    await ctx.reply(
                        `📅 ${who}: ${msg(MESSAGES.schedulePrompt, 'en')}`,
                    )
                    break
                }

                case 'note': {
                    cleanExpired()
                    pendingActions.set(ctx.from.id, {
                        type: 'note',
                        candidateTelegramId,
                        expiresAt: Date.now() + PENDING_TIMEOUT_MS,
                    })
                    const who = candidate.username ? `@${candidate.username}` : `#${candidate.telegramId}`
                    await ctx.answerCallbackQuery()
                    await ctx.reply(
                        `💬 ${who}: ${msg(MESSAGES.notePrompt, 'en')}`,
                    )
                    break
                }

                default:
                    await ctx.answerCallbackQuery()
            }
        } catch (err) {
            console.error('Error in admin callback:', err)
            await ctx.answerCallbackQuery({ text: 'Error processing action.' }).catch(() => {})
        }
    })

    // Admin text replies for schedule/note pending actions — pass through if not handling
    bot.on('message:text', async (ctx, next) => {
        if (!isAdmin(ctx.from.id)) return next()
        if (ctx.message.text.startsWith('/')) return next()

        cleanExpired()
        const pending = pendingActions.get(ctx.from.id)
        if (!pending) return next()

        pendingActions.delete(ctx.from.id)

        try {
            const candidate = await CandidateModel.findOne({ telegramId: pending.candidateTelegramId })
            if (!candidate) {
                await ctx.reply('Candidate not found.')
                return
            }

            const lang = (candidate.language === 'ru' ? 'ru' : 'en') as Language
            const who = candidate.username ? `@${candidate.username}` : `#${candidate.telegramId}`

            if (pending.type === 'schedule') {
                candidate.status = 'scheduled'
                await candidate.save()

                const scheduleMsg = `${msg(MESSAGES.scheduleNotification, lang)}\n\n${ctx.message.text}`
                await ctx.api
                    .sendMessage(candidate.telegramId, scheduleMsg)
                    .catch(() => {})

                await ctx.reply(`✅ Schedule link sent to ${who}`)
            } else if (pending.type === 'note') {
                candidate.adminNotes.push({
                    adminId: ctx.from.id,
                    text: ctx.message.text,
                    createdAt: new Date(),
                })
                await candidate.save()

                await ctx.reply(`✅ Note saved for ${who}`)
            }
        } catch (err) {
            console.error('Error in admin text reply:', err)
            await ctx.reply('Error processing reply.').catch(() => {})
        }
    })
}
