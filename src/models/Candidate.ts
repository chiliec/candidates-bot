import { modelOptions, prop, Severity } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses.js'
import mongoose from 'mongoose'

class ScoreBreakdown {
    @prop({ type: Number, default: 0 })
    stackMatch!: number

    @prop({ type: Number, default: 0 })
    experienceFit!: number

    @prop({ type: Number, default: 0 })
    storyDepth!: number

    @prop({ type: Number, default: 0 })
    thinkingQuality!: number

    @prop({ type: Number, default: 0 })
    communication!: number

    @prop({ type: Number, default: 0 })
    total!: number
}

class AdminNote {
    @prop({ type: Number, required: true })
    adminId!: number

    @prop({ type: String, required: true })
    text!: string

    @prop({ type: Date, default: () => new Date() })
    createdAt!: Date
}

class ArchivedSubmission {
    @prop({ type: String })
    role?: string

    @prop({ type: String })
    experience?: string

    @prop({ type: String })
    stack?: string

    @prop({ type: String })
    proudProject?: string

    @prop({ type: String })
    scenarioAnswer?: string

    @prop({ type: () => ScoreBreakdown })
    score?: ScoreBreakdown

    @prop({ type: Date })
    completedAt?: Date
}

@modelOptions({
    schemaOptions: { timestamps: true },
    options: { allowMixed: Severity.ALLOW },
})
export class Candidate extends TimeStamps {
    // Identity
    @prop({ type: Number, required: true, index: true, unique: true })
    telegramId!: number

    @prop({ type: String })
    username?: string

    @prop({ type: String })
    firstName?: string

    @prop({ type: String, default: 'en' })
    language!: string

    // Flow state
    @prop({ type: Number, default: 0 })
    step!: number

    @prop({ type: Boolean, default: false })
    completed!: boolean

    // Answers
    @prop({ type: String })
    role?: string

    @prop({ type: String })
    experience?: string

    @prop({ type: String })
    stack?: string

    @prop({ type: String })
    proudProject?: string

    @prop({ type: String })
    scenarioAnswer?: string

    // Scoring
    @prop({ type: () => ScoreBreakdown, _id: false })
    score?: ScoreBreakdown

    @prop({ type: String, default: 'low' })
    tier!: string

    // Admin workflow
    @prop({ type: String, default: 'new' })
    status!: string

    @prop({ type: () => [AdminNote], _id: false, default: [] })
    adminNotes!: AdminNote[]

    @prop({ type: Date })
    notifiedAt?: Date

    // Timing
    @prop({ type: Date })
    startedAt?: Date

    @prop({ type: Date })
    completedAt?: Date

    @prop({ type: mongoose.Schema.Types.Mixed, default: {} })
    answerTimes!: Record<string, number>

    // Archives & anti-spam
    @prop({ type: () => [ArchivedSubmission], _id: false, default: [] })
    archivedSubmissions!: ArchivedSubmission[]

    @prop({ type: Boolean, default: false })
    suspiciousBot!: boolean

    @prop({ type: Number, default: 0 })
    restartCount!: number

    @prop({ type: Date })
    lastRestartAt?: Date

    @prop({ type: Boolean, default: false })
    nudged!: boolean
}
