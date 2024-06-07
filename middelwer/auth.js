const express = require('express');
const jwt = require('jsonwebtoken');
const {mySqlQury} = require('../middelwer/db');

const auth = async (req, res, next)=>{
  
        const token = req.cookies.webtoken
       
        if(!token){
            req.flash("error", "Your Are Not Authoried, Please Login first !!!!!!");
            return res.redirect('/')
        }

        const decode = await jwt.verify(token, process.env.TOKEN_KEY)
      
        req.user = decode

        next()
        
    
}






module.exports = auth