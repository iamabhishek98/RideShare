var express = require('express');
var router = express.Router();
const passport = require('passport');
const session = require('express-session');

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const sql = []
sql.query = {
    get_location_info: `select distinct f.loc_name, l.loc_add
                        from favouriteLocation f left join location l on l.loc_name = f.loc_name
                        where f.email_passenger = $1`,

    get_location: "select * from favouriteLocation where email_passenger = $1",
    add_fav_loc: "insert into favouriteLocation(email_passenger, loc_name) values($1, $2)",
    del_loc: "delete from favouriteLocation where email_passenger = $1 and loc_name = $2",
    add_general_loc: "insert into location(loc_name, loc_add) values($1, $2)"
}

var user_email;
router.get('/', function(req, res, next){
    if(req.session.passport == undefined){
        res.redirect('login');
    } else if(req.session.passport.user.id == "driver"
            || req.session.passport.user.id == "passenger"){
                user_email = req.session.passport.user.email;
                try{
                    pool.query(sql.query.get_location_info, [user_email], (err, data) => {
                        console.log(data.rows);
                        res.render('locations', {locations: data.rows,
                        user_name:req.session.passport.user.name,
                        user_type:req.session.passport.user.id});
                    });
                } catch{
                    console.log("some kind of error occurred");
                    res.redirect('passenger');
                }
    } else {
        //no access
        res.redirect('login');
    }
})

router.post('/add_fav', function(req, res, next){
    var loc_name = req.body.fav_location;
    //var data1 = await pool.query(sql.query.add_general_loc, [loc_name, "king kong avenue"]);
    var data2 = pool.query(sql.query.add_fav_loc, [user_email, loc_name]);
    res.redirect('./');
})

router.post('/del_fav', async function(req, res, next){
    var loc_name = req.body.del_location;
    var data1 = await pool.query(sql.query.del_loc, [user_email, loc_name]);
    res.redirect('./');
})

module.exports = router;