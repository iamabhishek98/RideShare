var express = require('express');
var router = express.Router();

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const sql = []
sql.query = {
    recommended_drivers : `select distinct P.name, R.email_driver, R.rating, Q.common_songs
                            from (select distinct email_driver, avg(rating) as rating 
                                    from bid B
                                    where B.is_win is true 
                                    and B.e_date is not null and B.e_time is not null
                                    group by email_driver) R, 
                                (select distinct P.email, count(*) as common_songs
                                    from likes L inner join plays P 
                                    on L.name = P.name
                                    where L.email = $1
                                    group by P.email) Q, 
                                passenger P
                            where R.email_driver = Q.email
                            and P.email = R.email_driver
                            order by rating desc, common_songs desc;`,

    avail_advertisements: `select distinct N.name, A.email, CP.current_pax, A.start_loc, A.end_loc, A.a_date, A.a_time
                            from advertisesTrip A, 
                                (select distinct P.name, P.email 
                                    from passenger P, advertisesTrip A
                                    where P.email = A.email) N, 
                                (select distinct P.email_driver, P.vehicle, P.pax-W.count as current_pax
                                    from  (select distinct Q1.email_driver, count(Q2.email_driver)
                                                    from 
                                                        (select distinct email_driver, count(*)
                                                        from bid
                                                        group by email_driver) Q1
                                                    left join 
                                                        (select distinct email_driver, count(*) 
                                                        from bid 
                                                        where is_win is true
                                                        group by email_driver) Q2
                                                    on Q1.email_driver = Q2.email_driver
                                                    group by Q1.email_driver
                                                union
                                                select distinct D.email as email_driver, 0 as count 
                                                    from driver D left join bid B
                                                    on D.email = B.email_driver
                                                    where B.email_driver is null) W, 
                                            (select distinct A.email as email_driver, A.vehicle, V.pax
                                                from vehicles V, advertisestrip A 
                                                where V.license_plate = A.vehicle) P
                                    where W.email_driver = P.email_driver) CP
                            where N.email = A.email
                            and CP.email_driver = A.email
                            order by A.a_date desc, A.a_time desc;`,

    avail_vehicle: `select distinct vehicle from advertisesTrip where email = $1 and start_loc = $2 and end_loc = $3 and a_date = $4 and a_time = $5`,

    insert_bid: `INSERT INTO bid (amount, start_loc, end_loc, email_bidder, email_driver, vehicle, s_date, s_time) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
    
    bid_win: `select * from bid where is_win is true and e_date is null and e_time is null and email_bidder = $1`,

    favourite_location: "select * from favouriteLocation where email_passenger = $1"

}

var passenger_email;
/* GET login page. */
router.get('/', function(req, res, next) {
    console.log("passenger dashboard");
    passenger_email = req.session.passport.user.email;
    if(req.session.passport == undefined){
        console.log("user not logged in");
        res.redirect('login');
    } else if(req.session.passport.user.id == "passenger"){
        //passenger success
        try {
            pool.query(sql.query.recommended_drivers, [passenger_email], (err, data) => {
                if (data != undefined) {
                    console.log(data.rows);
                    pool.query(sql.query.avail_advertisements, (err, data2) => {
                        pool.query(sql.query.favourite_location, [passenger_email], (err, data3) => {                           
                            if (data2 != undefined && data3 != undefined) {
                                console.log(data2.rows);
                                console.log(data3.rows);
                                res.render('passenger', {
                                    recommended : data.rows, 
                                    advertisements: data2.rows, title : 'Express',
                                    locations: data3.rows
                                })
                            } else {
                                console.log('available advertisements data is undefined')
                            }
                        })
                    })
                } else {
                    console.log('recommended_drivers data is undefined')
                }
            })
            
        } catch {
            console.log('passenger bid error')
        }
    } else if(req.session.passport.user.id == "driver"){
        //no access
        res.redirect('./driver');
    } else {
        res.redirect('./login');
    }   
    
/*    else {
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
    res.render('passenger', {advertisements: [], title: 'Express' });*/
});


router.post('/logout', function(req, res, next){
    req.session.passport.user.email = "";
    req.session.passport.user.password = "";
    req.session.passport.user.id = "";
    res.redirect('../login');
})

router.post('/bid2', function(req, res, next){
    var bid_num = req.body.bid_num;
    var bid_val = req.body.bid_val;

    console.log(bid_num);
    console.log(bid_val);

    res.redirect('./');
})

router.post('/bid', async function(req, res, next) {
    var bids = req.body.bid;
    var data = await pool.query(sql.query.avail_advertisements)
    if (data != undefined) {
        var advertisements = data.rows
        for (var i = 0; i < bids.length; i++) {
            if (bids[i] != '') {
                console.log(i+' '+bids[i])
                var amount = bids[i];
                var start_loc = advertisements[i].start_loc;
                var end_loc = advertisements[i].end_loc; 
                var email_bidder = passenger_email
                var email_driver = advertisements[i].email
                var s_date = advertisements[i].a_date
                var s_time = advertisements[i].a_time
                var vehicle_data = await pool.query(sql.query.avail_vehicle, [email_driver, start_loc, end_loc, s_date, s_time]);
                var vehicle;
                if (vehicle_data != undefined) {
                    console.log(vehicle_data.rows)
                    vehicle = vehicle_data.rows[0].vehicle
                } else {
                    console.log('vehicle data is undefined')
                }
                console.log(amount, start_loc, end_loc, email_bidder, email_driver, vehicle, s_date, s_time);
                try {
                    var result = await pool.query(sql.query.insert_bid, [amount, start_loc, end_loc, email_bidder, email_driver, vehicle, s_date, s_time]);
                    if (result != undefined) {
                        console.log(result)
                    } else {
                        console.log('result is undefined')
                    }
                } catch {
                    console.log('insert bid error')
                }
            }
        }
    } else {
        console.log('data is undefined')
    }
    res.redirect("./");
})


// router.post('/start_trip', function(req, res, next){
//     /**
//      * the code to check for any matching and winning bids
//      */
//     try {
//         pool.query(sql.query.bid_win, ['shagergham0@theatlantic.com'], (err, data) => {
//             if (data != undefined) {
//                 console.log(data.rows)
//                 req.session.passport.user.bid = data.rows[0];
//                 res.redirect('../trip');
//             } else {
//                 console.log('data is undefined')
//             }
//         })
//     } catch {
//         console.log('start trip error ')
//     }
// })

router.post('/inbox', function(req, res, next){
    res.redirect('../inbox');
})

router.post('/message', function(req, res, next){
    res.redirect('../message');
})

//FAV_SONG changed to a dedicated page
router.post('/fav_song', function(req, res, next){
    var fav_song_name = req.body.fav_song;
    var fav_song_playtime = req.body.fav_song_playtime;
    var fav_song_artist = req.body.fav_song_artist;
})

router.post('/panalytics', function(req, res, next){
    res.redirect('../panalytics');
})

router.post('/discount', function(req, res, next){
    res.redirect('../discount');
})

router.post('/songs', function(req, res, next){
    res.redirect('../songs');
})

router.post('/recc_drivers', function(req, res, next){
    //code for recommended drivers goes here
    
})

router.post('/feedback', function(req, res, next){
    res.redirect('../feedback');
})

router.post('/search_advertisements', function(req, res, next){
    var start_location = req.body.start_location;
    var end_location = req.body.end_location;
    console.log(start_location);
    console.log(end_location);
    res.redirect('/passenger');

})

router.post('/locations', function(req, res, next){
    res.redirect('../locations');
})

router.post('/del_bid', function(req, res, next){
    var del_index = req.body.del_index;

    res.redirect('./');
})

module.exports = router;  