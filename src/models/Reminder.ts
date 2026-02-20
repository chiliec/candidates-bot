import { prop } from '@typegoose/typegoose'

export class Reminder {
    @prop({ required: true })
    at!: Date

    @prop({ default: false })
    sent!: boolean
}
