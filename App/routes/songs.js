var express = require('express');
var router = express.Router();

const {Pool} = require('pg')
var driver_email;
const pool = new Pool({connectionString:process.env.DATABASE_URL})
const sql = {}
sql.query = {
    fav_songs: `select L.email, L.name, S.artist, S.duration
                from likes L, songs S
                where L.name = S.name
                and L.email = $1;`,
    insert_song : `INSERT INTO songs(name, duration, artist) VALUES($1, $2, $3);`,
    insert_song_likes : `INSERT INTO likes(email, name) VALUES($1, $2);`,
    insert_song_plays: "insert into plays(email, name) values($1, $2)",
    delete_likes : `DELETE FROM likes WHERE email = $1 and name = $2;`
    // not adding delete song coz other users might be liking the same song
}

var user_email;
router.get('/', async function(req, res, next){
    if(req.session == undefined){
        console.log("user not logged in");
        res.redirect("login");
    } else if (req.session.passport.user.id == "driver"
        || req.session.passport.user.id == "passenger"){
            user_email = req.session.passport.user.email;
            var fav_songs_data = await pool.query(sql.query.fav_songs, [user_email]);
            if (fav_songs_data != undefined) {
                console.log(fav_songs_data.rows)
                res.render('songs', {
                    songs: fav_songs_data.rows
                });
            } else {
                console.log('fav songs data is undefined')
            }
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
        console.log('insert song data success')
    } else {
        console.log('insert song data is undefined')
    }

    /**
     * Code that determines if user is driver or passenger
     * useful for u to note
     */
    if(req.session.passport.user.id == "driver"){
        //user is driver
        var insert_song_play = await pool.query(sql.query.insert_song_plays, [user_email, name]);
        if(insert_song != undefined){
            console.log(insert_song_play);
        } else {
            console.log("inserting into plays has failed");
        }
    } else if (req.session.passport.user.id == "passenger"){
        var insert_song_likes = await pool.query(sql.query.insert_song_likes, [user_email,name])
        if (insert_song_likes != undefined) {
            console.log(insert_song_likes)
        } else {
            console.log('insert likes song data is undefined')
        }
    } else {
        //gtfo of here
        res.redirect('login');
    }



    res.redirect('./');
})

router.post('/delete_song', async function(req, res, next){
    var delete_id = req.body.delete_id-1;
    var fav_songs_data = await pool.query(sql.query.fav_songs, [user_email]);
    if (fav_songs_data != undefined) {
        console.log(fav_songs_data.rows)
    } else {
        console.log('fav songs data is undefined')
    }
    var deleted_song = fav_songs_data.rows[delete_id]
    var name = deleted_song.name;
    var artist = deleted_song.artist;
    var duration = deleted_song.duration;
    var delete_song_likes = await pool.query(sql.query.delete_likes, [user_email, name]);
    if (delete_song_likes != undefined) {
        console.log(delete_song_likes)
    } else {
        console.log('delete song likes data is undefined')
    }
    // reason has been mentioned above
    /*var delete_song = await pool.query(sql.query.delete_song, [name, artist, duration])
    if (delete_song != undefined) {
        console.log(delete_song)
    } else {
        console.log('delete song data is undefined')
    }*/
    res.redirect("./");
})

module.exports = router;
