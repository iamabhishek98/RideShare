var express = require('express');
var router = express.Router();
const passport = require('passport');
const session = require('express-session');

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const sql = []

sql.query = {
    all_advertisements: `select distinct A.start_loc, A.end_loc, A.a_date, A.a_time, CP.email_driver, CP.vehicle, CP.current_pax
                            from advertisestrip A, 
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
                            where A.email = CP.email_driver
                            and A.vehicle = CP.vehicle
                            and A.email = $1
                            order by A.a_date desc, A.a_time desc;`,
                            
    complete_trip: `update bid set e_date = $1, e_time = $2 where email_driver = $3 and vehicle = $4 
                        and start_loc = $5 and end_loc = $6 and s_date = $7 and s_time = $8`,
    
    add_review: `update bid set review = $6 where email_driver = $1 and vehicle = $2 and start_loc = $3 and s_date = $4 and s_time = $5`,
    
    add_rating: `update bid set rating = $6 where email_driver = $1 and vehicle = $2 and start_loc = $3 and s_date = $4 and s_time = $5`, 
    
    delete_losing_bids: `delete from bid where email_driver = $1 and vehicle = $2 and start_loc = $3 
                            and end_loc = $4 and s_date = $5 and s_time = $6 and is_win is false;`,
    
    delete_advertisement: `delete from advertisesTrip where email = $1 and vehicle = $2 and start_loc = $3 
                            and end_loc = $4 and a_date = $5 and a_time = $6;`,
    
    list_trips : `select distinct P.name as passenger, B.email_bidder, B.email_driver, B.e_date, B.e_time, B.start_loc, B.end_loc, B.review, B.rating 
                    from bid B, passenger P
                    where B.e_date is not null
                    and P.email = B.email_bidder 
                    and B.email_driver = $1
                    order by B.e_date desc, B.e_time desc;`

    /*
    update bid set e_date = '31/12/2019', e_time = '12:00:00', rating = '5' where email_driver = 'ayurenev5@icio.us' and vehicle = 'SBD0170' and start_loc = 'Queenstown' and s_date = '21/12/2018' and s_time = '09:10:00';
    update bid set e_date = '01/01/2019', e_time = '00:00:00' where email_driver = 'ayurenev5@icio.us' 
    */
}

var driver_email;
var start_trip_id; //@Abhi, look at this variable for the start-trip-id


/* GET login page. */
router.get('/', async function(req, res, next) {
    
    console.log("trip dashboard");
    console.log(req);
    console.log(req.session);
    if(req.session.passport==undefined){
        res.redirect('login');
        console.log("driver not logged in");
    } else if(req.session.passport.user.id == "driver"){
        driver_email = req.session.passport.user.email;
        start_trip_id = req.session.passport.user.start_trip_id;

        //have access
        var index = (start_trip_id)-1;
        console.log(index)
        //get trip information
        var all_adverts = await pool.query(sql.query.all_advertisements, [driver_email]);
        if (all_adverts != undefined) {
            console.log(all_adverts.rows)
            try {
                var current_advert_data = all_adverts.rows;
                var current_advert = current_advert_data[index];
                pool.query(sql.query.list_trips, [driver_email], (err, data) => {
                    if (data != undefined) {
                        console.log(data.rows)
                        if (current_advert != undefined) {
                            res.render('trip', {
                                trips: data.rows, current_trip: current_advert,
                                user_name: req.session.passport.user.name
                            });
                        } else {
                            console.log("some weird error lel");
                        }
                    } else {
                        console.log('list of trips data is undefined')
                    }
                });
            } catch (err) {
                console.log('no advertisements')
            }
        } else {
            console.log('all advertisements data is undefined')
        }
        
        console.log("you are now in the trip page: --------");
        console.log("trip id");
        console.log(start_trip_id);
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

router.post('/endtrip', async function(req, res, next){
    var index = (start_trip_id)-1;
    console.log(index)
    var end_date_time = req.body.end_datetime;
    var vehicle;
    var start_loc;
    var end_loc;
    var s_date;
    var s_time;

    //get trip information
    var all_adverts = await pool.query(sql.query.all_advertisements, [driver_email]);
    if (all_adverts != undefined) {
        console.log(all_adverts.rows)
        try {
            var current_advert_data = all_adverts.rows;
            current_advert = current_advert_data[index]
            vehicle = current_advert.vehicle;
            start_loc = current_advert.start_loc;
            end_loc = current_advert.end_loc;
            s_date = current_advert.a_date;
            s_time = current_advert.a_time;
        } catch (err) {
            res.redirect('../driver');
            console.log('no advertisements')
        }
    } else {
        console.log('all advertisements data is undefined')
    }

    console.log("CURRRENT DATE TIME:::::");
    console.log(s_date);
    console.log(s_time);
    console.log(end_date_time);
    s_date = s_date.split("T")[0];
    var start_spec = s_date + "T"+s_time;
    if(Date.parse(end_date_time) < start_spec){
        console.log("TRIP CANNOT END EARLIER THAN IT STARTED");
        res.redirect('../trip');
    } 
    
    if (vehicle != undefined && start_loc != undefined && end_loc != undefined && s_date != undefined && s_time != undefined) {
        //delete advertisement
        var delete_ad = await pool.query(sql.query.delete_advertisement, [driver_email, vehicle, start_loc, end_loc, s_date, s_time])
        if (delete_ad != undefined) {
            console.log(delete_ad);
        } else {
            console.log('delete advertisement data is undefined')
        }

        // delete losing bids first
        var delete_losing_bids = await pool.query(sql.query.delete_losing_bids, [driver_email, vehicle, start_loc, end_loc, s_date, s_time])
        if (delete_losing_bids != undefined) {
            console.log(delete_losing_bids)
        } else {
            console.log('delete losing bids data is undefined')
        }

        console.log('dates', end_date_time)
    
        // ending the actual trip
        var e_date = end_date_time.split("T")[0]
        var e_time = end_date_time.split("T")[1]
        console.log(e_date, e_time)
        var complete_trip = await pool.query(sql.query.complete_trip, [e_date, e_time, driver_email, vehicle, start_loc, end_loc, s_date, s_time])
        if (complete_trip != undefined) {
            console.log(complete_trip)
        } else {
            console.log('complete trip data is undefined')
        }
        res.redirect('../driver');
    }
    res.redirect('./');
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