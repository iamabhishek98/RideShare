var express = require('express');
var router = express.Router();

var passenger_email;
/* GET login page. */
router.get('/', function(req, res, next) {
    console.log("passenger discounts");
    if(req.session.passport == undefined){
        console.log("user not logged in");
        res.redirect('login');
    } else if(req.session.passport.user.id == "passenger"){
        //access granted
        res.render('discount',  { title: 'Express', user_name: req.session.passport.user.name });

    } else if (req.session.passport.user.id == "driver"){
        //access denied
        res.redirect('driver');
    } else {
        //gtfo
        res.redirect('login');
    }

    res.render('discount', { title: 'Express', user_name: req.session.passport.user.name });
});

router.post('/dashboard', function(req, res, next){
    res.redirect('../passenger');
})

module.exports = router;  