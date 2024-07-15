const  express = require('express');
const connection = require('../connection');
const  router = express.Router();
const  ejs = require('ejs');
const  pdf = require('html-pdf');
const  path = require('path');
const  fs = require('fs');
const  uuid = require('uuid');
const  auth = require('../services/authentication');

router.post('/generateReport', auth.authenticateToken, (req,res)=>{
    const generateuuid = uuid.v1();
    const orderDetails = req.body;
    var productDetailsReport = JSON.parse(orderDetails.productDetails);

    query = 'insert into bill (name, uuid, email, contactNumber, paymentMethod, total, productDetails, createdBy) value(?,?,?,?,?,?,?,?)';
    connection.query(query, [orderDetails.name,generateuuid,orderDetails.email,orderDetails.contactNumber,orderDetails.paymentMethod,orderDetails.totalAmount,orderDetails.productDetails, res.locals.email], (err,results)=>{
        if(!err){
            ejs.renderFile(path.join(__dirname,'',"report.ejs"),{productDetails: productDetailsReport, name:orderDetails.name, email:orderDetails.email, contactNumber:orderDetails.contactNumber, paymentMethod: orderDetails.paymentMethod, totalAmount:orderDetails.totalAmount},(err,results)=>{
                if(!err){
                    pdf.create(results).toFile('./generated_pdf/' + generateuuid + ".pdf", function(err, data){
                        if(err){
                            console.log(err);
                            return res.status(500).json(err);
                        }
                        else{
                            console.log("uuid");
                            return res.status(200).json({uuid: generateuuid});
                        }
                    })
                }
                else{
                    // console.log("PDF");
                    // throw err;
                    return res.status(500).json(err);
                }
            })
        }
        else{
            console.log("renderfile");
            return res.status(500).json(err);
        }
    })
})

router.post('/getPdf',auth.authenticateToken,function(req,res){
    const orderDetails = req.body;
    const pdfPath = './generated_pdf/'+ orderDetails.uuid+'.pdf';
    if(fs.existsSync(pdfPath)){
        res.contentType("application/pdf");
        fs.createReadStream(pdfPath).pipe(res);
    }
    else{
        var productDetailsReport = JSON.parse(orderDetails.productDetails);
        ejs.renderFile(path.join(__dirname,'',"report.ejs"),{productDetails: productDetailsReport, name:orderDetails.name, email:orderDetails.email, contactNumber:orderDetails.contactNumber, paymentMethod: orderDetails.paymentMethod, totalAmount:orderDetails.totalAmount},(err,results)=>{
            if(!err){
                pdf.create(results).toFile('./generated_pdf/' + orderDetails.uuid + ".pdf", function(err, data){
                    if(err){
                        console.log(err);
                        return res.status(500).json(err);
                    }
                    else{
                        console.log("uuid");
                        res.contentType("application/pdf");
                        fs.createReadStream(pdfPath).pipe(res);
                    }
                })
            }
            else{
                return res.status(500).json(err);
            }
        })
    }
})

// to get all billls
router.get('/getBills',auth.authenticateToken,(req,res,next)=>{
    var query = "select * from bill order by id DESC";
    connection.query(query,(err,results)=>{
        if(!err){
            return res.status(200).json(results);
        }
        else{
            return res.status(500).json(err);
        }
    })
})

router.delete('/delete/:id',auth.authenticateToken,(req,res,next)=>{
    const id = req.params.id;
    var query = "Delete from bill where id=?";
    connection.query(query,[id],(err,results)=>{
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message:"Bill ID not Found."});
            }
            else{

                return res.status(200).json({message:"Bill Deleted Successfully!!"});
            }
        }
        else{
            return res.status(500).json(err);
        }
    })  
})
module.exports = router;