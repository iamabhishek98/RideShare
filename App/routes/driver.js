var express = require('express');
var router = express.Router();
const passport = require('passport');
const session = require('express-session');

/* GET login page. */
router.get('/', function(req, res, next) {
    console.log("driver dashboard");
    console.log(req.session.email);
    res.render('driver', { title: 'Express' });
});

module.exports = router;  