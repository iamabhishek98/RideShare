var express = require('express');
var router = express.Router();
const passport = require('passport');
const session = require('express-session');

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const sql = []
sql.query = {

    check_driver: 'select * from driver where email = $1',

    all_vehicles: `select distinct D.license_plate, V.pax
                    from drives D, vehicles V
                    where D.license_plate = V.license_plate
                    and D.email = $1;`,

    advertise: `INSERT INTO advertisesTrip (start_loc, end_loc, email, vehicle, a_date,a_time) VALUES($1, $2, $3, $4, $5, $6)`,   
    
    available_bids: `select distinct N.name, CP.current_pax, B.email_bidder, B.vehicle, B.start_loc, B.end_loc, B.amount, B.s_date, B.s_time
                        from Bid B, 
                            (select distinct P.name, P.email
                                from passenger P, bid B
                                where P.email = B.email_bidder) N,
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
                        where B.email_bidder = N.email
                        and B.email_driver = CP.email_driver
                        and B.vehicle = CP.vehicle
                        and B.email_driver = $1;`,

    bid_win: `update bid set is_win = true
    where email_bidder = $1 and email_driver = $2
    and vehicle = $3 and start_loc = $4 and amount = $5 
    and s_date = $6 and s_time = $7;
    `,
    
    insert_vehicle: 'insert into vehicles(license_plate, pax) values($1, $2)',

    insert_drives: 'insert into drives(email, license_plate) values($1, $2)',
    
    get_drives: 'select * from drives where email = $1',

    delete_drives: 'delete from drives where email = $1 and license_plate = $2',

    delete_vehicle: 'delete from vehicles from license_plate = $1'
}

var driver_email;

/* GET login page. */
router.get('/', function(req, res, next) {
    driver_email = req.session.passport.user.email;
    console.log("driver dashboard");
    console.log(req.session);
    if(req.session.passport.user.email==undefined){
        console.log("driver not logged in");
    } else if(req.session.passport.user.id == "driver"){
        console.log("This is a driver account");
        try {
            // need to only load driver related bids
            pool.query(sql.query.all_vehicles, [driver_email], (err, data) => {
                if (data != undefined) {
                    console.log(data.rows)
                    pool.query(sql.query.available_bids, [driver_email], (err, data2) => {
                        if (data2 != undefined) {
                            console.log(data2.rows)
                            pool.query(sql.query.get_drives, [driver_email], (err, result) => {
                                console.log(result);
                                res.render('driver', {bid: data2.rows, all_vehicles: data.rows, vehicles: result.rows, title : 'Express'})
                            })
                        } else {
                            console.log('available bids data is undefined')
                        }
                    })
                } else {
                    console.log('all vehicles data is undefined')
                }
            })
            
        } catch {
            console.log('driver available bids error')
        }
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

router.post('/add_vehicle', async function(req, res, next){
    console.log(req.session.passport.user.email);
    console.log(req.body.newVehicleNum);
    console.log(req.body.paxPicker);

    var vehicleNum = req.body.newVehicleNum;
    var paxPicker = req.body.paxPicker;
    var insert_vehicle = await pool.query(sql.query.insert_vehicle, [vehicleNum, paxPicker]);
    if (insert_vehicle != undefined) {
        console.log(insert_vehicle)
    } else {
        console.log('insert vehicle data is undefined')
    }
    var insert_drives = await pool.query(sql.query.insert_drives, [driver_email, vehicleNum]);
    if (insert_drives != undefined) {
        console.log(insert_drives)
    } else {
        console.log('insert drives data is undefined')
    }
    res.redirect('../driver');
})

router.post('/bid_true', async function(req, res, next) {
    console.log(req.body.bid_true);
    var index = req.body.bid_true-1;
    var data = await pool.query(sql.query.available_bids, [driver_email])
    if (data != undefined) {
        var bids = data.rows
            var email_bidder = bids[index].email_bidder;
            // to be changed to current user
            var email_driver = driver_email;
            var vehicle = bids[index].vehicle;
            var start_loc = bids[index].start_loc;
            var amount = bids[index].amount;
            var s_date = bids[index].s_date;
            var s_time = bids[index].s_time;
            console.log(email_bidder, email_driver, vehicle, start_loc, amount, s_date, s_time)
            try {
                var result = await pool.query(sql.query.bid_win, [email_bidder, email_driver, vehicle, start_loc, amount, s_date, s_time]);
                if (result != undefined) {
                    console.log(result)
                    // res.redirect('../trip');
                } else {
                    console.log('result is undefined')
                }
            } catch {
                console.log('driver set bid true error')
            }
    } else {
        console.log('data is undefined.')
    }
    res.redirect("./");
})

/////////////if location does not exist, insert location (might make sense for location must be preloaded)
router.post('/advertise', function(req, res, next) {
    var origin = req.body.origin;
    var destination = req.body.destination;
    var vehicle_num = req.body.selectpicker;
    console.log("vehicle num :"+vehicle_num);

    var date = req.body.datetime.split("T")[0].split("-")[2]+"/"+req.body.datetime.split("T")[0].split("-")[1]+"/"+req.body.datetime.split("T")[0].split("-")[0]
    var time = req.body.datetime.split("T")[1]+":00";
    try {
        pool.query(sql.query.advertise, [origin, destination, driver_email, vehicle_num, date, time], (err, data) => {
            if (data != undefined) {
                console.log(data)
            } else {
                console.log('data is undefined.')
            }
        })
    } catch {
        console.log('driver advertise error')
    }
    res.redirect("./");
})

router.post('/start_trip', function(req, res, next){
    /**
     * the code to check for any matching and winning bids
     */
    // try {
    //     pool.query(sql.query.bid_win, ['shagergham0@theatlantic.com'], (err, data) => {
    //         if (data != undefined) {
    //             console.log(data.rows)
    //             req.session.passport.user.bid = data.rows[0];
    //             res.redirect('../trip');
    //         } else {
    //             console.log('data is undefined');
    //             //@Abhi, this is where the code ends up now
    //         }
    //     })
    // } catch {
    //     console.log('start trip error ')
    // }

    if(req.session.passport.user.id == "driver"){
        var num = req.body.start_trip_id;
        console.log(num);
        req.session.passport.user.start_trip_id = num;
        res.redirect('../trip');
    } else if (req.session.passport.user.bid == "passenger") {
        res.redirect('../passenger');
    } else {
        res.redirect('../login');
    }
})

router.post('/delete_vehicle', async function(req, res, next) {
    var delete_id = req.body.delete_vehicle_id-1;
    var all_vehicles_data = await pool.query(sql.query.all_vehicles, [driver_email]);
    if (all_vehicles_data != undefined) {
        console.log(all_vehicles_data.rows)
        var vehicle = all_vehicles_data.rows[delete_id].license_plate;
        pool.query(sql.query.delete_drives, [driver_email, vehicle], (err, data) => {
            if (data != undefined) {
                console.log(data)
                pool.query(sql.query.delete_vehicle, [vehicle], (err, data2) => {
                    if (data2 != undefined) {
                        console.log(data2)
                    } else {
                        console.log('delete vehicle data is undefined')
                    }
                })
            } else {
                console.log('delete drives data is undefined')
            }
        })  
    } else {
        console.log('all vehicles data is undefined')
    }
    res.redirect("./")
})

router.post('/inbox', function(req, res, next){
    res.redirect('../inbox');
})

router.post('/danalytics', function(req, res, next){
    res.redirect('../danalytics');
})


module.exports = router;  