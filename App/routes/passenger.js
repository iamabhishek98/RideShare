var express = require('express');
var router = express.Router();

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const sql = []
sql.query = {
    avail_advertisements: `select distinct N.name, A.start_loc, A.end_loc, A.a_date, A.a_time
    from advertisesTrip A, (select distinct U.name, U.email 
    from users U, advertisesTrip A
    where U.email = A.email) N
    where N.email = A.email
    order by A.a_date asc, A.a_time asc;`,

    bid_advertisements: `select * from advertisesTrip;`,

    insert_bid: `INSERT INTO bid (amount, start_loc, end_loc, email_bidder, email_driver, s_date, s_time) VALUES($1, $2, $3, $4, $5, $6, $7)`   
}


var passenger_email;
/* GET login page. */
router.get('/', function(req, res, next) {
    console.log("passenger dashboard");
    if(req.session.passport.user.email == undefined){
        console.log("user not logged in");
    } else {
        passenger_email = req.session.passport.user.email;
        console.log(passenger_email);
    }
    try {
        pool.query(sql.query.avail_advertisements, (err, data) => {
            console.log(data.rows)
            res.render('passenger', {
                advertisements: data.rows
            })
        })
    } catch {
        console.log('passenger bid error')
    }
    // res.render('passenger', {advertisements: [], title: 'Express' });
});

router.post('/bid', async function(req, res, next) {
    var bids = req.body.bid;
    var data = await pool.query(sql.query.bid_advertisements)
    var advertisements = data.rows
      
    for (var i = 0; i < bids.length; i++) {
        if (bids[i] != '') {
            console.log(i+' '+bids[i])
            // check if amount is a number
            // if (bids[i]<0) break;
            var amount = bids[i];
            var start_loc = advertisements[i].start_loc;
            var end_loc = advertisements[i].end_loc; 
            // to be changed to current user
            var email_bidder = 'shagergham0@theatlantic.com'
            var email_driver = advertisements[i].email
            var s_date = advertisements[i].a_date
            var s_time = advertisements[i].a_time
            try {
                var result = await pool.query(sql.query.insert_bid, [amount, start_loc, end_loc, email_bidder, email_driver, s_date, s_time]);
                console.log(result)
            } catch {
                console.log('insert bid error')
            }
        }
    }
})

module.exports = router;  