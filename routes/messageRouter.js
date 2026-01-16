import express from 'express'
import { getAllContacts, getAllMessages, sendMessage } from '../controllers/messageController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
 const messageRouter= express.Router()

messageRouter.post('/sendMessage/:profileId',authenticate,sendMessage)
messageRouter.get('/getContacts',authenticate,getAllContacts)
messageRouter.get('/getMessages/:profileId',authenticate,getAllMessages)
export default messageRouter