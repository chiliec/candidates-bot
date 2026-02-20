import { prop, Ref, modelOptions, index } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { User } from './User'
import { Recurrence } from './Recurrence'
import { Reminder } from './Reminder'

export type Priority = 'none' | 'urgent' | 'important' | 'critical'

@index({ user: 1, createdAt: -1 })
@modelOptions({ schemaOptions: { timestamps: true } })
export class Task extends TimeStamps {
    @prop({ ref: () => User, required: true, index: true })
    user!: Ref<User>

    @prop({ required: true })
    text!: string

    @prop({ default: false, index: true })
    done!: boolean

    @prop({ type: String, default: 'none' })
    priority!: Priority

    @prop({ _id: false })
    recurrence?: Recurrence

    @prop({ _id: false })
    reminder?: Reminder

    // checklist message id (важно для Telegram sync)
    @prop()
    checklistMessageId?: number
}
