import type { Api } from 'grammy'
import { CandidateModel } from '../models/index.js'
import { MESSAGES, msg, type Language } from '../config/messages.js'
import { ROLES, type RoleKey } from '../config/roles.js'

const NUDGE_AFTER_MS = 24 * 60 * 60 * 1000   // 24 hours
const ABANDON_AFTER_MS = 72 * 60 * 60 * 1000  // 72 hours
const SWEEP_INTERVAL_MS = 60 * 60 * 1000       // 1 hour

export function startTimeoutSweep(api: Api) {
    const sweep = async () => {
        try {
            const now = new Date()
            const nudgeCutoff = new Date(now.getTime() - NUDGE_AFTER_MS)
            const abandonCutoff = new Date(now.getTime() - ABANDON_AFTER_MS)

            // Abandon stale candidates (72h+)
            await CandidateModel.updateMany(
                {
                    completed: false,
                    status: { $ne: 'abandoned' },
                    updatedAt: { $lt: abandonCutoff },
                },
                { $set: { status: 'abandoned' } },
            )

            // Nudge inactive candidates (24h-72h, not yet nudged)
            const toNudge = await CandidateModel.find({
                completed: false,
                nudged: false,
                status: { $ne: 'abandoned' },
                updatedAt: { $lt: nudgeCutoff, $gte: abandonCutoff },
            })

            for (const candidate of toNudge) {
                const lang = (candidate.language === 'ru' ? 'ru' : 'en') as Language

                try {
                    // Send nudge message
                    await api.sendMessage(
                        candidate.telegramId,
                        msg(MESSAGES.nudgeTimeout, lang),
                    )

                    // Re-send current step prompt
                    if (candidate.step >= 3 && candidate.step <= 5) {
                        // Text steps — just remind the question
                        const step = candidate.step
                        if (step === 3) {
                            await api.sendMessage(candidate.telegramId, msg(MESSAGES.askStack, lang))
                        } else if (step === 4) {
                            await api.sendMessage(candidate.telegramId, msg(MESSAGES.askProudProject, lang))
                        } else if (step === 5) {
                            const roleKey = (candidate.role?.toLowerCase() ?? 'other') as RoleKey
                            const role = ROLES[roleKey] ?? ROLES.other
                            await api.sendMessage(
                                candidate.telegramId,
                                `${msg(MESSAGES.askScenario, lang)}\n\n${role.scenarioQuestion[lang]}`,
                            )
                        }
                    }

                    candidate.nudged = true
                    await candidate.save()
                } catch {
                    // User may have blocked the bot — skip
                }
            }
        } catch (err) {
            console.error('Timeout sweep error:', err)
        }
    }

    // Run immediately on start, then on interval
    sweep()
    setInterval(sweep, SWEEP_INTERVAL_MS)
}
