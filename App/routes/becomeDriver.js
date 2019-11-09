var express = require('express');
var router = express.Router();

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const sql = []
sql.query = {
    insert_vehicle: 'insert into vehicles(license_plate, pax) values($1, $2)',
    insert_drives: 'insert into drives(email, license_plate) values($1, $2)',
    insert_driver: 'insert into driver(email) values($1)',

    add_driver: "BEGIN TRANSACTION "+
                "insert into vehicles(license_plate, pax) values($1, $2);"+ 
                "insert into driver(email) values($3);" +
                "insert into drives(email, license_plate) values($3, $1)"+
                "COMMIT"
}

router.get('/', function(req, res, next){
    if(req.session.passport == undefined){
        console.log("attempt at unauthorised access");
        res.redirect('./login');
    } else if(req.session.passport.user.id == "driver"){
        console.log("should not be here");
        res.redirect('./driver');
    } else if(req.session.passport.user.id == "passenger"){
        //we need to now create a driver account for the user now
        res.render('becomeDriver', {title: 'Express '});
    } else {
        //whatever reason
        res.redirect('./login');
    }
})

router.post('/', async function(req, res, next){

})

router.post('/register_vehicle', async function(req, res, next){
    console.log(req.body.vehicleNumber);
    console.log(req.body.paxPicker);
    if(req.body.vehicleNumber){
        // pool.query(sql.query.insert_vehicle, [req.body.vehicleNumber, req.body.paxPicker]);
        // pool.query(sql.query.insert_driver, [req.session.passport.user.email]);
        // pool.query(sql.query.insert_drives, [req.session.passport.user.email, req.body.vehicleNumber]);
        //pool.query(sql.query.add_driver, [req.body.vehicleNumber, req.body.paxPicker, req.session.passport.user.email]);



        // pool.query(sql.query.insert_vehicle, [req.body.vehicleNumber, req.body.paxPicker], async (err, data) => {
        //     if(err){
        //         console.log("NOOOOOOOOOOOOOOOOOOOO1");
        //     } else {
        //         pool.query(sql.query.insert_driver, [req.session.passport.user.email], async (err, data) =>{
        //             if(err){
        //                 console.log("NOOOOOOOOOO2");
        //             } else {
        //                 pool.query(sql.query.insert_drives, [req.session.passport.user.email, rSeq.body.vehicleNumber], async (err, data) => {
        //                     if(err){
        //                         console.log("NOOOOOOOOOOOO3")
        //                     } else {
        //                         console.log("All QUERIES SUCCESSSSSS");
        //                     }
        //                 });
                        
        //             }
        //         });
        //     }   
        // });


        var data1 = await pool.query(sql.query.insert_vehicle, [req.body.vehicleNumber, req.body.paxPicker]);
        var data2 = await pool.query(sql.query.insert_driver, [req.session.passport.user.email]);
        var data3 = await pool.query(sql.query.insert_drives, [req.session.passport.user.email, req.body.vehicleNumber]);
        
        console.log("query successs");
        req.session.passport.user.id="driver";
        res.redirect('../driver');
    }
    res.redirect('./');

})

module.exports = router;