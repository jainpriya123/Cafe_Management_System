
const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

require('dotenv').config();

var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

router.post('/signup',(req,res)=>{
    let user = req.body;
    query = "Select email,password,role,status from user where email=?";
    connection.query(query,[user.email],(err,results)=>{
        if(!err){
            if(results.length<=0){
                query = "insert into user(name,contactNumber,email,password,status,role) values(?,?,?,?,'false', 'user')";
                connection.query(query, [user.name, user.contactNumber, user.email, user.password], (err,results)=>{
                    if(!err){
                        return res.status(200).json({message: "Successfully Registered"});
                    }
                    else{
                        return res.status(500).json(err);
                    }
                })
            }
            else{
                return res.status(400).json({message: "Email Already Exist"});
            }
        }
        else{
            return res.status(500).json(err);
        }
    })
})

router.post('/login', (req,res)=>{
    let user = req.body;
    query = "Select email,password,role,status from user where email=?";
    connection.query(query, [user.email],(err,results)=>{
        if(!err){
            if(results.length<=0 || results[0].password !== user.password){
                return res.status(400).json({message: "Enter correct username or password"});
            }
            else if(results[0].status === 'false' ) {
                return res.status(400).json({message: "Wait for admin approval"});  
            }
            else if(results[0].password === user.password){
                const response = {email: results[0].email, role: results[0].role};
                const Token = jwt.sign(response, process.env.ACESS_TOKEN, {expiresIn: '5h'});
                // console.log("login time ");
                // console.log(Token);

                return res.status(200).json({KeyToken: Token});
            }
            else{
                return  res.status(400).json({message: "Something went wrong.Please try again later"});
            }
        }
        else{
            return res.status(500).json(err);
        }
    })
})

var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

router.post('/forgetPassword', (req,res)=>{
    let user = req.body;
    query = "Select email,password,role,status from user where email=?";
    connection.query(query, [user.email],(err,results)=>{
        if(!err){
            if(results[0].length<=0){
                return res.status(400).json({message:"User not found"});
            }
            else{
                var mailBox = {
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subject: "Reset Password from cafe management system",
                    html: "<p><b>login credentials</b> <br> <b>Email:</b>"+results[0].email+"<b>Password:</b>"+results[0].password+"<a href='http://localhost:4200/'>Login here</a> </p>"
                };
                transport.sendMail(mailBox, (err,info)=>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log('Email sent: '+info.response);
                    }
                });
                return res.status(200).json({message: "Email sent successfully"});
            }
        }
        else{
            return res.status(500).json(err);
        }
    })
})

router.get('/get',auth.authenticateToken, checkRole.checkRole, (req,res)=>{
    var query = "Select id,name,contactNumber,email,password,status from user where role='user' ";
    connection.query(query, (err, results)=>{
        if(!err){
            return res.status(200).json(results);
        }
        else{
            return res.status(500).json(err); 
        }
    })
})

router.patch('/update',auth.authenticateToken, checkRole.checkRole, (req,res)=>{
    let user = req.body;
    var query = 'Update user set status=? where id =?';
    connection.query(query, [user.status, user.id], (err,results)=>{
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message: 'User ID not found'});
            }
            return res.status(200).json({message: 'User updated successfully'});
        }
        else{
            return res.status(500).json(err); 
        }
    })
})

router.get('/checkToken',auth.authenticateToken, (req,res)=>{
    return res.status(200).json({message: "True"});
})


router.post('/changePassword',auth.authenticateToken, (req,res)=>{
    const user = req.body;
    const email = res.locals.email;
    var query = "Select * from user where email=? and password=?";
    connection.query(query, [email, user.oldPassword], (err, results)=>{
        if(!err){
            if(results.length<=0){
                return res.status(400).json({message: "Incorrect Old Password"});
            }
            else if(results[0].password == user.oldPassword){
                query = "update user set password =? where email=?";
                connection.query(query, [user.newPassword, email], (err, results)=>{
                    if(!err){
                        return res.status(200).json({message: "Password Updated Successfully."});
                    }else{
                        return res.status(500).json(err);
                    }
                })
            }
            else{
                return res.status(400).json({message: "Something went wrong. Please try again later"});
            }
        }
        else{
            return res.status(500).json(err);
        }
    })
})

module.exports = router;