var express = require('express');
var router = express.Router();
const passport = require('passport');
const session = require('express-session');

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const sql = []

sql.query = {
    all_advertisements: `select * from advertisements;`,
    complete_trip: `update bid set e_date = $1, e_time = $2, rating = $3 where email_driver = $4 and vehicle = $5 and start_loc = $6 and s_date = $7 and s_time = $8`,
    add_review: `update bid set review = $6 where email_driver = $1 and vehicle = $2 and start_loc = $3 and s_date = $4 and s_time = $5`,
    add_rating: `update bid set rating = $6 where email_driver = $1 and vehicle = $2 and start_loc = $3 and s_date = $4 and s_time = $5`, 
    delete_losing_bids: `delete from Bid where email_driver = $1 and vehicle = $2 and start_loc = $3 
                            and end_loc = $4 and s_date = $5 and s_time = $6 and is_win is false;`,
    delete_advertisement: `delete from advertisesTrip where email = $1 and vehicle = $2 and start_loc = $3 
                            and end_loc = $4 and a_date = $5 and a_time = $6;`

    /*
    update bid set e_date = '31/12/2019', e_time = '12:00:00', rating = '5' where email_driver = 'ayurenev5@icio.us' and vehicle = 'SBD0170' and start_loc = 'Queenstown' and s_date = '21/12/2018' and s_time = '09:10:00';
    update bid set e_date = '01/01/2019', e_time = '00:00:00' where email_driver = 'ayurenev5@icio.us' 
    */
}

var driver_email;
var bid_val;

/* GET login page. */
router.get('/', async function(req, res, next) {
    driver_email = req.session.passport.user.email;
    console.log("trip dashboard");
    console.log(req)
    console.log(req.session);
    if(req.session.passport.user.email==undefined){
        console.log("driver not logged in");
    } else if(req.session.passport.user.id == "driver"){
        //have access
        res.render('trip');
        bid_val = req.session.passport.user.bid;
        console.log("you are now in the trip page: --------");
        console.log(bid_val);
    } else if(req.session.passport.user.id == "passenger"){
        res.redirect('./passenger');
    } else {
        res.redirect('./login');
    }
})

router.post('/logout', function(req, res, next){
    req.session.passport.user.email = "";
    req.session.passport.user.password = "";
    req.session.passport.user.id = "";
    console.log(session);
    res.redirect('../login');
})

router.post('/endtrip', function(req, res, next){
    var end_date_time = req.body.end_datetime;
    // console.log(end_date_time);
    var delete_ad = pool.query(sql.query.delete_advertisement, [driver_email, vehicle, start_loc, end_loc, a_date, a_time])
    if (delete_ad != undefined) {
        console.log(delete_ad);
    } else {
        console.log('delete advertisement data is undefined')
    }
    var delete_losing_bids = pool.query(sql.query.delete_losing_bids, [driver_email, vehicle, start_loc, end_loc, s_date, s_time])
    if (delete_losing_bids != undefined) {
        console.log(delete_losing_bids)
    } else {
        console.log('delete losing bids data is undefined')
    }
   
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