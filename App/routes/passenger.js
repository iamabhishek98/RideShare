var express = require('express');
var router = express.Router();

var passenger_email;
/* GET login page. */
router.get('/', function(req, res, next) {
    console.log("passenger dashboard");
    if(req.session.passport.user.email == undefined){
        console.log("user not logged in");
    } else {
        passenger_email = req.session.passport.user.email;
        console.log(passenger_email);
    }
    res.render('passenger', { title: 'Express' });
});

module.exports = router;  