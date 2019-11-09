var express = require('express');
var router = express.Router();
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

const sql = {};
sql.query = {
    //registering
    email_query: 'select * from passenger where email = $1',
    check_driver: 'select * from driver where email = $1',
    get_user_name: 'select name from passenger where email = $1'
  };

//Postgre SQL Connection
const{ Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

/* GET login page. */
router.get('/', function(req, res, next) {
  console.log("login request");
  if(req.session.passport == undefined){
    res.render('login', {title: 'Express'});
  } else if (req.session.passport.user.id == "passenger"){
    res.redirect('passenger');
  } else if (req.session.passport.user.id == "driver"){
    res.redirect('driver');
  } else {
    res.render('login', {title: 'Express'});
  }
});

passport.use(new LocalStrategy(
    // user will sign in using an email rather than a "username"
    {
      usernameField: 'email',
    },
    (async (email, password, done) => {
        console.log(email, password)
        
        pool.query(sql.query.email_query, [email], async (err, data) => {
          if(err){
            console.log("Cannot find user");
            return done(null);
          }
          if(data.rows.length == 0){
            console.log("User does not exists?");
            return done(null);
          } else if(data.rows.length == 1) {
            try{
              if (await bcrypt.compare(password, data.rows[0].password)){
                console.log("success");
                return done(null, {email, password, id: '221341242', bid: "", start_trip_id: "", name: ""});
              } else {
                console.log("failure");
                return done(null, false, {email});  
              }
            } catch {
              console.log("failure in catch");
            }
          } else {
            console.error("More than one user?");
            return done(null);
          }
        });
    })
  ));
  passport.serializeUser((user, done) => {
      console.log(user)
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
      console.log(user)
    done(null, user);
  });

router.post('/', passport.authenticate('local', { failureRedirect: '/login' }), function(req, res, next){  
  console.log("this is the session---------:");
  var user_type = req.body.userType;
  if(user_type == "passenger"){
    req.session.passport.user.id = "passenger";
    console.log(req.session);
    res.redirect('/passenger');
  } else if(user_type == "driver"){
    //check if passenger has a driver account
    pool.query(sql.query.check_driver, [req.body.email], (err, data) => {
      if(data.rows.length == 0){
        //user does not have a driver account and hence, cannot log in as driver
        console.log("User not driver");
        req.session.passport.user.id = "passenger";
        res.redirect('/becomeDriver');
      } else {
        req.session.passport.user.id = "driver";
        console.log(req.session);
        res.redirect('/driver');
      }
    });
    console.log(req.session);
  }
   // res.redirect('/passenger');
    // return res.json ({
    //     data: "hi"
    // })
})


module.exports = router;
