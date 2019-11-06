var express = require('express');
var router = express.Router();

const {Pool} = require('pg')
var driver_email;
const pool = new Pool({connectionString:process.env.DATABASE_URL})
const sql = {}
sql.query = {
    insert_song : 'INSERT INTO songs(name, duration, artist) VALUES($1, $2, $3);'
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

router.post('/fav_song', async function(req, res, next){
    var name = req.body.fav_song;
    var duration = req.body.fav_song_duration;
    var artist = req.body.fav_song_artist;
    console.log(name);
    console.log(duration);
    console.log(artist);
    var insert_song = await pool.query(sql.query.insert_song, [name, duration, artist])
    if (insert_song != undefined) {
        console.log(insert_song)
    } else {
        console.log('insert song data is undefined')
    }
    res.redirect('./');
})

router.post('/delete_song', function(req, res, next){
    var fav_song_id = req.body.delete_id;
    res.redirect("./");
})

module.exports = router;
