import { getModelForClass } from '@typegoose/typegoose'
import { Candidate } from './Candidate.js'

export const CandidateModel = getModelForClass(Candidate)
