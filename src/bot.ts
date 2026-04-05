import { Bot, Context, SessionFlavor, session } from 'grammy'
import { initialSession, SessionData } from './types/session.js'
import { registerAdminHandlers } from './handlers/admin.js'
import { registerFlowHandlers } from './handlers/flow.js'

export type BotContext = Context & SessionFlavor<SessionData>

export const createBot = (token: string) => {
    const bot = new Bot<BotContext>(token)

    bot.use(session({ initial: () => ({ ...initialSession }) }))

    // Admin handlers first — they check isAdmin and pending actions
    // before flow handlers consume the same events
    registerAdminHandlers(bot)
    registerFlowHandlers(bot)

    return bot
}
