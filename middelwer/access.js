const express = require('express');
const jwt = require('jsonwebtoken');
const {mySqlQury} = require('../middelwer/db');

const access = async (user)=>{
    try {
       
        const {id,roll,store,loginas} = user;
        const rolldetail = await mySqlQury("select * from tbl_roll where id = "+roll+"");
        
        if(loginas == 0){
            var logas = "custmor"
            var mutibranch = false
            var topbardata = await mySqlQury("select * from tbl_customer where id = "+id+"")
            var isstore = false
        }else{
            var topbardata = await mySqlQury("select * from tbl_admin where id = "+id+"")
            if(topbardata[0].is_staff == 0){
                var isstore = true
                var topbardata = await mySqlQury("select * from tbl_store where id = "+topbardata[0].store_ID+"") 
            }else{
                var isstore = false
            }
            if(rolldetail[0].roll === "master_Admin"){
                const multiy = await mySqlQury("SELECT type FROM tbl_master_shop");
                if(multiy[0].type == 1){
                    var logas = "master"
                    var mutibranch = true
                }else{
                    var logas = "master"
                    var mutibranch = false
                }
               
            }else{
                var logas = "store"
                var mutibranch = false
            }
        }
       
        const masterstore = await mySqlQury("SELECT * FROM tbl_master_shop where id=1");
        const symbol = masterstore[0].currency_symbol
        const plac = masterstore[0].currency_placement

       

       return {logas,mutibranch,roll:rolldetail[0],topbardata:topbardata[0],isstore,symbol,plac,masterstore:masterstore[0]}
    } catch (error) {
        console.log(error);
    }
}

module.exports = access