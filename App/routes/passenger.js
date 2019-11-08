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
                                (select T.email_driver, T.vehicle, (T.pax - O.occupancy) as current_pax
                                    from (select D.email as email_driver, D.license_plate as vehicle, V.pax
                                            from drives D, vehicles V
                                            where D.license_plate = V.license_plate) T,
                                    ((select email as email_driver, license_plate as vehicle, 0 as occupancy 
                                        from drives 
                                        where (email, license_plate) 
                                            not in (select Q1.email_driver, Q1.vehicle
                                                        from 
                                                            (select email_driver, vehicle, count(*)
                                                            from bid
                                                            where e_date is null
                                                            group by email_driver, vehicle) Q1
                                                        left join 
                                                            (select email_driver, vehicle, count(*) 
                                                            from bid 
                                                            where is_win is true
                                                            and e_date is null
                                                            group by email_driver, vehicle) Q2
                                                        on  Q1.vehicle = Q2.vehicle
                                                        and Q1.email_driver = Q2.email_driver
                                                        group by Q1.email_driver, Q1.vehicle))
                                    union 
                                    (select Q1.email_driver, Q1.vehicle, coalesce(sum(Q2.count),0) as occupancy
                                        from 
                                            (select email_driver, vehicle, count(*)
                                            from bid
                                            where e_date is null
                                            group by email_driver, vehicle) Q1
                                        left join 
                                            (select email_driver, vehicle, count(*) 
                                            from bid 
                                            where is_win is true
                                            and e_date is null
                                            group by email_driver, vehicle) Q2
                                        on  Q1.vehicle = Q2.vehicle
                                        and Q1.email_driver = Q2.email_driver
                                        group by Q1.email_driver, Q1.vehicle)) O
                                    where T.email_driver = O.email_driver and T.vehicle = O.vehicle) CP
                            where N.email = A.email
                            and CP.email_driver = A.email
                            order by A.a_date desc, A.a_time desc;`,

    avail_vehicle: `select distinct vehicle from advertisesTrip where email = $1 and start_loc = $2 and end_loc = $3 and a_date = $4 and a_time = $5`,

    insert_bid: `INSERT INTO bid (amount, start_loc, end_loc, email_bidder, email_driver, vehicle, s_date, s_time) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
    
    bid_win: `select * from bid where is_win is true and e_date is null and e_time is null and email_bidder = $1`,

    favourite_location: `select * from favouriteLocation where email_passenger = $1`,

    current_bids:`select P.name as driver, B.email_bidder, B.email_driver, B.start_loc, B.end_loc, B.s_date, B.s_time 
                    from bid B, passenger P 
                    where B.email_driver = P.email 
                    and B.e_date is null 
                    and B.email_bidder = $1;`

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
                            pool.query(sql.query.current_bids, [passenger_email], (err, data4) => {
                                if (data2 != undefined && data3 != undefined && data4 != undefined) {
                                    console.log(data2.rows);
                                    console.log(data3.rows);
                                    console.log(data4.rows)
                                    res.render('passenger', {
                                        recommended : data.rows, 
                                        advertisements: data2.rows,
                                        locations: data3.rows,
                                        current_bids: data4.rows
                                    })
                                } else {
                                    console.log('available advertisements data is undefined')
                                }
                            })
                            
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

router.post('/bid', async function(req, res, next){
    var bid_num = req.body.bid_num;
    var bid_val = req.body.bid_val;

    var avail_data = await pool.query(sql.query.avail_advertisements)
    if (avail_data != undefined) {
        console.log(avail_data.rows)
        var advertisement = avail_data.rows[bid_num-1]
        var amount = bid_val;
        var start_loc = advertisement.start_loc;
        var end_loc = advertisement.end_loc; 
        var email_bidder = passenger_email
        var email_driver = advertisement.email
        var s_date = advertisement.a_date
        var s_time = advertisement.a_time
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
    } else {
        console.log("avail data is undefined")
    }
    // console.log(bid_num);
    // console.log(bid_val);

    res.redirect('./');
})

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

module.exports = router;  