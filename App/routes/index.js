var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.passport == undefined){
    res.render('index', { title: 'Express' });
  } else if(req.session.passport.user.id == "passenger"){
    res.redirect('passenger');
  } else if(req.session.passport.user.id == "driver"){
    res.redirect('driver');
  } else {
    res.render('index', { title: 'Express' });
  }


  
});

router.post('/bring_login', function(req, res, next){
  res.redirect('../../login');
})

module.exports = router;
