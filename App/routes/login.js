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
    email_query: 'select * from users where email = $1'
};

//Postgre SQL Connection
const{ Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

/* GET login page. */
router.get('/', function(req, res, next) {
  console.log("login request");
  res.render('login', { title: 'Express' });
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
          } else if(data.rows.length == 1){
            try{
              if (await bcrypt.compare(password, data.rows[0].password)){
                console.log("success");
                return done(null, {email, password, id: '221341242'});
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
  console.log(req.session)
    res.redirect('/passenger');
    // return res.json ({
    //     data: "hi"
    // })
})

module.exports = router;
