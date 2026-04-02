import { getModelForClass } from '@typegoose/typegoose'
import { User } from './User.js'
import { Candidate } from './Candidate.js'

export const UserModel = getModelForClass(User)
export const CandidateModel = getModelForClass(Candidate)