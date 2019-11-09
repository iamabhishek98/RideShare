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
        res.render('discounts');

    } else if (req.session.passport.user.id == "driver"){
        //access denied
        res.redirect('driver');
    } else {
        //gtfo
        res.redirect('login');
    }

    res.render('discount', { title: 'Express' });
});

router.post('/dashboard', function(req, res, next){
    res.redirect('../passenger');
})

module.exports = router;  