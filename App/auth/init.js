const sql = {};
sql.query = {
    //registering
    email: 'select * from users where email = $1'
};

const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const authMiddleware = require('./middleware');
const antiMiddleware = require('./antimiddle');

//Postgre SQL Connection
const{ Pool } = require('pg');
const pool = new Pool({
    // connectionString: process.env.DATABASE_URL,
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'password',
    port: 5432,
});

function findUser (email, callback) {
	pool.query(sql_query.query.email, [email], (err, data) => {
		if(err) {
			console.error("Cannot find user");
			return callback(null);
		}
		
		if(data.rows.length == 0) {
			console.error("User does not exists?");
			return callback(null)
		} else if(data.rows.length == 1) {
			return callback(null, {
				email               : data.rows[0].email,
				name                : data.rows[0].name,
				hashedPassword      : data.rows[0].password,
				credit_card_num     : data.rows[0].credit_card_num,
			});
		} else {
			console.error("More than one user?");
			return callback(null);
		}
	});
}

passport.serializeUser(function (user, cb) {
    cb(null, user.email);
  })
  
  passport.deserializeUser(function (email, cb) {
    findUser(email, cb);
  })
  
  function initPassport () {
    passport.use(new LocalStrategy(
      (email, password, done) => {
        findUser(email, (err, user) => {
          if (err) {
            return done(err);
          }
  
          // User not found
          if (!user) {
            console.error('User not found');
            return done(null, false);
          }
  
          // Always use hashed passwords and fixed time comparison
          bcrypt.compare(password, user.passwordHash, (err, isValid) => {
            if (err) {
              return done(err);
            }
            if (!isValid) {
              return done(null, false);
            }
            return done(null, user);
          })
        })
      }
    ));
  
    passport.authMiddleware = authMiddleware;
    passport.antiMiddleware = antiMiddleware;
    passport.findUser = findUser;
  }
  
  module.exports = initPassport;