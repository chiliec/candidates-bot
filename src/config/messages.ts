import type { LocaleString } from './roles.js'

export type Language = 'en' | 'ru'

export const msg = (ls: LocaleString, lang: Language): string => ls[lang]

export const MESSAGES = {
    chooseLang: {
        en: '🌐 Choose your language:',
        ru: '🌐 Choose your language:',
    },
    welcome: {
        en: 'Hey! Cool that you found us 🤙\nLet\'s get to know each other — takes about 2 minutes.',
        ru: 'Хей! Круто, что нашёл нас 🤙\nДавай познакомимся — займёт пару минут.',
    },
    askRole: {
        en: 'What are you into?',
        ru: 'Чем занимаешься?',
    },
    askExperience: {
        en: 'How many years in the game?',
        ru: 'Сколько лет в деле?',
    },
    askStack: {
        en: "What's your main tech stack? (just type it out)",
        ru: 'Какой у тебя основной стек? (просто напиши)',
    },
    askProudProject: {
        en: 'Tell us about something you built that you\'re proud of 💪',
        ru: 'Расскажи о проекте, которым гордишься 💪',
    },
    askScenario: {
        en: 'Now a quick scenario for you:',
        ru: 'Теперь быстрый сценарий:',
    },
    completion: {
        en: "That's it! We'll check this out and get back to you soon.\nWelcome aboard the process 🤙\n\nhttps://axveer.com",
        ru: 'Всё! Мы посмотрим и скоро вернёмся.\nДобро пожаловать в процесс 🤙\n\nhttps://axveer.com',
    },
    alreadyCompleted: {
        en: "You've already submitted your application. Use /start to apply again.",
        ru: 'Ты уже подал заявку. Используй /start, чтобы подать снова.',
    },
    rateLimited: {
        en: "You've already started a few times today. Come back tomorrow with fresh eyes 😉",
        ru: 'Ты уже стартовал несколько раз сегодня. Возвращайся завтра со свежей головой 😉',
    },
    tooShort: {
        en: "That's a bit short! Tell us more 🙂",
        ru: 'Маловато! Расскажи подробнее 🙂',
    },
    buttonNudge: {
        en: 'Please use the buttons above to answer.',
        ru: 'Используй кнопки выше для ответа.',
    },
    noCandidate: {
        en: 'Please use /start to begin.',
        ru: 'Используй /start, чтобы начать.',
    },
    errorMessage: {
        en: 'Oops, something hiccupped on our end. Try again in a minute?',
        ru: 'Упс, что-то пошло не так. Попробуй через минутку?',
    },
    nudgeTimeout: {
        en: "Still there? You were doing great. Pick up where you left off 👇",
        ru: 'Ещё тут? У тебя отлично получалось. Продолжай с того места, где остановился 👇',
    },
    interestedNotification: {
        en: 'Hey! Our team liked your profile. Someone will reach out to you soon 🤙',
        ru: 'Хей! Нашей команде понравился твой профиль. Скоро с тобой свяжутся 🤙',
    },
    scheduleNotification: {
        en: "Great news! The team wants to talk. Here's a link to pick a time:",
        ru: 'Отличные новости! Команда хочет поговорить. Вот ссылка, чтобы выбрать время:',
    },
    schedulePrompt: {
        en: 'Send a scheduling link or message for this candidate. You have 5 minutes to reply.',
        ru: 'Отправь ссылку или сообщение для кандидата. У тебя 5 минут на ответ.',
    },
    notePrompt: {
        en: 'Write a note about this candidate. You have 5 minutes to reply.',
        ru: 'Напиши заметку о кандидате. У тебя 5 минут на ответ.',
    },
} as const satisfies Record<string, LocaleString>

export type MessageKey = keyof typeof MESSAGES
