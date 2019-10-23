
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

const sql = {};
sql.query = {
    //registering
    email: 'select * from users where email = $1'
};

//Postgre SQL Connection
const{ Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// /*
// function getUserByEmail(email, callback){
//     pool.query(sql.query.email, [email], (err, data) =>{
//         if(err){
//             console.error("Cannot find user");
//             return callback(null);
//         }
        
//         if(data.rows.length == 0){
//             console.error("User does not exists?");
//             return callback(null)
//         } else if (data.rows.length == 1){
//             return callback(null, {
//                 email:data.rows[0].email,
//                 name: data.rows[0].name,
//                 hashedPassword: data.rows[0].password,
//                 credit_card_num: data.rows[0].credit_card_num
//             })
//         } else {
//             console.error("More than one user?");
//             return callback(null);
//         }
//     })    
// }

// function initialize(passport, getUserByEmail){
//     const authenticateUser = async (email, password, done) => {
//         const user = getUserByEmail(email, done);
//         if(user == null){
//             return done(null, false/*, {message: 'No user with that email'}*/)
//         }
//         //we have a user -> check if password matches
//         try{
//             if(await bcrypt.compare(password, user.password)){
//                 return done(null, user);
//             } else {
//                 return done(null, false, /*{message : 'Password incorrect'}*/);
//             }
//         } catch (e){
//             return done(e)
//         } 
//     }

//     passport.use(new LocalStrategy({usernameField: 'email'},
//     authenticateUser))
//     passport.serializeUser((user, done) => { })
//     passport.deserializeUser((id, done) => { })


// }

// module.exports = initialize
// */
//const LocalStrategy = passportLocal.Strategy;

// Telling passport to use a Local Strategy to login with a username/email and password
const initialze = passport.use(new LocalStrategy(
  // user will sign in using an email rather than a "username"
  {
    usernameField: 'email'
  },
  (async (email, password, done) => {
    console.log("hihihii");
    return done(null, { email, password });
  })
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = initialze;