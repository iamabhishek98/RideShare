var express = require('express');
var router = express.Router();
const passport = require('passport');
const session = require('express-session');

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const sql = []

sql.query = {

}
var driver_email;


/* GET login page. */
router.get('/', function(req, res, next) {
    console.log("trip dashboard");
    console.log(req)
    console.log(req.session);
    if(req.session.passport.user.email==undefined){
        console.log("driver not logged in");
    } else if(req.session.passport.user.id == "passenger"){
        //have access
        res.render('trip');
    } else if(req.session.passport.user.id == "driver"){
        res.redirect('./driver');
    } else {
        res.redirect('./login');
    }
    
    
    
    
    /*
    else {
        driver_email = req.session.passport.user.email;
        console.log(driver_email);
    }
    pool.query(sql.query.check_driver, [driver_email], async (err, data) => {
        if(data.rows.length == 0){
            console.log("This user cannot access the driver dashboard");
            res.redirect('./passenger');
        } else {
            console.log("This is a driver account");
            try {
                // need to only load driver related bids
                pool.query(sql.query.available_bids, ['rdoog6@yandex.ru'], (err, data) => {
                    console.log(data.rows)
                    res.render('driver', {bid: data.rows, title : 'Express'})
                })
            } catch {
                console.log('driver available bids error')
            }
        }
    })
    */
})

router.post('/logout', function(req, res, next){
    req.session.passport.user.email = "";
    req.session.passport.user.password = "";
    req.session.passport.user.id = "";
    console.log(session);
    res.redirect('../login');
})


router.post('/endtrip', function(req, res, next){
    console.log(req.body.datetime);
    console.log(req.body.text_area);
    console.log(req.body.selectpicker);
})

module.exports = router;