import { modelOptions, prop } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

@modelOptions({ schemaOptions: { timestamps: true } })
export class User extends TimeStamps {
    @prop({ type: Number, required: true, index: true, unique: true })
    userId!: number

    @prop({ type: String, required: true, default: 'en' })
    language!: string

    @prop({ type: Boolean, default: false })
    languageSelected!: boolean

    // paywall
    @prop({ type: Number, default: 0 })
    taskCount!: number

    @prop({ type: Boolean, default: false })
    isPro!: boolean
}