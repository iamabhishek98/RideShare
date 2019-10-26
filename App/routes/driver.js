var express = require('express');
var router = express.Router();

/* GET login page. */
router.get('/', function(req, res, next) {
    console.log("driver dashboard");
    res.render('driver', { title: 'Express' });
});

module.exports = router;  