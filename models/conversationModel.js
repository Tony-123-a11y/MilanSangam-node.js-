import mongoose from "mongoose";

const conversationSchema= new mongoose.Schema({
    members:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:[true,'Members are required to create a conversation']
        },
    ],
    messages:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Messages',
            
        }
    ]
},{timestamps:true})

export const Conversation= mongoose.model('Conversations',conversationSchema)