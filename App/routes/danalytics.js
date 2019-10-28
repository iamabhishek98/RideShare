var express = require('express');
var router = express.Router();

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

/**
 * Enter sql queries in here:
 */

const sql = {}
sql.query = {
    danalytics_basic: `select L.loc_name as location, T.total_bids, AB.average_bid
    from Location L, 
        (select distinct start_loc as location, avg(amount) as average_bid
        from bid
        group by location
        ) AB, 
        (select distinct start_loc as location, count(*) as total_bids
        from bid
        group by start_loc
        ) T
    where L.loc_name = AB.location and L.loc_name = T.location;
     
      `,
    
    danalytics_increasing: `select L.loc_name as location, T.total_bids, AB.average_bid
    from Location L, 
        (select distinct start_loc as location, avg(amount) as average_bid
        from bid
        group by location
        ) AB, 
        (select distinct start_loc as location, count(*) as total_bids
        from bid
        group by start_loc
        ) T
    where L.loc_name = AB.location and L.loc_name = T.location
    order by T.total_bids asc; 
    `,
    
    danalytics_decreasing: `select L.loc_name as location, T.total_bids, AB.average_bid
    from Location L, 
        (select distinct start_loc as location, avg(amount) as average_bid
        from bid
        group by location
        ) AB, 
        (select distinct start_loc as location, count(*) as total_bids
        from bid
        group by start_loc
        ) T
    where L.loc_name = AB.location and L.loc_name = T.location
    order by T.total_bids desc;
      `,
    
    danalytics_00:`select L.loc_name as location, T.total_bids, AB.average_bid
    from Location L, 
        (select distinct start_loc as location, avg(amount) as average_bid
        from bid
        where s_time between '00:00:00' and '02:00:00'
        group by location
        ) AB, 
        (select distinct start_loc as location, count(*) as total_bids
        from bid
        where s_time between '00:00:00' and '02:00:00'
        group by start_loc
        ) T
    where L.loc_name = AB.location and L.loc_name = T.location;
    `,

    danalytics_02:`select L.loc_name as location, T.total_bids, AB.average_bid
    from Location L, 
        (select distinct start_loc as location, avg(amount) as average_bid
        from bid
        where s_time between '02:00:00' and '04:00:00'
        group by location
        ) AB, 
        (select distinct start_loc as location, count(*) as total_bids
        from bid
        where s_time between '02:00:00' and '04:00:00'
        group by start_loc
        ) T
    where L.loc_name = AB.location and L.loc_name = T.location;
    `,

    danalytics_04:`select L.loc_name as location, T.total_bids, AB.average_bid
    from Location L, 
        (select distinct start_loc as location, avg(amount) as average_bid
        from bid
        where s_time between '04:00:00' and '06:00:00'
        group by location
        ) AB, 
        (select distinct start_loc as location, count(*) as total_bids
        from bid
        where s_time between '04:00:00' and '06:00:00'
        group by start_loc
        ) T
    where L.loc_name = AB.location and L.loc_name = T.location;
    `,

    danalytics_06:`select L.loc_name as location, T.total_bids, AB.average_bid
    from Location L, 
        (select distinct start_loc as location, avg(amount) as average_bid
        from bid
        where s_time between '06:00:00' and '08:00:00'
        group by location
        ) AB, 
        (select distinct start_loc as location, count(*) as total_bids
        from bid
        where s_time between '06:00:00' and '08:00:00'
        group by start_loc
        ) T
    where L.loc_name = AB.location and L.loc_name = T.location;
    `,

    danalytics_08:`select L.loc_name as location, T.total_bids, AB.average_bid
    from Location L, 
        (select distinct start_loc as location, avg(amount) as average_bid
        from bid
        where s_time between '08:00:00' and '10:00:00'
        group by location
        ) AB, 
        (select distinct start_loc as location, count(*) as total_bids
        from bid
        where s_time between '08:00:00' and '10:00:00'
        group by start_loc
        ) T
    where L.loc_name = AB.location and L.loc_name = T.location;
    `,

    danalytics_10:`select L.loc_name as location, T.total_bids, AB.average_bid
    from Location L, 
        (select distinct start_loc as location, avg(amount) as average_bid
        from bid
        where s_time between '10:00:00' and '12:00:00'
        group by location
        ) AB, 
        (select distinct start_loc as location, count(*) as total_bids
        from bid
        where s_time between '10:00:00' and '12:00:00'
        group by start_loc
        ) T
    where L.loc_name = AB.location and L.loc_name = T.location;
    `,

    danalytics_12:`select L.loc_name as location, T.total_bids, AB.average_bid
    from Location L, 
        (select distinct start_loc as location, avg(amount) as average_bid
        from bid
        where s_time between '12:00:00' and '14:00:00'
        group by location
        ) AB, 
        (select distinct start_loc as location, count(*) as total_bids
        from bid
        where s_time between '12:00:00' and '14:00:00'
        group by start_loc
        ) T
    where L.loc_name = AB.location and L.loc_name = T.location;
    `,

    danalytics_14:`select L.loc_name as location, T.total_bids, AB.average_bid
    from Location L, 
        (select distinct start_loc as location, avg(amount) as average_bid
        from bid
        where s_time between '14:00:00' and '16:00:00'
        group by location
        ) AB, 
        (select distinct start_loc as location, count(*) as total_bids
        from bid
        where s_time between '14:00:00' and '16:00:00'
        group by start_loc
        ) T
    where L.loc_name = AB.location and L.loc_name = T.location;
    `,

    danalytics_16:`select L.loc_name as location, T.total_bids, AB.average_bid
    from Location L, 
        (select distinct start_loc as location, avg(amount) as average_bid
        from bid
        where s_time between '16:00:00' and '18:00:00'
        group by location
        ) AB, 
        (select distinct start_loc as location, count(*) as total_bids
        from bid
        where s_time between '16:00:00' and '18:00:00'
        group by start_loc
        ) T
    where L.loc_name = AB.location and L.loc_name = T.location;
    `,

    danalytics_18:`select L.loc_name as location, T.total_bids, AB.average_bid
    from Location L, 
        (select distinct start_loc as location, avg(amount) as average_bid
        from bid
        where s_time between '18:00:00' and '20:00:00'
        group by location
        ) AB, 
        (select distinct start_loc as location, count(*) as total_bids
        from bid
        where s_time between '18:00:00' and '20:00:00'
        group by start_loc
        ) T
    where L.loc_name = AB.location and L.loc_name = T.location;
    `,

    danalytics_20:`select L.loc_name as location, T.total_bids, AB.average_bid
    from Location L, 
        (select distinct start_loc as location, avg(amount) as average_bid
        from bid
        where s_time between '20:00:00' and '22:00:00'
        group by location
        ) AB, 
        (select distinct start_loc as location, count(*) as total_bids
        from bid
        where s_time between '20:00:00' and '22:00:00'
        group by start_loc
        ) T
    where L.loc_name = AB.location and L.loc_name = T.location;
    `,

    danalytics_22:`select L.loc_name as location, T.total_bids, AB.average_bid
    from Location L, 
        (select distinct start_loc as location, avg(amount) as average_bid
        from bid
        where s_time between '22:00:00' and '00:00:00'
        group by location
        ) AB, 
        (select distinct start_loc as location, count(*) as total_bids
        from bid
        where s_time between '22:00:00' and '00:00:00'
        group by start_loc
        ) T
    where L.loc_name = AB.location and L.loc_name = T.location;
    `,

    
}

/* GET signup page. */
router.get('/', function(req, res, next) {
  res.render('danalytics', { result: [], title: 'Express' });
});

// POST
router.post('/basic', function(req, res, next){
  try{
    // Construct Specific SQL Query
	  pool.query(sql.query.danalytics_basic,(err, data) => {
      console.log(data.rows)
      res.render('danalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('danalytics basic error');
  }
})

router.post('/increasing', function(req, res, next){
  try{
    // Construct Specific SQL Query
	  pool.query(sql.query.danalytics_increasing,(err, data) => {
      console.log(data.rows)
      res.render('danalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('danalytics increasing error');
  }
})

router.post('/decreasing', function(req, res, next){
  try{
    // Construct Specific SQL Query
	  pool.query(sql.query.danalytics_decreasing,(err, data) => {
      console.log(data.rows)
      res.render('danalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('danalytics decreasing error');
  }
})

router.post('/00', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.danalytics_00,(err, data) => {
      console.log(data.rows)
      res.render('danalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('danalytics decreasing error');
  }
})

router.post('/02', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.danalytics_02,(err, data) => {
      console.log(data.rows)
      res.render('danalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('danalytics decreasing error');
  }
})

router.post('/04', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.danalytics_04,(err, data) => {
      console.log(data.rows)
      res.render('danalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('danalytics decreasing error');
  }
})

router.post('/06', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.danalytics_06,(err, data) => {
      console.log(data.rows)
      res.render('danalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('danalytics decreasing error');
  }
})

router.post('/08', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.danalytics_08,(err, data) => {
      console.log(data.rows)
      res.render('danalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('danalytics decreasing error');
  }
})

router.post('/10', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.danalytics_10,(err, data) => {
      console.log(data.rows)
      res.render('danalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('danalytics decreasing error');
  }
})

router.post('/12', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.danalytics_12,(err, data) => {
      console.log(data.rows)
      res.render('danalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('danalytics decreasing error');
  }
})

router.post('/14', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.danalytics_14,(err, data) => {
      console.log(data.rows)
      res.render('danalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('danalytics decreasing error');
  }
})

router.post('/16', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.danalytics_16,(err, data) => {
      console.log(data.rows)
      res.render('danalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('danalytics decreasing error');
  }
})

router.post('/18', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.danalytics_18,(err, data) => {
      console.log(data.rows)
      res.render('danalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('danalytics decreasing error');
  }
})

router.post('/20', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.danalytics_20,(err, data) => {
      console.log(data.rows)
      res.render('danalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('danalytics decreasing error');
  }
})

router.post('/22', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.danalytics_22,(err, data) => {
      console.log(data.rows)
      res.render('danalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('danalytics decreasing error');
  }
})

module.exports = router;
