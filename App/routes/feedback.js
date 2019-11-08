var express = require('express');
var router = express.Router();
const passport = require('passport');
const session = require('express-session');

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

const sql = []

sql.query = {}

router.get('/', function(req, res, next){
    res.render('feedback');
})

module.exports = router;
