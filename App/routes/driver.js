var express = require('express');
var router = express.Router();
const passport = require('passport');
const session = require('express-session');

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const sql = []
sql.query = {
    advertise: `INSERT INTO advertisesTrip (start_loc, end_loc, email, a_date, a_time) VALUES($1, $2, $3, $4, $5)`,   
    
    available_bids: `select distinct N.name, B.email_bidder, B.email_driver, B.start_loc, B.end_loc, B.amount, B.s_date, B.s_time
    from Bid B, (select distinct U.name, U.email
    from users U, bid B
    where U.email = B.email_bidder) N;`,

    bid_win: `update bid set is_win = true
    where email_bidder = $1 and email_driver = $2
    and start_loc = $3 and amount = $4 
    and s_date = $5 and s_time = $6;
    `
}

var driver_email;

/* GET login page. */
router.get('/', function(req, res, next) {
    console.log("driver dashboard");
    if(req.session.passport.user.email==undefined){
        console.log("driver not logged in");
    } else {
        driver_email = req.session.passport.user.email;
        console.log(driver_email);
    }
    try {
        // need to only load driver related bids
        pool.query(sql.query.available_bids, (err, data) => {
            console.log(data.rows)
            res.render('driver', {bid: data.rows, title : 'Express'})
        })
    } catch {
        console.log('driver available bids error')
    }
});

router.post('/bid_true', async function(req, res, next) {
    console.log(req.body.bid_true);
    var index = req.body.bid_true-1;
    var data = await pool.query(sql.query.available_bids)
    var bids = data.rows
    if (index >= 0 && index < bids.length) {
        var email_bidder = bids[index].email_bidder;
        // to be changed to current user
        var email_driver = 'rdoog6@yandex.ru';
        var start_loc = bids[index].start_loc;
        var amount = bids[index].amount;
        var s_date = bids[index].s_date;
        var s_time = bids[index].s_time;
        try {
            var result = await pool.query(sql.query.bid_win, [email_bidder, email_driver, start_loc, amount, s_date, s_time]);
            console.log(result)
        } catch {
            console.log('driver set bid true error')
        }
    } else {
        console.log('invalid index');
    }

})

router.post('/advertise', function(req, res, next) {
    var origin = req.body.origin;
    var destination = req.body.destination;
    // email to be changed to logged in user
    var email = 'ayurenev5@icio.us';
    var date = req.body.datetime.split("T")[0].split("-")[2]+"/"+req.body.datetime.split("T")[0].split("-")[1]+"/"+req.body.datetime.split("T")[0].split("-")[0]
    var time = req.body.datetime.split("T")[1]+":00";
    try {
        pool.query(sql.query.advertise, [origin, destination, email, date, time], (err, data) => {
            console.log(data.rows)
        })
    } catch {
        console.log('driver advertise error')
    }
})

module.exports = router;  