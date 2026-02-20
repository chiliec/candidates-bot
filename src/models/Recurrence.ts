import { prop } from '@typegoose/typegoose'

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'custom'

export class Recurrence {
    @prop({ required: true })
    type!: RecurrenceType

    @prop()
    interval?: number // every N days/weeks

    @prop({ type: () => [Number] })
    weekdays?: number[] // 0-6

    @prop()
    cron?: string // future flexibility
}
