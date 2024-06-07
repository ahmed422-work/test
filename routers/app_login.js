const express = require('express');
const {mySqlQury} = require('../middelwer/db');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middelwer/auth');
const upload = require('../middelwer/multer');

router.post('/login', async (req, res)=>{
    try {
       
        const {username,password, loginas} = req.body;
        if(loginas == 0){
           
            var qury = "SELECT * FROM tbl_customer WHERE username='"+username+"' AND delet_flage=0 AND approved=1"
        }else{
            var qury = "SELECT * FROM tbl_admin WHERE username='"+username+"' AND delet_flage=0 AND approved=1"
        }
        
        const data = await mySqlQury(qury);
      
        if(data.length == 0){
           return res.status(200).json({
                status: 'error',
                ResponseCode: "400",
                message:'Invalid Username.'
            })
        }
       
        if(data[0].password !== password){
           return res.status(200).json({
                status: 'error',
                ResponseCode: "400",
                message:'Invalid password.'
            })
        }

        if(loginas == 0){
           
            var token = await jwt.sign({id:data[0].id, roll:0, store:data[0].store_ID,loginas },process.env.TOKEN_KEY)
        }else{
            var token = await jwt.sign({id:data[0].id, roll:data[0].roll_id, store:data[0].store_ID,loginas },process.env.TOKEN_KEY)
        }

        const {password:pass ,roll_id,approved,delet_flage, ...userdata} = data[0]
       
        res.status(200).json({
            status: 'success',
            ResponseCode: "200",
            message:'Login successful',
            userdata:userdata,
            token:token
        })
    } catch (error) {
        console.log(error);
    }
   
})


router.post('/register', async (req, res)=>{
    try {

      
        const { name, number, email, taxnumber, address, username, password, store} = req.body;
        const check_number = await mySqlQury("SELECT * FROM tbl_customer WHERE number='"+number+"'");
            if(check_number.length > 0){
               return res.status(200).json({
                    status: 'error',
                    ResponseCode: "400",
                    message:'This Mobile Number Alredy Register!!!!'
                })
               
            }

        const check_username = await mySqlQury("SELECT * FROM tbl_customer WHERE username='"+username+"'");
            if(check_username.length > 0){
               return res.status(200).json({
                    status: 'error',
                    ResponseCode: "400",
                    message:'This UserName Alredy Register!!!!'
                })
               
            }
            
        if(store){
            var qury = "INSERT INTO tbl_customer (name,number,email,address,taxnumber,username,password,store_ID) VALUE ('"+name+"','"+number+"','"+email+"','"+address+"','"+taxnumber+"','"+username+"','"+password+"','"+store+"')"
        }else{
            var qury = "INSERT INTO tbl_customer (name,number,email,address,taxnumber,username,password) VALUE ('"+name+"','"+number+"','"+email+"','"+address+"','"+taxnumber+"','"+username+"','"+password+"')"
        }
        const data = await mySqlQury(qury);
        res.status(200).json({
            status: 'success',
            ResponseCode: "200",
            message:'Registration was successful, and data was sent to the administrator for approval.',
           
        })

    } catch (error) {
        console.log(error);
    }
   



})

router.get('/multy', async (req, res)=>{
    try {
        const multiy = await mySqlQury("SELECT type FROM tbl_master_shop");
        if(multiy[0].type == 1){
            var storeList = await mySqlQury("SELECT id,name FROM tbl_store WHERE status=1 AND delete_flage=0");
            res.status(200).json({
                status: 'success',
                ResponseCode: "200",
                multiy:true,
                storelist:storeList,
                message:'Store is Multi mode',
               
            })
        }else{
            res.status(200).json({
                status: 'success',
                ResponseCode: "200",
                multiy:false,
                storelist:[],
                message:'store is single mode',
               
            })
        }
        
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            status: 'error',
            ResponseCode: "400",
            message: error.message
        })
    }
})










module.exports = router