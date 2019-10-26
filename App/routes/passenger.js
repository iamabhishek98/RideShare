var express = require('express');
var router = express.Router();

/* GET login page. */
router.get('/', function(req, res, next) {
    console.log("passenger dashboard");
    res.render('passenger', { title: 'Express' });
});

module.exports = router;  