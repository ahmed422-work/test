
const express = require('express');
const mysql = require('mysql');


// database connection and query promisify
var conn = mysql.createConnection({
    host     : 'sql12.freesqldatabase.com',
    user     : 'sql12712587',
    password : 'b45Qanhz1t',
    database : 'sql12712587'
  });


  const mySqlQury =(qry)=>{
    return new Promise((resolve, reject)=>{
        conn.query(qry, (err, row)=>{
            if (err) return reject(err);
            resolve(row)
        })
    }) 
  } 

  
  module.exports = {conn, mySqlQury}