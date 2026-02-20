import { getModelForClass } from '@typegoose/typegoose'
import { User } from './User'
import { Task } from './Task'

export const UserModel = getModelForClass(User)
export const TaskModel = getModelForClass(Task)