const mongoose=require('mongoose')

const Schema=mongoose.Schema


const UserSchema= new Schema({
    firstName:{
        type:String,
        default:"",
        required:true
             },
    lastName:{
            type:String,
            default:"",
            required:true
        },
    email:{
        type:String,
        required:true

        },
    password:{
            type:String
        },
    emailVerified: { type: Boolean, default: false },
        date:{
            type:Date,
            default:Date.now()
        }
})




module.exports=mongoose.model("user",UserSchema)