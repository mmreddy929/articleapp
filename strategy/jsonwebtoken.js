var JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose=require('mongoose')
const usermodel=mongoose.model("user")
const key=require('../config/dbconfig').secret


module.exports=passport=>{
    var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = key
passport.use(new JwtStrategy(opts,(jwt_payload,done)=>{
    usermodel.findById(jwt_payload.id)
    .then(user=>{
        if(user){
            return done(null,user)
            
        }
        return done(null,false)
    })
    .catch(err=>console.log(err));
    
}))
}
