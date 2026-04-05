import { Bot, InlineKeyboard } from 'grammy'
import type { BotContext } from '../bot.js'
import { CandidateModel } from '../models/index.js'
import { ROLES, ROLE_KEYS, EXPERIENCE_OPTIONS, getRoleByLabel, type RoleKey } from '../config/roles.js'
import { MESSAGES, msg, type Language } from '../config/messages.js'
import { computeScore, getTier } from '../services/scoring.js'
import { notifyAdmins } from '../services/notify.js'
import { SCORING } from '../config/scoring.js'

// Step mapping:
// 0 = language picker
// 1 = role picker
// 2 = experience picker
// 3 = stack (text)
// 4 = proud project (text)
// 5 = scenario (text) — team fact sent before the question
// 6 = complete

const LANG_PREFIX = 'lang:'
const ROLE_PREFIX = 'role:'
const EXP_PREFIX = 'exp:'

const MAX_RESTARTS_PER_DAY = 3
const MIN_ANSWER_LENGTH = SCORING.heuristics.minAnswerLength
const MAX_ANSWER_LENGTH = 2000

function getLang(candidate: { language: string }): Language {
    return candidate.language === 'ru' ? 'ru' : 'en'
}

async function sendStepPrompt(ctx: BotContext, candidate: { step: number; language: string; role?: string }) {
    const lang = getLang(candidate)
    const step = candidate.step

    switch (step) {
        case 0: {
            // Language picker — always shown in both languages
            const kb = new InlineKeyboard()
                .text('🇬🇧 English', `${LANG_PREFIX}en`)
                .text('🇷🇺 Русский', `${LANG_PREFIX}ru`)
            await ctx.reply(msg(MESSAGES.chooseLang, 'en'), { reply_markup: kb })
            break
        }
        case 1: {
            const kb = new InlineKeyboard()
            for (const key of ROLE_KEYS) {
                kb.text(ROLES[key].label[lang], `${ROLE_PREFIX}${key}`).row()
            }
            await ctx.reply(msg(MESSAGES.askRole, lang), { reply_markup: kb })
            break
        }
        case 2: {
            const kb = new InlineKeyboard()
            for (const opt of EXPERIENCE_OPTIONS) {
                kb.text(opt, `${EXP_PREFIX}${opt}`).row()
            }
            await ctx.reply(msg(MESSAGES.askExperience, lang), { reply_markup: kb })
            break
        }
        case 3:
            await ctx.reply(msg(MESSAGES.askStack, lang))
            break
        case 4:
            await ctx.reply(msg(MESSAGES.askProudProject, lang))
            break
        case 5: {
            // Send team fact first, then scenario question
            const roleKey = (candidate.role?.toLowerCase() ?? 'other') as RoleKey
            const role = ROLES[roleKey] ?? ROLES.other
            await ctx.reply(role.teamFact[lang])
            const scenarioIntro = msg(MESSAGES.askScenario, lang)
            await ctx.reply(`${scenarioIntro}\n\n${role.scenarioQuestion[lang]}`)
            break
        }
    }
}

export const registerFlowHandlers = (bot: Bot<BotContext>) => {
    // /start — begin or restart
    bot.command('start', async (ctx) => {
        try {
            const telegramId = ctx.from!.id
            const now = new Date()

            let candidate = await CandidateModel.findOne({ telegramId })

            // Rate limiting
            if (candidate) {
                const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
                if (candidate.lastRestartAt && candidate.lastRestartAt > oneDayAgo) {
                    if ((candidate.restartCount ?? 0) >= MAX_RESTARTS_PER_DAY) {
                        const lang = getLang(candidate)
                        await ctx.reply(msg(MESSAGES.rateLimited, lang))
                        return
                    }
                } else {
                    // Reset counter — new day
                    candidate.restartCount = 0
                }

                // Archive previous completed submission
                if (candidate.completed) {
                    if (!candidate.archivedSubmissions) candidate.archivedSubmissions = []
                    candidate.archivedSubmissions.push({
                        role: candidate.role,
                        experience: candidate.experience,
                        stack: candidate.stack,
                        proudProject: candidate.proudProject,
                        scenarioAnswer: candidate.scenarioAnswer,
                        score: candidate.score ? { ...candidate.score } : undefined,
                        completedAt: candidate.completedAt,
                    })
                }

                // Reset for new flow
                candidate.step = 0
                candidate.completed = false
                candidate.role = undefined
                candidate.experience = undefined
                candidate.stack = undefined
                candidate.proudProject = undefined
                candidate.scenarioAnswer = undefined
                candidate.score = undefined
                candidate.tier = 'low'
                candidate.status = 'new'
                candidate.suspiciousBot = false
                candidate.nudged = false
                candidate.answerTimes = {}
                if (!candidate.adminNotes) candidate.adminNotes = []
                candidate.startedAt = now
                candidate.completedAt = undefined
                candidate.restartCount = (candidate.restartCount ?? 0) + 1
                candidate.lastRestartAt = now
                candidate.username = ctx.from!.username
                candidate.firstName = ctx.from!.first_name
                await candidate.save()
            } else {
                candidate = await CandidateModel.create({
                    telegramId,
                    username: ctx.from!.username,
                    firstName: ctx.from!.first_name,
                    step: 0,
                    completed: false,
                    language: 'en',
                    status: 'new',
                    tier: 'low',
                    startedAt: now,
                    restartCount: 1,
                    lastRestartAt: now,
                    answerTimes: {},
                    adminNotes: [],
                    archivedSubmissions: [],
                })
            }

            await sendStepPrompt(ctx, candidate)
        } catch (err) {
            console.error('Error in /start:', err)
            await ctx.reply(msg(MESSAGES.errorMessage, 'en')).catch(() => {})
        }
    })

    // Button callbacks (language, role, experience)
    bot.on('callback_query:data', async (ctx) => {
        const data = ctx.callbackQuery.data

        // Skip admin action buttons
        if (data.startsWith('admin:')) return

        try {
            const candidate = await CandidateModel.findOne({ telegramId: ctx.from.id })
            if (!candidate) {
                await ctx.answerCallbackQuery({ text: 'Please use /start to begin.' })
                return
            }
            if (candidate.completed) {
                await ctx.answerCallbackQuery({ text: msg(MESSAGES.alreadyCompleted, getLang(candidate)) })
                return
            }

            const lang = getLang(candidate)
            const now = Date.now()

            // Step 0: Language selection
            if (data.startsWith(LANG_PREFIX) && candidate.step === 0) {
                const chosen = data.slice(LANG_PREFIX.length)
                if (chosen !== 'en' && chosen !== 'ru') {
                    await ctx.answerCallbackQuery()
                    return
                }

                candidate.language = chosen
                candidate.step = 1
                candidate.answerTimes['language'] = (now - (candidate.startedAt?.getTime() ?? now)) / 1000
                await candidate.save()
                await ctx.answerCallbackQuery()
                await ctx.editMessageReplyMarkup()

                // Send welcome, then role picker
                await ctx.reply(msg(MESSAGES.welcome, chosen as Language))
                await sendStepPrompt(ctx, candidate)
                return
            }

            // Step 1: Role selection
            if (data.startsWith(ROLE_PREFIX) && candidate.step === 1) {
                const roleKey = data.slice(ROLE_PREFIX.length) as RoleKey
                if (!ROLE_KEYS.includes(roleKey)) {
                    await ctx.answerCallbackQuery()
                    return
                }

                candidate.role = roleKey
                candidate.step = 2
                candidate.answerTimes['role'] = (now - (candidate.updatedAt?.getTime() ?? now)) / 1000
                await candidate.save()
                await ctx.answerCallbackQuery()
                await ctx.editMessageReplyMarkup()
                await sendStepPrompt(ctx, candidate)
                return
            }

            // Step 2: Experience selection
            if (data.startsWith(EXP_PREFIX) && candidate.step === 2) {
                const exp = data.slice(EXP_PREFIX.length)
                if (!(EXPERIENCE_OPTIONS as readonly string[]).includes(exp)) {
                    await ctx.answerCallbackQuery()
                    return
                }

                candidate.experience = exp
                candidate.step = 3
                candidate.answerTimes['experience'] = (now - (candidate.updatedAt?.getTime() ?? now)) / 1000
                await candidate.save()
                await ctx.answerCallbackQuery()
                await ctx.editMessageReplyMarkup()
                await sendStepPrompt(ctx, candidate)
                return
            }

            // Unexpected callback
            await ctx.answerCallbackQuery()
        } catch (err) {
            console.error('Error in callback_query:', err)
            await ctx.answerCallbackQuery({ text: 'Something went wrong.' }).catch(() => {})
        }
    })

    // Free-text answers (stack, proud project, scenario)
    bot.on('message:text', async (ctx) => {
        // Ignore commands
        if (ctx.message.text.startsWith('/')) return

        try {
            const candidate = await CandidateModel.findOne({ telegramId: ctx.from.id })
            if (!candidate) {
                await ctx.reply(msg(MESSAGES.noCandidate, 'en'))
                return
            }

            const lang = getLang(candidate)

            if (candidate.completed) {
                await ctx.reply(msg(MESSAGES.alreadyCompleted, lang))
                return
            }

            // Steps 0-2 require buttons
            if (candidate.step < 3) {
                await ctx.reply(msg(MESSAGES.buttonNudge, lang))
                return
            }

            const text = ctx.message.text.trim().slice(0, MAX_ANSWER_LENGTH)
            if (text.length < MIN_ANSWER_LENGTH) {
                await ctx.reply(msg(MESSAGES.tooShort, lang))
                return
            }

            const now = Date.now()
            const timeSinceLast = (now - (candidate.updatedAt?.getTime() ?? now)) / 1000

            // Step 3: Stack
            if (candidate.step === 3) {
                candidate.stack = text
                candidate.answerTimes['stack'] = timeSinceLast
                candidate.step = 4
                await candidate.save()
                await sendStepPrompt(ctx, candidate)
                return
            }

            // Step 4: Proud project
            if (candidate.step === 4) {
                candidate.proudProject = text
                candidate.answerTimes['proudProject'] = timeSinceLast
                candidate.step = 5
                await candidate.save()
                await sendStepPrompt(ctx, candidate)
                return
            }

            // Step 5: Scenario answer — this completes the flow
            if (candidate.step === 5) {
                candidate.scenarioAnswer = text
                candidate.answerTimes['scenarioAnswer'] = timeSinceLast
                candidate.step = 6
                candidate.completed = true
                candidate.completedAt = new Date()

                // Compute score
                const score = computeScore(candidate)
                candidate.score = score as any
                candidate.tier = getTier(score.total)

                // Check for suspicious speed
                const totalTime = Object.values(candidate.answerTimes).reduce((s, t) => s + t, 0)
                candidate.suspiciousBot = totalTime < SCORING.heuristics.suspiciousSpeedTotal

                candidate.markModified('answerTimes')
                await candidate.save()

                // Send completion message
                await ctx.reply(msg(MESSAGES.completion, lang))

                // Notify admins
                candidate.notifiedAt = new Date()
                await candidate.save()
                await notifyAdmins(ctx.api, candidate)
                return
            }
        } catch (err) {
            console.error('Error in message:text:', err)
            await ctx.reply(msg(MESSAGES.errorMessage, 'en')).catch(() => {})
        }
    })
}
