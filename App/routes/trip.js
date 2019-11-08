var express = require('express');
var router = express.Router();
const passport = require('passport');
const session = require('express-session');

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const sql = []

sql.query = {
    complete_trip: `update bid set e_date = $1, e_time = $2, rating = $3 where email_driver = $4 and vehicle = $5 and start_loc = $6 and s_date = $7 and s_time = $8`,
    add_review: `update bid set review = $6 where email_driver = $1 and vehicle = $2 and start_loc = $3 and s_date = $4 and s_time = $5`,
    add_rating: `update bid set rating = $6 where email_driver = $1 and vehicle = $2 and start_loc = $3 and s_date = $4 and s_time = $5`

    /*
    update bid set e_date = '31/12/2019', e_time = '12:00:00', rating = '5' where email_driver = 'ayurenev5@icio.us' and vehicle = 'SBD0170' and start_loc = 'Queenstown' and s_date = '21/12/2018' and s_time = '09:10:00';
    update bid set e_date = '01/01/2019', e_time = '00:00:00' where email_driver = 'ayurenev5@icio.us' 
    */
}

var driver_email;
var bid_val;
var start_trip_id; //@Abhi, look at this variable for the start-trip-id


/* GET login page. */
router.get('/', function(req, res, next) {
    console.log("trip dashboard");
    console.log(req)
    console.log(req.session);
    if(req.session.passport==undefined){
        console.log("driver not logged in");
    } else if(req.session.passport.user.id == "driver"){
        //have access
        res.render('trip');
        bid_val = req.session.passport.user.bid;
        start_trip_id = req.session.passport.user.start_trip_id;
        console.log("you are now in the trip page: --------");
        console.log(parseInt(start_trip_id)*2);
        console.log("trip id");
        console.log(start_trip_id);
    } else if(req.session.passport.user.id == "passenger"){
        res.redirect('./passenger');
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
    var start_date_time = req.body.start_datetime;
    var end_date_time = req.body.end_datetime;
    console.log(start_date_time);
    console.log(end_date_time);

    /**
     * Logic goes here
     */
    res.redirect('../driver');
})


router.post('/endtrip', function(req, res, next){
    var email_driver = bid_val.email_driver
    var vehicle = bid_val.vehicle
    var start_loc = bid_val.start_loc.split(" ")[0]
    var temp = bid_val.s_date
    var s_date = new Date(temp).getDate()+"/"+new Date(temp).getMonth()+"/"+new Date(temp).getFullYear()
    var s_time = bid_val.s_time
    var date = req.body.datetime.split("T")[0].split("-")[2]+"/"+req.body.datetime.split("T")[0].split("-")[1]+"/"+req.body.datetime.split("T")[0].split("-")[0]
    var time = req.body.datetime.split("T")[1]+":00";
    var review = req.body.text_area
    var rating = req.body.selectpicker
    console.log(email_driver, vehicle, start_loc, s_date, s_time, date, time, rating)
    pool.query(sql.query.complete_trip, [date, time, rating, email_driver, vehicle, start_loc, s_date, s_time], (err, data) => {
        if (data != undefined) {
            console.log(data)
        } else {
            console.log('data is undefined')
        }
    })
    // pool.query(sql.query.add_review, [email_driver, vehicle, start_loc, s_date, s_date, review], (err, data) => {
    //     console.log(data.rows)
    // })
})

router.post('/dashboard', function(req, res, next){
    if(req.session.passport.user.id == "driver"){
        res.redirect('../driver');
    } else if(req.session.passport.user.id == "passenger"){
        res.redirect('../passenger');
    } else {
        res.redirect('../login');
    }
})
module.exports = router;