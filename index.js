const express=require('express')

const dotenv=require('custom-env')
//require('dotenv-safe').load()
const mongoose=require('mongoose')
const passport=require('passport')
dotenv.env()
const app=express()

const bodyparser=require('body-parser')

app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())
mongoose.Promise = global.Promise;
//allroutes
const user=require('./routes/api/user')

// mongodb configfile
//const db=require('./config/dbconfig').url



app.use('/api/user',user)

//connection
mongoose.connect(process.env.DB_URL,{useNewUrlParser: true})
.then(()=>{
    console.log("mongodb connected successfully");
})
.catch(err=>{
    console.log(err);
    
})
//Passport middleware
app.use(passport.initialize());

//Config for JWT strategy
require("./strategy/jsonwebtoken")(passport);


require("./models/User");
require("./models/auth");
const Port=process.env.PORT
const server=http.createServer(app) 
server.listen(Port)

// app.listen(process.env.PORT,()=>{
//     console.log(`server started port ${Port}`);
    
// })
