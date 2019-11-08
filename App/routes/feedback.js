var express = require('express');
var router = express.Router();
const passport = require('passport');
const session = require('express-session');

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const sql = []

sql.query = {}

router.get('/', function(req, res, next){
    if(req.session.passport == undefined){
        req.redirect('login');
    } else if(req.session.passport.user.id == "passenger"){
        res.render('feedback');
    } else if (req.session.passport.user.id == "driver"){
        res.redirect('driver');
    } else {
        res.redirect('login');
    }
    
})

router.post('/submit_review', function(req, res, next){
    var trip_id = req.body.trip_id;
    var review = req.body.review;
    var rating = req.body.rating;

    console.log(trip_id);
    console.log(review);
    console.log(rating);

    res.redirect('./');
})

module.exports = router;
