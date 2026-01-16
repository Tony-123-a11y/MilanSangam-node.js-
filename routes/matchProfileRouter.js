import express from 'express'
import { findMatchesForCurrentUser } from '../controllers/matchprofileController.js'
import { authenticate } from '../middlewares/authMiddleware.js'

const actionRouter = express.Router()

actionRouter.get('/matchuser/:uid', authenticate, findMatchesForCurrentUser)
export default actionRouter