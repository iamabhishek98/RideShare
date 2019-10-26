var express = require('express');
var router = express.Router();

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

/**
 * Enter sql queries in here:
 */

const sql = {}
sql.query = {
    
}

/* GET signup page. */
router.get('/', function(req, res, next) {
  res.render('panalytics', { title: 'Express' });
});

// POST
router.post('/', function(req, res, next){
    
})

module.exports = router;
