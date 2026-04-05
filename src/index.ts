import 'dotenv/config'
import { createBot } from './bot.js'
import { connectDB } from './db.js'
import { startTimeoutSweep } from './services/timeout.js'

const token = process.env.BOT_TOKEN
if (!token) throw new Error('BOT_TOKEN missing')

await connectDB()

const bot = createBot(token)

await bot.api.setMyCommands([
    { command: 'start', description: 'Start or restart the application' },
])

bot.start({
    onStart: (info) => {
        console.info(`Bot started: ${info.first_name} (https://t.me/${info.username})`)
        startTimeoutSweep(bot.api)
    },
})
