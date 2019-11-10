var express = require("express");
var router = express.Router();

const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = {};
sql.query = {
    list_trips : `select distinct P.name as passenger, B.email_bidder, B.amount, B.email_driver, B.e_date, B.e_time, B.start_loc, B.end_loc, B.review, B.rating 
                    from bid B, passenger P
                    where B.e_date is not null
                    and P.email = B.email_bidder 
                    and B.email_driver = $1
                    order by B.e_date desc, B.e_time desc;`
};

router.get("/", function(req, res, next){
    if(req.session.passport == undefined){
        //no access
        res.redirect('login');
    } else if (req.session.passport.user.id == "driver"){
        driver_email = req.session.passport.user.email;
                //have access
                pool.query(sql.query.list_trips, [driver_email], (err, data) => {
                    if (data != undefined) {
                        console.log(data.rows)
                        res.render('driverHistory', {
                            trips: data.rows,
                            user_name: req.session.passport.user.name
                        });
                    } else {
                        console.log('list of trips data is undefined')
                    }
                });
    } else if (req.session.passport.user.id == "passenger"){
        //no access -> passenger dashboard
        res.redirect('./passenger');
    } else {
        //gtfo
        res.redirect('./login');
    }
    
//    res.render("driverHistory", {title: "Express"});

})

module.exports = router;