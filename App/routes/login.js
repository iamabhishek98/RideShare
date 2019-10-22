var express = require('express');
var router = express.Router();

/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Express' });
});

var email;
var password;

router.post('/', function(req, res, next){
  email = req.body.email;
  password = req.body.password;

  
/* SQL Query */
var sql_query = ''
});



// select 1
// from users
// where 
module.exports = router;
