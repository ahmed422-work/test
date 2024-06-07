const express = require('express');
const {mySqlQury} = require('../middelwer/db');
const router = express.Router();
const auth = require('../middelwer/auth');
const upload = require('../middelwer/multer');
const access = require('../middelwer/access')

async function idfororder ()
{
    const orderiddata = await mySqlQury(`SELECT id FROM tbl_order ORDER BY ID DESC LIMIT 1`)
    if(orderiddata.length > 0){
        var n = ++orderiddata[0].id
    }else{
        var n =1
    }
    

    if ( n< 10 )
    {
        return ( '#ORD 000' + n.toString () );
    }
    else if ( n< 100 )
    {
        return ( '#ORD 00' + n.toString () );
    }
    else if ( n< 1000 )
    {
        return ( '#ORD 0' + n.toString () );
    }
    else
    {
        return ( '#ORD ' +n);
    }
}


router.get('/pos', auth, async (req, res)=>{
    try {
        const {id,roll,store,loginas} = req.user;
        const accessdata = await access (req.user)
       
        var orderid = await idfororder()
       

    //    customer login
        if(loginas == 0){ 
           var login = 'customer' 
           var service_list = await mySqlQury(" SELECT * FROM tbl_services WHERE status=0 AND store_ID="+store+"");
           var storeList =[]
           var ismulty = false
           customerList=await mySqlQury("SELECT id,name FROM tbl_customer WHERE id="+id+"")

            var tax = await mySqlQury("SELECT tax_percent FROM tbl_store WHERE id="+store+"")

            var cartdata = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
          if(cartdata.length > 0){
            var cartorderupdate = await mySqlQury("UPDATE tbl_cart SET order_id='"+orderid+"', tax="+tax[0].tax_percent+",store_id="+store+",customer_id='"+id+"' WHERE created_by='"+loginas+','+id+"'"); 
            var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");   
            var cartservice = await mySqlQury("SELECT * from tbl_cart_servicelist WHERE find_in_set(tbl_cart_servicelist.id,'"+cart[0].service_list_id+"')");
          }else{
            var cartinsert = await mySqlQury("INSERT INTO tbl_cart (created_by,store_id,customer_id,order_id,tax) VALUE('"+loginas+','+id+"',"+store+","+id+",'"+orderid+"',"+tax[0].tax_percent+")");  
            var cartservice =[]
            var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
          }

        }else{
            // admin login
            const rolldetail = await mySqlQury("select id,roll,orders from tbl_roll where id = "+roll+"");
           
            if(rolldetail[0].roll === "master_Admin"){
                // master admin
                const multiy = await mySqlQury("SELECT type FROM tbl_master_shop");
                if(multiy[0].type == 1){
                   
                    var storeList = await mySqlQury("SELECT id,name FROM tbl_store WHERE status=1 AND delete_flage=0");
                    // var customerList = await mySqlQury("SELECT id,name FROM tbl_customer WHERE approved=1 AND delet_flage=0");
                    var customerList = []
                    var ismulty = true

                    var cartdata = await mySqlQury("SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
                
                    if(cartdata.length > 0){
                        var cartorderupdate = await mySqlQury("UPDATE tbl_cart SET order_id='"+orderid+"' WHERE created_by='"+loginas+','+id+"'");
                        var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");  
                        var service_list = await mySqlQury(" SELECT * FROM tbl_services WHERE status=0 AND store_ID="+cart[0].store_id+"");  
                       
                        var cartservice = await mySqlQury("SELECT * from tbl_cart_servicelist WHERE find_in_set(tbl_cart_servicelist.id,'"+cart[0].service_list_id+"')");
                        var customerList = await mySqlQury("SELECT id,name FROM tbl_customer WHERE approved=1 AND delet_flage=0 AND store_ID="+cart[0].store_id+"");
                       

                    }else{
                      var cartinsert = await mySqlQury("INSERT INTO tbl_cart (created_by,order_id) VALUE('"+loginas+','+id+"','"+orderid+"')");  
                      var cartservice =[]
                      var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
                      var service_list=[]
                      
                    }
                   

                }else{
                    var service_list = await mySqlQury(" SELECT * FROM tbl_services WHERE status=0 AND store_ID=1");
                    var storeList =[]
                    var ismulty = false
                    var customerList = await mySqlQury("SELECT id,name FROM tbl_customer WHERE approved=1 AND delet_flage=0 AND store_ID=1");
                    var tax = await mySqlQury("SELECT tax_percent FROM tbl_store WHERE id="+store+"")
                    var couponlist = await mySqlQury("select * from tbl_coupon where start_date <=date(now()) AND end_date >=date(now()) AND status=0 AND find_in_set('"+store+"',store_list_id)");

                    var datacart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
                    if(datacart.length > 0){
                        var cartorderupdate = await mySqlQury("UPDATE tbl_cart SET order_id='"+orderid+"',store_id=1, tax="+tax[0].tax_percent+" WHERE created_by='"+loginas+','+id+"'");
                        var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");  
                        var cartservice = await mySqlQury("SELECT * from tbl_cart_servicelist WHERE find_in_set(tbl_cart_servicelist.id,'"+cart[0].service_list_id+"')");
                    }else{

                        var cartinsert = await mySqlQury("INSERT INTO tbl_cart (created_by,store_id,order_id,tax) VALUE('"+loginas+','+id+"',"+store+",'"+orderid+"',"+tax[0].tax_percent+")");  
                        var cartservice =[]
                        var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
                    }
                    
                }

                var login = 'master_admin'
                
            } else if( rolldetail[0].orders.includes('read'))
            {
                // store login
                var service_list = await mySqlQury(" SELECT * FROM tbl_services WHERE status=0 AND store_ID="+store+"");
                var customerList = await mySqlQury("SELECT id,name FROM tbl_customer WHERE approved=1 AND delet_flage=0 AND store_ID="+store+"");
                var login = 'store'
                var storeList =[]
                var ismulty = false
                var tax = await mySqlQury("SELECT tax_percent FROM tbl_store WHERE id="+store+"")
               

                var datacart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
                if(datacart.length > 0){
                    var cartorderupdate = await mySqlQury("UPDATE tbl_cart SET order_id='"+orderid+"', tax="+tax[0].tax_percent+" WHERE created_by='"+loginas+','+id+"'");
                    var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");  
                    var cartservice = await mySqlQury("SELECT * from tbl_cart_servicelist WHERE find_in_set(tbl_cart_servicelist.id,'"+cart[0].service_list_id+"')");
                }else{
                    var cartinsert = await mySqlQury("INSERT INTO tbl_cart (created_by,store_id,order_id,tax) VALUE('"+loginas+','+id+"',"+store+",'"+orderid+"',"+tax[0].tax_percent+")");  
                    var cartservice =[]
                    var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
                }
               

            }else{ 
                req.flash("error", "Your Are Not Authorized For this");
                return res.redirect('back')
            }
        } 
  
        var addonlist = await mySqlQury("SELECT * FROM tbl_addons WHERE status=0 AND store_ID="+store+"")
       

        res.render('pos',{login,storeList,service_list,ismulty, customerList,addonlist, cartservice,cart:cart[0],accessdata})

    } catch (error) {
        console.log(error);
    }
})

// when store change 
        // service list from store id
        router.get('/servicelist/:id', auth, async(req, res)=>{
            try {
                const {id,roll,store,loginas} = req.user;
                var storeid = req.params.id;
            
                var service_list = await mySqlQury(" SELECT * FROM tbl_services WHERE status=0 AND store_ID="+storeid+"");
                res.status(200).json({service_list})

            } catch (error) {
                console.log(error);
            }
        })
        // get Addon on store change and store id in cart
        router.get('/addonlist/:id', auth, async(req, res)=>{
            try {
                const {id,roll,store,loginas} = req.user;
                var storeid = req.params.id; 
           
                var addon_list = await mySqlQury(" SELECT * FROM tbl_addons WHERE status=0 AND store_ID="+storeid+"");

                var tax = await mySqlQury("SELECT tax_percent FROM tbl_store WHERE id="+storeid+"")
              
                var updatecart = await mySqlQury("UPDATE tbl_cart SET store_id="+storeid+", tax="+tax[0].tax_percent+" WHERE created_by='"+loginas+','+id+"'");

                var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'"); 

                res.status(200).json({addon_list,cart:cart[0]})

            } catch (error) {
                console.log(error);
            }
        })
        // customer list
        router.get('/customerlist/:id', auth, async(req, res)=>{
            try {
                const {id,roll,store,loginas} = req.user;
                var storeid = req.params.id;
                storeid !== 'null' ? storeid : storeid = store
                var customerList = await mySqlQury("SELECT id,name FROM tbl_customer WHERE approved=1 AND delet_flage=0 AND store_ID="+storeid+"");
             
                
                res.status(200).json({customerList})

            } catch (error) {
                console.log(error);
            }
        })

// add service to cart
router.post('/addservicelist', auth, async(req, res)=>{
    try {
        const {id,roll,store,loginas} = req.user;
        const serviceName = req.body.serviceid.split(',')[1]
        const serviceid = req.body.serviceid.split(',')[0]
        const serviceimage = req.body.serviceid.split(',')[2]

        const servicetypeid = req.body.servicetype.split(',')[0]
        const servicetypeprice = req.body.servicetype.split(',')[1]
        const servicetypename = req.body.servicetype.split(',')[2]

        const servicelist = await mySqlQury(`INSERT INTO tbl_cart_servicelist (service_id,service_type_id,service_type_price,
            service_quntity,service_color,service_name,service_type_name,service_img) VALUE (${serviceid},${servicetypeid},${servicetypeprice},
                1,'#000000','${serviceName}','${servicetypename}','${serviceimage}')`)


        const cartupdate = await mySqlQury("UPDATE tbl_cart SET service_list_id=CONCAT(service_list_id,',"+servicelist.insertId+"'),sub_total= ROUND(sub_total + "+servicetypeprice+",2), tax_amount =ROUND((sub_total + addon_price - coupon_discount - extra_discount) * (tax/ 100),2), gross_total = ROUND(sub_total + tax_amount + addon_price - coupon_discount - extra_discount,2), balance = ROUND(gross_total - paid_amount,2)  WHERE created_by='"+loginas+','+id+"'");


        var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
        var cartservice = await mySqlQury("SELECT * from tbl_cart_servicelist WHERE find_in_set(tbl_cart_servicelist.id,'"+cart[0].service_list_id+"')");


        res.status(200).json({cart:cart[0], cartservice, loginas});
    
    } catch (error) {
        console.log(error);
    }
})

// remove service to cart
router.get('/removeservicelist/:id', auth, async(req, res)=>{
    try {
        const {id,roll,store,loginas} = req.user;
        const serviceid = req.params.id

        const service = await mySqlQury(`SELECT * FROM tbl_cart_servicelist WHERE ID=${serviceid} `)

        const diff = parseFloat(service[0].service_type_price) * parseFloat(service[0].service_quntity)
   
        const cartupdate = await mySqlQury("UPDATE tbl_cart SET service_list_id=REPLACE(service_list_id,',"+serviceid+"',''),sub_total= ROUND(sub_total - "+ diff+",2), tax_amount =ROUND((sub_total + addon_price - coupon_discount - extra_discount)*tax / 100,2), gross_total =ROUND( sub_total + tax_amount + addon_price - coupon_discount - extra_discount,2), balance =ROUND( gross_total - paid_amount,2) WHERE created_by='"+loginas+','+id+"'");
       
        const deletservice = await mySqlQury("DELETE FROM tbl_cart_servicelist WHERE id="+serviceid+"")
        var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
        var cartservice = await mySqlQury("SELECT * from tbl_cart_servicelist WHERE find_in_set(tbl_cart_servicelist.id,'"+cart[0].service_list_id+"')");


        res.status(200).json({cart:cart[0], cartservice, loginas});
    
    } catch (error) {
        console.log(error);
    }
})


// get service type id from service
router.get('/getservicetype/:id',  async (req, res)=>{
try {
    var ServiceType = await mySqlQury("SELECT id,services_type_id,services_type_price,name,image FROM tbl_services WHERE id = "+req.params.id+"");
    const price = ServiceType[0].services_type_price.split(',')
    const type = ServiceType[0].services_type_id.split(',')
    const service = ServiceType[0].id+','+ServiceType[0].name+','+ServiceType[0].image
   
    
    const typlist =await Promise.all(
                type.map(async (data, i)=>{
                    var ServiceType = await mySqlQury("SELECT services_type FROM tbl_services_type WHERE id ="+data+"")
                  
                    return {
                        id:data,
                        servicetype:ServiceType[0].services_type,
                        price:price[i]
                    }
                })
    )
 
    res.status(200).json({data:typlist, serviceid:service})


} catch (error) {
    console.log(error);
}
})

// customer change save in cart
router.get('/newcustomerid/:id', auth, async (req, res)=>{
    try {
      
        const {id,roll,store,loginas} = req.user;
        var customerid = req.params.id;
        var cart = await mySqlQury("UPDATE tbl_cart SET customer_id="+customerid+" WHERE created_by='"+loginas+','+id+"'");

        res.status(200).json({status:200})

        
    } catch (error) {
        console.log(error);
    }
})

//  POS Service Color change
router.post('/color', auth, async (req, res)=>{
    try {
        var {id, color}= req.body;
    
        var cart = await mySqlQury("UPDATE tbl_cart_servicelist SET service_color='"+color+"' WHERE id="+id+"");
        res.status(200).json({status:200})

        
    } catch (error) {
        console.log(error);
    }
})

//  POS Date change
router.post('/date', auth, async (req, res)=>{
    try {const {id,roll,store,loginas} = req.user;
        var {date}= req.body;
      
    
         var cart = await mySqlQury("UPDATE tbl_cart SET order_date='"+date+"', delivery_date='"+date+"' WHERE created_by='"+loginas+','+id+"'");
        res.status(200).json({status:200})

        
    } catch (error) {
        console.log(error);
    }
})

//  POS Clear cart
router.get('/clearcart', auth, async (req, res)=>{
    try {
        const {id,roll,store,loginas} = req.user;
       
        var orderid = await idfororder()
        
        const cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");

        var tax = await mySqlQury("SELECT tax_percent FROM tbl_store WHERE id="+cart[0].store_id+"")
        if(cart.length > 0){
        const servicelist = cart[0].service_list_id.split(',');
        await Promise.all(
            servicelist.map(async (data, i)=>{
                 await mySqlQury("DELETE FROM tbl_cart_servicelist WHERE id="+data+"")
            })
        )
        await mySqlQury(`UPDATE tbl_cart SET order_date=CURRENT_TIMESTAMP,service_list_id=0,order_id=0,addon_id=0,addon_price=0,delivery_date=CURRENT_TIMESTAMP,extra_discount=0,
        coupon_id=0,coupon_discount=0,tax_amount=0,sub_total=0,gross_total=0,paid_amount=0,payment_type=0, order_id='${orderid}',
        balance=0,notes='', tax=${tax[0].tax_percent} WHERE created_by='${loginas},${id}'`)
        
        var cartdata = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
        var cartservice = await mySqlQury("SELECT * from tbl_cart_servicelist WHERE find_in_set(tbl_cart_servicelist.id,'"+cart[0].service_list_id+"')");

    

        res.status(200).json({cart:cartdata[0], cartservice, loginas});
        }
        
    } catch (error) {
        console.log(error);
    }
})

// change service amount
router.post('/changeamount', auth, async(req, res)=>{
    try {
        const {id,roll,store,loginas} = req.user;
      
        const { id:serviceid, price } = req.body

        const service = await mySqlQury(`SELECT * FROM tbl_cart_servicelist WHERE id=${serviceid}`)
       
        const amount_diff = (parseFloat(price) * parseFloat(service[0].service_quntity)) - (parseFloat(service[0].service_type_price) * parseFloat(service[0].service_quntity))
        const updateservice = await mySqlQury("UPDATE tbl_cart_servicelist SET service_type_price="+price+" WHERE id="+serviceid+"");
        const cartupdate = await mySqlQury("UPDATE tbl_cart SET sub_total= ROUND(sub_total + "+amount_diff+",2) , tax_amount =ROUND((sub_total + addon_price - coupon_discount - extra_discount)*tax / 100,2), gross_total = ROUND(sub_total + tax_amount + addon_price - coupon_discount - extra_discount,2), balance = ROUND(gross_total - paid_amount,2)  WHERE created_by='"+loginas+','+id+"'");


        var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
        var cartservice = await mySqlQury("SELECT * from tbl_cart_servicelist WHERE find_in_set(tbl_cart_servicelist.id,'"+cart[0].service_list_id+"')");


        res.status(200).json({cart:cart[0], cartservice, loginas});
    
    } catch (error) {
        console.log(error);
    }
})

// change service Quntity
router.post('/changequntity', auth, async(req, res)=>{
    try {
        const {id,roll,store,loginas} = req.user;
       
        const { id:serviceid, qty } = req.body

        const service = await mySqlQury(`SELECT * FROM tbl_cart_servicelist WHERE id=${serviceid}`)
        const amount_diff = (parseFloat(service[0].service_type_price) * parseFloat(qty)) - (parseFloat(service[0].service_type_price) * parseFloat(service[0].service_quntity))
        const updateservice = await mySqlQury("UPDATE tbl_cart_servicelist SET service_quntity="+qty+" WHERE id="+serviceid+"");
        const cartupdate = await mySqlQury("UPDATE tbl_cart SET sub_total= ROUND(sub_total + "+amount_diff+",2) , tax_amount =ROUND((sub_total + addon_price - coupon_discount - extra_discount) * (tax / 100),2) , gross_total = ROUND(sub_total + tax_amount + addon_price - coupon_discount - extra_discount,2) , balance = ROUND(gross_total - paid_amount,2)   WHERE created_by='"+loginas+','+id+"'");


        var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
        var cartservice = await mySqlQury("SELECT * from tbl_cart_servicelist WHERE find_in_set(tbl_cart_servicelist.id,'"+cart[0].service_list_id+"')");

      

        res.status(200).json({cart:cart[0], cartservice, loginas});
    
    } catch (error) {
        console.log(error);
    }
})


// Add Addons's to cart
router.post('/addonsadd', auth, async(req, res)=>{
    try {
        const {id,roll,store,loginas} = req.user;
        var addon = req.body.addon
        var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");

        addon ? (Array.isArray(addon) ? addon=addon.join(','):addon):(addon='0')
        const newaddonarry = addon.split(',')
        var price=0
        await Promise.all( 
            newaddonarry.map(async (data, i)=>{
                var x= await mySqlQury("SELECT price FROM tbl_addons WHERE id="+data+"")
               if(x.length > 0){
                return price += x[0].price
               }
               
            })
        )

        const cartupdate = await mySqlQury("UPDATE tbl_cart SET addon_id='"+addon+"', addon_price="+price+", tax_amount =ROUND((sub_total + addon_price - coupon_discount - extra_discount)*tax / 100,2), gross_total = ROUND(sub_total + tax_amount + addon_price - coupon_discount - extra_discount,2), balance = ROUND(gross_total - paid_amount,2)  WHERE created_by='"+loginas+','+id+"'");


        var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
        var cartservice = await mySqlQury("SELECT * from tbl_cart_servicelist WHERE find_in_set(tbl_cart_servicelist.id,'"+cart[0].service_list_id+"')");


        res.status(200).json({cart:cart[0], cartservice, loginas});
    
    } catch (error) {
       
    }
})

// coupon list on ajax call
router.get('/couponlist/:id', auth, async(req, res)=>{
    try {
        const {id,roll,store,loginas} = req.user;
        const couid = req.params.id;
        const customer = await mySqlQury("SELECT store_ID From tbl_customer WHERE id="+couid+"")

        var customer_order = await mySqlQury("SELECT * From tbl_order WHERE customer_id="+couid+"")

        if(customer_order.length > 0){
            var coupons = await mySqlQury("select * from tbl_coupon where start_date <=date(now()) AND end_date >=date(now()) AND status=0 AND find_in_set('"+customer[0].store_ID+"',store_list_id) AND coupon_type=1")

            var usedcoupon = customer_order.map(data=>data.coupon_id)
           
            var couponlist = coupons.filter((data,i)=>{
               if (data.limit_forsame_user > usedcoupon.filter(i=>i == data.id).length){
                return true
               }
            })  
          
        }else{

            var couponlist = await mySqlQury("select * from tbl_coupon where start_date <=date(now()) AND end_date >=date(now()) AND status=0 AND find_in_set('"+customer[0].store_ID+"',store_list_id)");  
        }

       
        var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
        
        res.status(200).json({cart:cart[0], couponlist});
        
    } catch (error) {
        console.log(error);
    }
})


// Add coupons to cart
router.get('/couponadd/:id', auth, async(req, res)=>{
    try {
        const {id,roll,store,loginas} = req.user;
        var couponid = req.params.id
      
        var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
        var coupon = await mySqlQury("select * from tbl_coupon where id="+couponid+"")

        const cartupdate = await mySqlQury("UPDATE tbl_cart SET coupon_id='"+couponid+"', coupon_discount="+coupon[0].discount+", tax_amount =ROUND((sub_total + addon_price - coupon_discount - extra_discount)*tax / 100,2), gross_total = ROUND(sub_total + tax_amount + addon_price - coupon_discount - extra_discount,2), balance = ROUND(gross_total - paid_amount ,2) WHERE created_by='"+loginas+','+id+"'");

        var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
        var cartservice = await mySqlQury("SELECT * from tbl_cart_servicelist WHERE find_in_set(tbl_cart_servicelist.id,'"+cart[0].service_list_id+"')");

     
        res.status(200).json({cart:cart[0], cartservice, loginas});
    
    } catch (error) {
       
    }
})

// Add manual coupons to cart
router.get('/manualcoupon/:id', auth, async(req, res)=>{
    try {
        const {id,roll,store,loginas} = req.user;
        var couponcode = req.params.id.toUpperCase()
       

         var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
         var coupon = await mySqlQury("select * from tbl_coupon where code='"+couponcode+"'")

         if(coupon.length <= 0){
            return  res.status(200).json({cart:cart[0], status:'error', message:'Invalid coupon code'})
         }else{
            var customer_order = await mySqlQury("SELECT * From tbl_order WHERE customer_id="+cart[0].customer_id+"");

                if(coupon[0].coupon_type == 2 && customer_order.length > 0 ){
                    return  res.status(200).json({cart:cart[0], status:'error', message:'This Coupon Valied Only For first Order'})
                }
            var usedcoupon = customer_order.map(data=>data.coupon_id)
                if(coupon[0].limit_forsame_user <= usedcoupon.filter(i=>i == coupon[0].id).length){
                    return  res.status(200).json({cart:cart[0], status:'error', message:'You reached This coupon use Limit'})
                }
            
                if(coupon[0].min_purchase > (cart[0].sub_total + cart[0].addon_price)){
                    return  res.status(200).json({cart:cart[0], status:'error', message:'min order amount for this coupon is '+ coupon[0].min_purchase})
                }
         }

        const cartupdate = await mySqlQury("UPDATE tbl_cart SET coupon_id='"+coupon[0].id+"', coupon_discount="+coupon[0].discount+", tax_amount =ROUND((sub_total + addon_price - coupon_discount - extra_discount)*tax / 100,2), gross_total = ROUND(sub_total + tax_amount + addon_price - coupon_discount - extra_discount,2), balance = ROUND(gross_total - paid_amount,2)  WHERE created_by='"+loginas+','+id+"'");

        var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
        var cartservice = await mySqlQury("SELECT * from tbl_cart_servicelist WHERE find_in_set(tbl_cart_servicelist.id,'"+cart[0].service_list_id+"')");

        

        res.status(200).json({cart:cart[0], cartservice, loginas});
    
    } catch (error) {
       
    }
})

// payment model require data
router.get('/paymentdata',auth, async (req, res)=>{
    try {
        const {id,roll,store,loginas} = req.user;
        var cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
        var payment = await mySqlQury("SELECT id, ac_name From tbl_account WHERE store_ID="+cart[0].store_id+"")

        res.status(200).json({cart:cart[0], payment});

    } catch (error) {
        console.log(error);
    }
})

//save order
router.post('/order',auth, async(req, res)=>{
    try {
        const {id,roll,store,loginas} = req.user;
        var orderid = await idfororder()
              
        var {deliverydate, extradiscount, paid_amount, note} = req.body;
        paid_amount ? paid_amount = paid_amount : paid_amount=0
        extradiscount ? extradiscount =extradiscount : extradiscount =0
        var payment_type = req.body.payment_type
        payment_type ? payment_type : payment_type = 0 
        const cart = await mySqlQury(" SELECT * FROM tbl_cart WHERE created_by='"+loginas+','+id+"'");
        const gross = parseFloat(cart[0].gross_total) - parseFloat(extradiscount)
        const balance = parseFloat(cart[0].gross_total) - parseFloat(extradiscount) - parseFloat(paid_amount)
        const comiss = await mySqlQury("SELECT shop_commission From tbl_store WHERE id="+cart[0].store_id+"")
        const comi_amount = (parseFloat(gross) * parseFloat(comiss[0].shop_commission)) /parseFloat(100)


        const order = await mySqlQury(`INSERT INTO tbl_order (order_id,order_date,delivery_date,order_status,service_list,customer_id,created_by,store_id,addon_data,
        addon_price,sub_total,tax,coupon_id,coupon_discount,extra_discount,gross_total,paid_amount,balance_amount,payment_data,tax_amount,note,master_comission) VALUE ('${orderid}',
        '${cart[0].order_date.toLocaleDateString('en-CA')}','${deliverydate}',${1},'${cart[0].service_list_id}','${cart[0].customer_id}','${cart[0].created_by}','${cart[0].store_id}','${cart[0].addon_id}',
        ${cart[0].addon_price},${cart[0].sub_total},'${cart[0].tax}','${cart[0].coupon_id}',${cart[0].coupon_discount},${extradiscount},${gross},${paid_amount},${balance},
        '${0}',${cart[0].tax_amount},'${note}',${comi_amount})`)

        const paymentdata = await mySqlQury(`INSERT INTO tbl_order_payment (payment_amount,payment_date,payment_account,order_id) VALUE (${paid_amount},'${cart[0].order_date.toLocaleDateString('en-CA')}',
        '${payment_type}','${order.insertId}')`)

        const updateorder = await mySqlQury(`UPDATE tbl_order SET payment_data='${paymentdata.insertId}' WHERE id='${order.insertId}'`)


        if(payment_type){
            const account = await mySqlQury("SELECT * FROM tbl_account WHERE id="+payment_type+"")
          
            const balance = parseFloat(account[0].balance) + parseFloat(paid_amount)
            await mySqlQury("UPDATE tbl_account SET balance="+balance+" WHERE id="+payment_type+" ")
            await mySqlQury(`insert into tbl_transections (account_id,store_ID,transec_detail,transec_type,debit_amount,
                credit_amount,balance_amount,date) VALUE ('${payment_type}','${account[0].store_ID}','POS Income ${orderid}','INCOME',
                0,${paid_amount},${balance},'${cart[0].order_date.toLocaleDateString('en-CA')}' )`)
        }


        // clear cart

        var orderid = await idfororder()
        var tax = await mySqlQury("SELECT tax_percent FROM tbl_store WHERE id="+cart[0].store_id+"")
      
        await mySqlQury(`UPDATE tbl_cart SET order_date=CURRENT_TIMESTAMP,service_list_id=0,addon_id=0,addon_price=0,delivery_date=CURRENT_TIMESTAMP,extra_discount=0,
        coupon_id=0,coupon_discount=0,tax_amount=0,sub_total=0,gross_total=0,paid_amount=0,payment_type=0, order_id='${orderid}',customer_id='0',
        balance=0,notes='', tax=${tax[0].tax_percent} WHERE created_by='${loginas},${id}'`)


        // data for invoice
        var cartservice = await mySqlQury("SELECT * from tbl_cart_servicelist WHERE find_in_set(tbl_cart_servicelist.id,'"+cart[0].service_list_id+"')");
        var shope = await mySqlQury("SELECT * FROM tbl_store WHERE id="+cart[0].store_id+"")
        var orderdata = await mySqlQury("SELECT * FROM tbl_order WHERE id="+order.insertId+"")

        const addon =  orderdata[0].addon_data.split(',')
        if(addon[0] != 0){
            var addonslist = await Promise.all(
                addon.map(async (data, i)=>{
                   var addondata =  await mySqlQury("SELECT * FROM tbl_addons WHERE id="+data+"");
                 
                   return {
                            id:addondata[0].id,
                            name:addondata[0].addon,
                            price:addondata[0].price
                   }
                })
            ) 
            
        }else{
            var addonslist =[]
        }

   
        if(payment_type == 0){
          
            var paymenttype = "No Amount Paid"
  
        }else{

            const payment = await mySqlQury("SELECT ac_name From tbl_account WHERE id="+payment_type+"")
            var paymenttype = payment[0].ac_name

        }
       
         var coust = await mySqlQury("SELECT * From tbl_customer WHERE id="+orderdata[0].customer_id+"")

        res.status(200).json({status:"success",cartservice, shope:shope[0],order:orderdata[0],addonslist ,paymenttype, customer:coust[0]})






    } catch (error) {
        console.log(error);
    }
})



module.exports = router