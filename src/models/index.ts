import { getModelForClass } from '@typegoose/typegoose'
import { User } from './User'
import { Candidate } from './Candidate'

export const UserModel = getModelForClass(User)
export const CandidateModel = getModelForClass(Candidate)