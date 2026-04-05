import { Bot, Context } from 'grammy'
import { registerAdminHandlers } from './handlers/admin.js'
import { registerFlowHandlers } from './handlers/flow.js'

export type BotContext = Context

export const createBot = (token: string) => {
    const bot = new Bot<BotContext>(token)

    // Admin handlers first — they check isAdmin and pending actions
    // before flow handlers consume the same events
    registerAdminHandlers(bot)
    registerFlowHandlers(bot)

    return bot
}
