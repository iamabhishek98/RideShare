var express = require('express');
var router = express.Router();

const {Pool} = require('pg')
var driver_email;
const pool = new Pool({connectionString:process.env.DATABASE_URL})
const sql = {}
sql.query = {

}

var user_email;
router.get('/', function(req, res, next){
    if(req.session == undefined){
        console.log("user not logged in");
        res.redirect("login");
    } else if (req.session.passport.user.id == "driver"
        || req.session.passport.user.id == "passenger"){
            user_email = req.session.passport.user.email;
            res.render('songs');
    } else {
        //user not logged in
        res.redirect("login");
    }
})

router.post('/fav_song', function(req, res, next){
    var fav_song_name = req.body.fav_song;
    var fav_song_playtime = req.body.fav_song_playtime;
    var fav_song_artist = req.body.fav_song_artist;
    console.log(fav_song_name);
    console.log(fav_song_playtime);
    console.log(fav_song_artist);
    res.redirect('./');
})

router.post('/delete_song', function(req, res, next){
    var fav_song_id = req.body.delete_id;
    res.redirect("./");
})

module.exports = router;
