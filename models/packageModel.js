import mongoose from "mongoose";

const packageSchema= new mongoose.Schema({
       pkgName:{
        type:String,
         require:true
       },
       pkgPricing:{
        type:Number,
        require:true,
       },
       pkgFeatures:[
        {
            type:String,
        }
       ]
})

export const Package = mongoose.model('Package',packageSchema);