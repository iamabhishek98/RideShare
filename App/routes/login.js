var express = require('express');
var router = express.Router();
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy


const sql = {};
sql.query = {
    //registering
    email: 'select * from users where email = $1'
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
      usernameField: 'email'
      
    },
    (async (email, password, done) => {
        console.log(email, password)
        if (password === 'password') {
            console.log("success")
            return done(null, { email, password, id: '12r2f3g45' });
        }
        console.log("failure")
        return done(null, false, { email })
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
    return res.json ({
        data: "hi"
    })
})

module.exports = router;
