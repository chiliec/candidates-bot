import { modelOptions, prop, Severity } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import mongoose from 'mongoose'

@modelOptions({ schemaOptions: { timestamps: true }, options: { allowMixed: Severity.ALLOW } })
export class Candidate extends TimeStamps {
    @prop({ type: Number, required: true, index: true, unique: true })
    telegramId!: number

    @prop({ type: String })
    username?: string

    @prop({ type: String })
    firstName?: string

    @prop({ type: Number, default: 0 })
    step!: number

    @prop({ type: Boolean, default: false })
    completed!: boolean

    @prop({ type: mongoose.Schema.Types.Mixed, default: {} })
    answers!: Record<string, string>
}
