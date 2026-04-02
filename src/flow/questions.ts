export type QuestionType = 'buttons' | 'text'

export interface Question {
    key: string
    text: string
    type: QuestionType
    options?: readonly string[]
}

export const QUESTIONS: Question[] = [
    {
        key: 'position',
        text: 'What position are you applying for?',
        type: 'buttons',
        options: ['Frontend', 'Backend', 'Mobile', 'Fullstack'],
    },
    {
        key: 'experience',
        text: 'How many years of programming experience do you have?',
        type: 'buttons',
        options: ['0–1', '1–3', '3–5', '5+'],
    },
    {
        key: 'stack',
        text: 'What is your main tech stack?',
        type: 'text',
    },
    {
        key: 'motivation',
        text: 'Why do you want to work with us?',
        type: 'text',
    },
]

export const CONFIRMATION_MESSAGE = `Thanks! 🙌\nWe've received your application.\n\nWe'll review it and get back to you soon.`
