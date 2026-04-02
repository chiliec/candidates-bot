import { Bot, InlineKeyboard } from "grammy"
import { BotContext } from "../bot.js"
import { CandidateModel } from "../models/index.js"
import { QUESTIONS, CONFIRMATION_MESSAGE, Question } from "../flow/questions.js"

const ADMIN_IDS: number[] = (process.env.ADMIN_IDS ?? '')
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n))

const ANSWER_PREFIX = 'answer:'

const buildKeyboard = (q: Question): InlineKeyboard => {
    const kb = new InlineKeyboard()
    for (const opt of q.options ?? []) {
        kb.text(opt, `${ANSWER_PREFIX}${opt}`).row()
    }
    return kb
}

const sendQuestion = async (ctx: BotContext, step: number) => {
    const q = QUESTIONS[step]
    if (q.type === 'buttons') {
        await ctx.reply(q.text, { reply_markup: buildKeyboard(q) })
    } else {
        await ctx.reply(q.text)
    }
}

const notifyAdmins = async (ctx: BotContext, answers: Record<string, string>, firstName: string, username?: string) => {
    if (ADMIN_IDS.length === 0) return

    const lines = QUESTIONS.map(q => `• ${q.text}\n  ${answers[q.key] ?? '—'}`)
    const who = username ? `@${username}` : `#${ctx.from!.id}`
    const text = `🆕 New candidate: ${firstName} (${who})\n\n${lines.join('\n\n')}`

    for (const adminId of ADMIN_IDS) {
        await ctx.api.sendMessage(adminId, text).catch(() => {})
    }
}

export const registerFlowHandlers = (bot: Bot<BotContext>) => {
    // /start resets state and begins the flow
    bot.command('start', async (ctx) => {
        await CandidateModel.findOneAndUpdate(
            { telegramId: ctx.from!.id },
            {
                $set: {
                    step: 0,
                    completed: false,
                    answers: {},
                    username: ctx.from!.username,
                    firstName: ctx.from!.first_name,
                },
            },
            { upsert: true, new: true },
        )
        await sendQuestion(ctx, 0)
    })

    // Button presses
    bot.on('callback_query:data', async (ctx) => {
        if (!ctx.callbackQuery.data.startsWith(ANSWER_PREFIX)) return

        const candidate = await CandidateModel.findOne({ telegramId: ctx.from.id })
        if (!candidate) {
            await ctx.answerCallbackQuery({ text: 'Please use /start to begin.' })
            return
        }
        if (candidate.completed) {
            await ctx.answerCallbackQuery({ text: 'Already submitted. Use /start to apply again.' })
            return
        }

        const q = QUESTIONS[candidate.step]
        if (!q || q.type !== 'buttons') {
            await ctx.answerCallbackQuery()
            return
        }

        const value = ctx.callbackQuery.data.slice(ANSWER_PREFIX.length)
        if (!q.options?.includes(value)) {
            await ctx.answerCallbackQuery({ text: 'Please use the buttons.' })
            return
        }

        candidate.answers[q.key] = value
        candidate.markModified('answers')
        candidate.step += 1

        const done = candidate.step === QUESTIONS.length
        if (done) candidate.completed = true

        await candidate.save()
        await ctx.answerCallbackQuery()

        // Remove buttons from the answered message
        await ctx.editMessageReplyMarkup()

        if (done) {
            await ctx.reply(CONFIRMATION_MESSAGE)
            await notifyAdmins(ctx, candidate.answers, candidate.firstName ?? ctx.from.first_name, candidate.username)
        } else {
            await sendQuestion(ctx, candidate.step)
        }
    })

    // Free-text answers
    bot.on('message:text', async (ctx) => {
        if (ctx.message.text.startsWith('/')) return

        const candidate = await CandidateModel.findOne({ telegramId: ctx.from.id })
        if (!candidate) {
            await ctx.reply('Please use /start to begin.')
            return
        }
        if (candidate.completed) {
            await ctx.reply("You've already submitted your application. Use /start to apply again.")
            return
        }

        const q = QUESTIONS[candidate.step]
        if (!q) return

        if (q.type === 'buttons') {
            // User typed instead of pressing a button — nudge them
            await ctx.reply('Please use the buttons above to answer.')
            await sendQuestion(ctx, candidate.step)
            return
        }

        const text = ctx.message.text.trim()
        if (!text) {
            await ctx.reply('Please write your answer.')
            return
        }

        candidate.answers[q.key] = text
        candidate.markModified('answers')
        candidate.step += 1

        const done = candidate.step === QUESTIONS.length
        if (done) candidate.completed = true

        await candidate.save()

        if (done) {
            await ctx.reply(CONFIRMATION_MESSAGE)
            await notifyAdmins(ctx, candidate.answers, candidate.firstName ?? ctx.from.first_name, candidate.username)
        } else {
            await sendQuestion(ctx, candidate.step)
        }
    })
}
