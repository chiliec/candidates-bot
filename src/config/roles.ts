export interface LocaleString {
    en: string
    ru: string
}

export interface RoleConfig {
    label: LocaleString
    stackKeywords: string[]
    scenarioQuestion: LocaleString
    teamFact: LocaleString
    experienceWeights: Record<string, number>
}

export const EXPERIENCE_OPTIONS = ['<1', '1-3', '3-5', '5+'] as const

export const ROLE_KEYS = [
    'frontend', 'backend', 'mobile', 'fullstack',
    'qa', 'devops', 'design', 'other',
] as const

export type RoleKey = typeof ROLE_KEYS[number]

export const ROLES: Record<RoleKey, RoleConfig> = {
    frontend: {
        label: { en: 'Frontend', ru: 'Фронтенд' },
        stackKeywords: [
            'react', 'vue', 'angular', 'svelte', 'typescript', 'javascript',
            'nextjs', 'next.js', 'nuxt', 'css', 'tailwind', 'webpack', 'vite',
            'redux', 'graphql', 'html', 'sass', 'less', 'styled-components',
        ],
        scenarioQuestion: {
            en: "You get a design that's gorgeous but slow to render. What do you do?",
            ru: 'Вам дали дизайн — красивый, но тормозит. Что будете делать?',
        },
        teamFact: {
            en: "Fun fact — our frontend crew recently shipped a real-time logistics dashboard handling 50k daily users. You'd fit right in 👀",
            ru: 'Кстати — наша фронтенд-команда недавно запустила real-time дашборд для логистики на 50к пользователей в день. Тебе сюда 👀',
        },
        experienceWeights: { '<1': 5, '1-3': 10, '3-5': 20, '5+': 20 },
    },

    backend: {
        label: { en: 'Backend', ru: 'Бэкенд' },
        stackKeywords: [
            'node', 'nodejs', 'express', 'nestjs', 'python', 'django', 'fastapi',
            'java', 'spring', 'kotlin', 'go', 'golang', 'rust', 'c#', 'csharp',
            '.net', 'dotnet', 'php', 'laravel', 'ruby', 'rails', 'postgresql',
            'postgres', 'mysql', 'mongodb', 'redis', 'kafka', 'rabbitmq', 'grpc',
        ],
        scenarioQuestion: {
            en: 'Your API starts timing out under load. Walk us through your first moves.',
            ru: 'API начинает таймаутить под нагрузкой. Расскажи, что делаешь первым делом.',
        },
        teamFact: {
            en: "Yauheni on our backend team is a .NET beast who built microservices handling millions of transactions. Just so you know what level we play at 😏",
            ru: 'Женя из нашей бэкенд-команды — зверь в .NET, построил микросервисы на миллионы транзакций. Просто чтобы ты знал уровень 😏',
        },
        experienceWeights: { '<1': 5, '1-3': 10, '3-5': 20, '5+': 20 },
    },

    mobile: {
        label: { en: 'Mobile', ru: 'Мобильная разработка' },
        stackKeywords: [
            'swift', 'swiftui', 'uikit', 'objective-c', 'ios', 'android',
            'kotlin', 'java', 'react native', 'flutter', 'dart', 'xcode',
            'macos', 'watchos', 'tvos', 'jetpack compose', 'cocoapods', 'spm',
        ],
        scenarioQuestion: {
            en: 'The app crashes only on certain devices in production. How do you hunt it down?',
            ru: 'Приложение крашится только на некоторых устройствах в проде. Как будешь искать причину?',
        },
        teamFact: {
            en: "Our iOS team is Maksim, Sergei, and Vadim — they're deep into macOS and iOS apps. Tight crew.",
            ru: 'Наша iOS-команда — Максим, Сергей и Вадим, глубоко в macOS и iOS. Слаженная команда.',
        },
        experienceWeights: { '<1': 5, '1-3': 10, '3-5': 20, '5+': 20 },
    },

    fullstack: {
        label: { en: 'Fullstack', ru: 'Фулстек' },
        stackKeywords: [
            'react', 'vue', 'angular', 'node', 'express', 'nestjs', 'next.js',
            'nextjs', 'nuxt', 'typescript', 'python', 'django', 'postgresql',
            'mongodb', 'redis', 'docker', 'graphql', 'rest', 'api',
        ],
        scenarioQuestion: {
            en: "The frontend team says the API is too slow. The backend team says the frontend makes too many requests. You're in the middle. What's your move?",
            ru: 'Фронтенд говорит — API тормозит. Бэкенд говорит — фронтенд шлёт слишком много запросов. Ты посередине. Что делаешь?',
        },
        teamFact: {
            en: "Nikolay on our team does full-stack with self-hosted solutions and AI integration. If you like owning the whole stack, you're in good company.",
            ru: 'Николай в нашей команде делает фулстек с self-hosted решениями и AI-интеграцией. Если любишь владеть всем стеком — тебе к нам.',
        },
        experienceWeights: { '<1': 5, '1-3': 10, '3-5': 20, '5+': 20 },
    },

    qa: {
        label: { en: 'QA', ru: 'QA' },
        stackKeywords: [
            'selenium', 'cypress', 'playwright', 'jest', 'mocha', 'pytest',
            'appium', 'postman', 'jmeter', 'k6', 'testcafe', 'cucumber',
            'gherkin', 'automation', 'manual', 'api testing', 'load testing',
            'performance testing', 'security testing',
        ],
        scenarioQuestion: {
            en: "You find a critical bug 2 hours before release. What's your play?",
            ru: 'Нашёл критический баг за 2 часа до релиза. Что делаешь?',
        },
        teamFact: {
            en: "Denis and Pavel from our QA team specialize in healthcare — if you're into regulated, high-stakes testing, you'll love it here.",
            ru: 'Денис и Павел из нашей QA-команды специализируются на healthcare — если нравится тестирование с высокими ставками, тебе сюда.',
        },
        experienceWeights: { '<1': 5, '1-3': 15, '3-5': 20, '5+': 20 },
    },

    devops: {
        label: { en: 'DevOps', ru: 'DevOps' },
        stackKeywords: [
            'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'aws',
            'gcp', 'azure', 'ci/cd', 'jenkins', 'github actions', 'gitlab',
            'prometheus', 'grafana', 'linux', 'nginx', 'helm', 'argocd',
            'cloudformation', 'pulumi',
        ],
        scenarioQuestion: {
            en: "Deployment pipeline breaks at 2am and the on-call dev is unreachable. What do you do?",
            ru: 'Деплой-пайплайн сломался в 2 ночи, дежурный разработчик не отвечает. Что делаешь?',
        },
        teamFact: {
            en: "We take infra seriously — IaC, CI/CD, security compliance. Not just 'push to prod and pray.'",
            ru: "Мы серьёзно относимся к инфре — IaC, CI/CD, security compliance. Не просто 'задеплоил и молишься'.",
        },
        experienceWeights: { '<1': 5, '1-3': 10, '3-5': 20, '5+': 20 },
    },

    design: {
        label: { en: 'Design', ru: 'Дизайн' },
        stackKeywords: [
            'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
            'ui', 'ux', 'ui/ux', 'design system', 'prototyping', 'wireframe',
            'user research', 'accessibility', 'motion design', 'after effects',
        ],
        scenarioQuestion: {
            en: "The PM wants a feature that's fast to build. The users want something beautiful. You have a week. How do you approach it?",
            ru: 'PM хочет фичу, которую быстро собрать. Пользователи хотят красиво. У тебя неделя. Как подойдёшь?',
        },
        teamFact: {
            en: "Ksu, our CCO, leads the creative direction — design here isn't an afterthought, it's core to everything.",
            ru: 'Ксю, наш CCO, ведёт креативное направление — дизайн у нас не на втором плане, а в основе всего.',
        },
        experienceWeights: { '<1': 5, '1-3': 15, '3-5': 20, '5+': 20 },
    },

    other: {
        label: { en: 'Other', ru: 'Другое' },
        stackKeywords: [],
        scenarioQuestion: {
            en: 'Tell us about a tough technical problem you solved and how you approached it.',
            ru: 'Расскажи о сложной технической задаче, которую решил, и как к ней подошёл.',
        },
        teamFact: {
            en: "We're a team of 25+ specialists across the globe — from iOS devs to AI engineers. There's probably someone here who speaks your language 🌍",
            ru: 'Мы — команда из 25+ специалистов по всему миру, от iOS-разработчиков до AI-инженеров. Скорее всего, найдётся кто-то, кто говорит на твоём языке 🌍',
        },
        experienceWeights: { '<1': 5, '1-3': 10, '3-5': 15, '5+': 20 },
    },
}

export const getRoleByLabel = (label: string): RoleKey | undefined => {
    const lower = label.toLowerCase()
    return ROLE_KEYS.find(k => {
        const r = ROLES[k]
        return r.label.en.toLowerCase() === lower || r.label.ru.toLowerCase() === lower
    })
}
