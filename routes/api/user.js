const express=require('express')
const mongoose=require("mongoose")
const usermodel=require('../../models/User')
const bycrypt=require('bcryptjs')
const articlemodel=require('../../models/Article')
const jwt = require('jsonwebtoken');
const router=express.Router()
const key=require('../../config/dbconfig').secret
const auth=require('../../strategy/auth')
const authtoken=require('../../models/auth')
const passport=require("passport")
const  crypto=require('crypto')
const nodemailer=require('nodemailer')
const Token=require('../../models/token')


router.get('/',(req,res)=>
    
    
    res.json({ mess:"working" })
)
router.post('/register',(req,res)=>{
    
    

    usermodel.find({ email:req.body.email},(err,result)=>{
        if(err){
            res.json({
                mesaage:"internal server error"
            })
        } 
        if(result.length>0)
        return res.status(400).json({
            message:"already exsists"
        })
        newuser=new usermodel({
            firstName:req.body.firstName,
            lastName:req.body.lastName,
            email:req.body.email,
            password:req.body.password
        })
        let hashpassword=(plainpassword)=>{
            const saltRounds=10
            let salt= bycrypt.genSaltSync(saltRounds)
            let hash =bycrypt.hashSync(plainpassword,salt)
            return hash
        }
        newuser.password=hashpassword(req.body.password)
        
        newuser.save((err,user)=>{
            if(err){
                res.send(err)
            }
            var token = new Token({ userId: user._id, token: crypto.randomBytes(16).toString('hex') });
            token.save((err)=>{
                if(err){
                    res.send("error in token save")
                }
              
                var transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: "maheshreddymoola@gmail.com", pass: "maheshreddymoola@9" } });
                var mailOptions = { from: 'articleapp', to: user.email,
                 subject: 'Account Verification Token',
                  text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + "192.168.1.5:6001" + '\/api/user/confirmation\/' + token.token + '.\n' }
                  
                transporter.sendMail(mailOptions, function (err) {
                    if (err) { return res.status(500).send({ msg: err.message }); }
                    res.status(200).send('A verification email has been sent to ' + user.email + '.');
                });
            })
            
        })
    })


})






//router.post
router.post('/login',(req,res)=>{
    if (!req.body.email){
        res.status(422).json({
            message:"email required"
        })
    }
    if (!req.body.password){
        res.status(422).json({
            message:"password required"
        })
    }
    usermodel.findOne({email:req.body.email},(err,result)=>{
        if(err){
            res.status(500).json({
                message:"Internal server error"
            })
        } 
        if(!result){
            res.send("user not found")
        } 
        if(result.emailVerified==false){
            res.json({
                message:"please verify email for login"
            })
        }
         bycrypt.compare(req.body.password,result.password,(err,ismatch)=>{
                if (err){
                    res.send("internal error")
                } else if (ismatch){
                    console.log(result);
                
                    const payload={
                        id:result.id,
                        email:result.email,
                        firstName:result.firstName

                    }
                    
                     jwt.sign(payload, key,{ expiresIn:3600},(err,token)=>{
                         if(err){
                             res.send(err)
                         }
                        
                        return res.json({success:"true",token:"Bearer "+token})
                    });
                    console.log(key);
                    
                   
                    
                } else{
                    res.send("wrong details")
                }
            })
           
        
     })

})


router.post('/article/create',passport.authenticate('jwt', { session: false }),(req,res)=>{
    const article=req.body
    const id=req.user.id
    console.log(id);
    
    const newarticle= new articlemodel({
        userId:id,
 title:article.title,
 details:article.details
    })

    newarticle.save((err,result)=>{
        if (err){
            res.send(err)
        }
        return res.status(200).json({
            message:"article saved successfully",result 
        })
    })

})


router.put('/edit/:articleid',passport.authenticate('jwt', { session: false }),(req,res)=>{
    const options=req.body
    console.log(options);
    
    articlemodel.updateOne({id:req.body.articleid},options,{multi:true},(err,project)=>{
        if(err){
            res.send(err)
        } else if(project==undefined || project==null||project==""){
            res.send("not found")
        } 
        return res.status(200).json({
            message:"updated successfully",project
        })
    })

})


router.delete('/delete/:articleid',passport.authenticate('jwt', { session: false }),(req,res)=>{
    console.log(req.body);
    

    articlemodel.findOneAndRemove({id:req.body.articleid},(err,result)=>{
        if(err){
            res.send(err)
        } else if(result==undefined ||result==null||result==""){
            res.send("not found")
        }return res.status(200).json({message:"deleted successfully"})
    })
})
router.get('/articles',passport.authenticate('jwt', { session: false }),(req,res)=>{
    articlemodel.find({},(err,result)=>{
        if(err){
            res.send(err)
        }
        return res.status(200).json({message:"all articles",result})
    })
})
router.get('/article/:articleid',passport.authenticate('jwt', { session: false }),(req,res)=>{
    articlemodel.findOne({id:req.params.id},(err,result)=>{
        if(err){
            res.send(err)
        }
        return res.status(200).json({result})
    })
})
router.get('/confirmation/:token', (req,res)=>{
    Token.findOne({ token: req.params.token }, function (err, token) {
        if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.' });
 
        // If we found a token, find a matching user
        usermodel.findById({_id:token.userId }, function (err, user) {
            console.log(token.userId);
            console.log(user);
            
            
            if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
            if (user.emailVerified==true) return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });
 
            
            user.emailVerified = true;
            user.save(function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }
                res.status(200).send("The account has been verified. Please log in.");
            });
        });
    });
})


module.exports=router
