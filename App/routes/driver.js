var express = require('express');
var router = express.Router();
const passport = require('passport');
const session = require('express-session');

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const sql = []
sql.query = {
    get_user_name: 'select name from passenger where email = $1',
    check_driver: 'select * from driver where email = $1',

    all_vehicles: `select distinct D.license_plate, V.pax
                    from drives D, vehicles V
                    where D.license_plate = V.license_plate
                    and D.email = $1;`,

    advertise: `INSERT INTO advertisesTrip (start_loc, end_loc, email, vehicle, a_date,a_time) VALUES($1, $2, $3, $4, $5, $6)`,   
    
    available_bids: `select distinct N.name, B.email_bidder, B.vehicle, B.start_loc, B.end_loc, B.amount, B.s_date, B.s_time
                        from Bid B, 
                            (select distinct P.name, P.email
                                from passenger P, bid B
                                where P.email = B.email_bidder) N
                        where B.email_bidder = N.email
                        and B.email_driver = $1
                        and B.is_win is false;`,

    accepted_bids: `select distinct N.name, B.email_bidder, B.vehicle, B.start_loc, B.end_loc, B.amount, B.s_date, B.s_time
                        from Bid B, 
                        (select distinct P.name, P.email
                            from passenger P, bid B
                            where P.email = B.email_bidder) N
                        where B.email_bidder = N.email
                        and B.email_driver = $1
                        and B.is_win is true;`,

    available_adverts : `select distinct A.start_loc, A.end_loc, A.a_date, A.a_time, CP.email_driver, CP.vehicle, CP.current_pax
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

    bid_win: `update bid set is_win = true
                where email_bidder = $1 and email_driver = $2
                and vehicle = $3 and start_loc = $4 and amount = $5 
                and s_date = $6 and s_time = $7;`,
    
    insert_vehicle: 'insert into vehicles(license_plate, pax) values($1, $2)',

    insert_drives: 'insert into drives(email, license_plate) values($1, $2)',
    
    get_drives: 'select * from drives where email = $1',

    delete_drives: 'delete from drives where email = $1 and license_plate = $2',

    delete_vehicle: 'delete from vehicles from license_plate = $1'
}

var driver_email;

/* GET login page. */
router.get('/', async function(req, res, next) {
    
    console.log("driver dashboard");
    console.log(req.session);
    if(req.session.passport==undefined){
        console.log("driver not logged in");
        res.redirect('login');
    } else if(req.session.passport.user.id == "driver"){
        console.log("This is a driver account");
        driver_email = req.session.passport.user.email;

        try {

            var name_of_user = "";
            try{
                var data_pack = await pool.query(sql.query.get_user_name, [driver_email]);
                console.log("Passenger name info: ------");
                console.log(data_pack);
                name_of_user = data_pack.rows[0].name;
                req.session.passport.user.name = name_of_user;
            } catch {
                name_of_user = "";
                console.log("name error T.T");
            }




            // need to only load driver related bids
            pool.query(sql.query.all_vehicles, [driver_email], (err, data) => {
                if (data != undefined) {
                    console.log(data.rows)
                    pool.query(sql.query.available_bids, [driver_email], (err, data2) => {
                        if (data2 != undefined) {
                            console.log(data2.rows)
                            pool.query(sql.query.get_drives, [driver_email], (err, result) => {
                                console.log(result);
                                pool.query(sql.query.available_adverts, [driver_email], (err, data3) => {
                                    if (data3 != undefined) {
                                        console.log(data3.rows)
                                        pool.query(sql.query.accepted_bids, [driver_email], (err, data4) => {
                                            if (data4 != undefined) {
                                                console.log(data4.rows)
                                                res.render('driver', {available_bids: data2.rows, accepted_bids: data4.rows, all_vehicles: data.rows, 
                                                    vehicles: result.rows, advertised: data3.rows, title : 'Express', user_name: name_of_user})
                                            } else {
                                                console.log('accepted bids data is undefined')
                                            }
                                        })
                                        
                                    } else {
                                        console.log('available advertisement data is undefined')
                                    }
                                })
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
    if(req.session.passport != undefined){
        req.session.passport.user.email = "";
        req.session.passport.user.password = "";
        req.session.passport.user.id = "";
        console.log(session);
    }
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
    console.log(origin, destination, driver_email, vehicle_num, date, time)
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

router.post('/driverHistory', function(req, res, next){
    res.redirect('../driverHistory');
})
router.post('/del_ad', function(req, res, next){
    var del_index = req.body.del_index;
    res.redirect('./');
})


module.exports = router;  