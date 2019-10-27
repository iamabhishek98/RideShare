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
  res.render('danalytics', { result: [], title: 'Express' });
});

// POST
router.post('/basic', function(req, res, next){
  try{
    // Construct Specific SQL Query
	  pool.query(sql.query.panalytics_basic,(err, data) => {
      console.log(data.rows)
      res.render('panalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('panalytics basic error');
  }
})

module.exports = router;
