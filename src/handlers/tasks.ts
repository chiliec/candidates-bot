import { Bot } from "grammy"
import { BotContext } from "../bot"

export const registerTaskHandlers = (bot: Bot<BotContext>) => {
    bot.on("message:text", async (ctx) => {
        const text = ctx.message.text
        const userSession = ctx.session

        userSession.tasks.push({ text })

        await ctx.reply(ctx.t("add_task"))

        await ctx.replyWithChecklist(
            {
                title: ctx.t("checklist_title"),
                tasks: userSession.tasks.map((task, index) => ({
                    id: index + 1,
                    text: task.text,
                })),
            }
        )
    })
}
