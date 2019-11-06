var express = require('express');
var router = express.Router();

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const sql = []

sql.query = {

}

var passenger_email;
/* GET login page. */
router.get('/', function(req, res, next) {
    console.log("passenger dashboard");
    if(req.session.passport.user.email == undefined){
        console.log("user not logged in");
    } else if(req.session.passport.user.id == "passenger"
                || req.session.passport.user.id == "driver"){
            // @ABHI make sql query to retrieve all messages
            //then pass them through ejs into the render method below
        res.render('inbox');
    } else if(req.session.passport.user.id == "driver"){
        //no access
        res.redirect('./driver');
    } else {
        res.redirect('./login');
    }   
});

router.post("/logout", function(req, res, next){
    req.session.passport.user.email = "";
    req.session.passport.user.password = "";
    req.session.passport.user.id = "";
    res.redirect('../login');
  })
  
  router.post("/dashboard", function(req, res, next){
      console.log("I want to go back to dashboard----------");
      console.log("i am a:");
      console.log(req.session.passport.user);
    if(req.session.passport.user.id == "passenger"){
      res.redirect("../passenger");
    } else if (req.session.passport.user.id == "driver"){
      res.redirect("../driver");
    } else {
      console.log("What are you doing here?")
      res.redirect("../login");
    }
  })

router.post('/delete_msg', function(req, res, next){
    var to_delete = req.body.delete_id;
    //@Abhi, write ur SQL code to delete message here
    console.log(to_delete);
    res.redirect('./');
})

module.exports = router;