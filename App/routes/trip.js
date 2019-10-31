var express = require('express');
var router = express.Router();
const passport = require('passport');
const session = require('express-session');

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const sql = []

sql.query = {
    complete_trip: `update bid set e_date = $6 and e_time = $7 where email_driver = $1 and vehicle = $2 and start_loc = $3 and s_date = $4 and s_time = $5`,
    add_review: `update bid set review = $6 where email_driver = $1 and vehicle = $2 and start_loc = $3 and s_date = $4 and s_time = $5`,
    add_rating: `update bid set rating = $6 where email_driver = $1 and vehicle = $2 and start_loc = $3 and s_date = $4 and s_time = $5`
}
var driver_email;
var bid_val;

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
        bid_val = req.session.passport.user.bid;
        console.log("you are now in the trip page: --------");
        console.log(bid_val);
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