import { I18nFlavor } from "@grammyjs/i18n"
import { Bot, Context, SessionFlavor, session } from "grammy"
import { i18n } from "./i18n/index.js"
import { initialSession, SessionData } from "./types/session.js"
import { registerFlowHandlers } from "./handlers/flow.js"

export type BotContext = Context & SessionFlavor<SessionData> & I18nFlavor

export const createBot = (token: string) => {
    const bot = new Bot<BotContext>(token)

    bot.use(session({ initial: () => ({ ...initialSession }) }))
    bot.use(i18n.middleware())

    registerFlowHandlers(bot)

    return bot
}
