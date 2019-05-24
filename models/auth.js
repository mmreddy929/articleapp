const mongoose=require("mongoose")
const Schema=mongoose.Schema

const Authschema = new Schema({
    userId:{
        type:String
    },
    authToken:{
        type:String

    },
    tokenSecret:{
        type:String,
        required:true
    },
    tokenGenerationTime:{
        type:Date,
       // default:time.now()
    }
})

module.exports=auth=mongoose.model('Auth',Authschema)

