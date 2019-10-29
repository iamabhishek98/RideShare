var express = require('express');
var router = express.Router();
const passport = require('passport');
const session = require('express-session');

var driver_email;
/* GET login page. */
router.get('/', function(req, res, next) {
    console.log("driver dashboard");
    if(req.session.passport.user.email==undefined){
        console.log("driver not logged in");
    } else {
        driver_email = req.session.passport.user.email;
        console.log(driver_email);
    }
    res.render('driver', { title: 'Express' });
});

module.exports = router;  