const mongoose=require('mongoose')
const Schema=mongoose.Schema



const articleschema=new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title:{type:String},
    details:{
        type:String
    },
    createdDate:{
        type:Date,
        default:Date.now()
    }
})
module.exports=mongoose.model('article',articleschema)