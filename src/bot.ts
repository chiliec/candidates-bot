import { I18nFlavor } from "@grammyjs/i18n"
import { Bot, Context, SessionFlavor, session } from "grammy"
import { i18n } from "./i18n/index"
import { initialSession, SessionData } from "./types/session"

export type BotContext = Context & SessionFlavor<SessionData> & I18nFlavor

export const createBot = (token: string) => {
    const bot = new Bot<BotContext>(token)

    bot.use(session({ initial: () => ({ ...initialSession }) }))
    bot.use(i18n.middleware())

    bot.command("start", async (ctx) => {
        await ctx.reply(ctx.t("start"))
    })

    return bot
}
