var express = require('express');
var router = express.Router();

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})


/**
 * Enter sql queries in here:
 */

const sql = {}
sql.query = {
  panalytics_basic: `with AVG_BID as (select distinct start_loc as location, avg(amount) as average_bid
  from bid
  group by location),
  
  WIN_BIDS as (select distinct TOTAL.start_loc as location, count(W.start_loc) as successful_bids
  from 
      (select distinct start_loc, count(*) as frequency
      from bid
      group by start_loc) as TOTAL
  left join 
      (select distinct start_loc, count(*) as frequency
      from bid 
      where is_win is true
      group by start_loc) as W
  on TOTAL.start_loc = W.start_loc
  group by location), 
  
  WIN_PERCENT as (select distinct TOTAL.start_loc as location, (((WIN.frequency)*100)/(TOTAL.frequency)) as percent
  from (
      select distinct TOTAL.start_loc, count(W.start_loc) as frequency
      from 
          (select distinct start_loc, count(*) as frequency
          from bid
          group by start_loc) as TOTAL
      left join 
          (select distinct start_loc, count(*) as frequency
           from bid 
           where is_win is true
           group by start_loc) as W
           on TOTAL.start_loc = W.start_loc
           group by TOTAL.start_loc) 
      as WIN, (select distinct start_loc, count(*) as frequency
          from bid
          group by start_loc) as TOTAL
  where WIN.start_loc = TOTAL.start_loc)
  
  select L.loc_name as location, WB.successful_bids, WP.percent, AB.average_bid
  from Location L, AVG_BID AB, WIN_BIDS WB, WIN_PERCENT WP
  where L.loc_name = AB.location and L.loc_name = WB.location and L.loc_name = WP.location;`,

  panalytics_increasing: `with AVG_BID as (select distinct start_loc as location, avg(amount) as average_bid
  from bid
  group by location),
  
  WIN_BIDS as (select distinct TOTAL.start_loc as location, count(W.start_loc) as successful_bids
  from 
      (select distinct start_loc, count(*) as frequency
      from bid
      group by start_loc) as TOTAL
  left join 
      (select distinct start_loc, count(*) as frequency
      from bid 
      where is_win is true
      group by start_loc) as W
  on TOTAL.start_loc = W.start_loc
  group by location), 
  
  WIN_PERCENT as (select distinct TOTAL.start_loc as location, (((WIN.frequency)*100)/(TOTAL.frequency)) as percent
  from (
      select distinct TOTAL.start_loc, count(W.start_loc) as frequency
      from 
          (select distinct start_loc, count(*) as frequency
          from bid
          group by start_loc) as TOTAL
      left join 
          (select distinct start_loc, count(*) as frequency
          from bid 
          where is_win is true
          group by start_loc) as W
          on TOTAL.start_loc = W.start_loc
          group by TOTAL.start_loc) 
      as WIN, (select distinct start_loc, count(*) as frequency
          from bid
          group by start_loc) as TOTAL
  where WIN.start_loc = TOTAL.start_loc)
  
  select L.loc_name as location, WB.successful_bids, WP.percent, AB.average_bid
  from Location L, AVG_BID AB, WIN_BIDS WB, WIN_PERCENT WP
  where L.loc_name = AB.location and L.loc_name = WB.location and L.loc_name = WP.location
  order by AB.average_bid asc;`,
  
  panalytics_decreasing: `with AVG_BID as (select distinct start_loc as location, avg(amount) as average_bid
  from bid
  group by location),
  
  WIN_BIDS as (select distinct TOTAL.start_loc as location, count(W.start_loc) as successful_bids
  from 
      (select distinct start_loc, count(*) as frequency
      from bid
      group by start_loc) as TOTAL
  left join 
      (select distinct start_loc, count(*) as frequency
      from bid 
      where is_win is true
      group by start_loc) as W
  on TOTAL.start_loc = W.start_loc
  group by location), 
  
  WIN_PERCENT as (select distinct TOTAL.start_loc as location, (((WIN.frequency)*100)/(TOTAL.frequency)) as percent
  from (
      select distinct TOTAL.start_loc, count(W.start_loc) as frequency
      from 
          (select distinct start_loc, count(*) as frequency
          from bid
          group by start_loc) as TOTAL
      left join 
          (select distinct start_loc, count(*) as frequency
          from bid 
          where is_win is true
          group by start_loc) as W
          on TOTAL.start_loc = W.start_loc
          group by TOTAL.start_loc) 
      as WIN, (select distinct start_loc, count(*) as frequency
          from bid
          group by start_loc) as TOTAL
  where WIN.start_loc = TOTAL.start_loc)
  
  select L.loc_name as location, WB.successful_bids, WP.percent, AB.average_bid
  from Location L, AVG_BID AB, WIN_BIDS WB, WIN_PERCENT WP
  where L.loc_name = AB.location and L.loc_name = WB.location and L.loc_name = WP.location
  order by AB.average_bid desc`, 
  
  panalytics_00: `with AVG_BID as (select distinct start_loc as location, avg(amount) as average_bid
  from bid
  where s_time between '00:00:00' and '02:00:00'
  group by location),
  
  WIN_BIDS as (select distinct TOTAL.start_loc as location, count(W.start_loc) as successful_bids
  from 
      (select distinct start_loc, count(*) as frequency
      from bid
      where s_time between '00:00:00' and '02:00:00'
      group by start_loc) as TOTAL
  left join 
      (select distinct start_loc, count(*) as frequency
      from bid 
      where is_win is true
      and s_time between '00:00:00' and '02:00:00'
      group by start_loc) as W
  on TOTAL.start_loc = W.start_loc
  group by location), 
  
  WIN_PERCENT as (select distinct TOTAL.start_loc as location, (((WIN.frequency)*100)/(TOTAL.frequency)) as percent
  from (
      select distinct TOTAL.start_loc, count(W.start_loc) as frequency
      from 
          (select distinct start_loc, count(*) as frequency
          from bid
          where s_time between '00:00:00' and '02:00:00'
          group by start_loc) as TOTAL
      left join 
          (select distinct start_loc, count(*) as frequency
          from bid 
          where is_win is true
          and s_time between '00:00:00' and '02:00:00'
          group by start_loc) as W
          on TOTAL.start_loc = W.start_loc
          group by TOTAL.start_loc) 
      as WIN, (select distinct start_loc, count(*) as frequency
          from bid
          group by start_loc) as TOTAL
  where WIN.start_loc = TOTAL.start_loc)
  
  select L.loc_name as location, WB.successful_bids, WP.percent, AB.average_bid
  from Location L, AVG_BID AB, WIN_BIDS WB, WIN_PERCENT WP
  where L.loc_name = AB.location and L.loc_name = WB.location and L.loc_name = WP.location;
    `,
  
  panalytics_02: `with AVG_BID as (select distinct start_loc as location, avg(amount) as average_bid
  from bid
  where s_time between '02:00:00' and '04:00:00'
  group by location),
  
  WIN_BIDS as (select distinct TOTAL.start_loc as location, count(W.start_loc) as successful_bids
  from 
      (select distinct start_loc, count(*) as frequency
      from bid
      where s_time between '02:00:00' and '04:00:00'
      group by start_loc) as TOTAL
  left join 
      (select distinct start_loc, count(*) as frequency
      from bid 
      where is_win is true
      and s_time between '02:00:00' and '04:00:00'
      group by start_loc) as W
  on TOTAL.start_loc = W.start_loc
  group by location), 
  
  WIN_PERCENT as (select distinct TOTAL.start_loc as location, (((WIN.frequency)*100)/(TOTAL.frequency)) as percent
  from (
      select distinct TOTAL.start_loc, count(W.start_loc) as frequency
      from 
          (select distinct start_loc, count(*) as frequency
          from bid
          where s_time between '02:00:00' and '04:00:00'
          group by start_loc) as TOTAL
      left join 
          (select distinct start_loc, count(*) as frequency
          from bid 
          where is_win is true
          and s_time between '02:00:00' and '04:00:00'
          group by start_loc) as W
          on TOTAL.start_loc = W.start_loc
          group by TOTAL.start_loc) 
      as WIN, (select distinct start_loc, count(*) as frequency
          from bid
          group by start_loc) as TOTAL
  where WIN.start_loc = TOTAL.start_loc)
  
  select L.loc_name as location, WB.successful_bids, WP.percent, AB.average_bid
  from Location L, AVG_BID AB, WIN_BIDS WB, WIN_PERCENT WP
  where L.loc_name = AB.location and L.loc_name = WB.location and L.loc_name = WP.location;
    `,

  panalytics_04: `with AVG_BID as (select distinct start_loc as location, avg(amount) as average_bid
  from bid
  where s_time between '04:00:00' and '06:00:00'
  group by location),
  
  WIN_BIDS as (select distinct TOTAL.start_loc as location, count(W.start_loc) as successful_bids
  from 
      (select distinct start_loc, count(*) as frequency
      from bid
      where s_time between '04:00:00' and '06:00:00'
      group by start_loc) as TOTAL
  left join 
      (select distinct start_loc, count(*) as frequency
      from bid 
      where is_win is true
      and s_time between '04:00:00' and '06:00:00'
      group by start_loc) as W
  on TOTAL.start_loc = W.start_loc
  group by location), 
  
  WIN_PERCENT as (select distinct TOTAL.start_loc as location, (((WIN.frequency)*100)/(TOTAL.frequency)) as percent
  from (
      select distinct TOTAL.start_loc, count(W.start_loc) as frequency
      from 
          (select distinct start_loc, count(*) as frequency
          from bid
          where s_time between '04:00:00' and '06:00:00'
          group by start_loc) as TOTAL
      left join 
          (select distinct start_loc, count(*) as frequency
          from bid 
          where is_win is true
          and s_time between '04:00:00' and '06:00:00'
          group by start_loc) as W
          on TOTAL.start_loc = W.start_loc
          group by TOTAL.start_loc) 
      as WIN, (select distinct start_loc, count(*) as frequency
          from bid
          group by start_loc) as TOTAL
  where WIN.start_loc = TOTAL.start_loc)
  
  select L.loc_name as location, WB.successful_bids, WP.percent, AB.average_bid
  from Location L, AVG_BID AB, WIN_BIDS WB, WIN_PERCENT WP
  where L.loc_name = AB.location and L.loc_name = WB.location and L.loc_name = WP.location;
    `,
  
  panalytics_06: `with AVG_BID as (select distinct start_loc as location, avg(amount) as average_bid
  from bid
  where s_time between '06:00:00' and '08:00:00'
  group by location),
  
  WIN_BIDS as (select distinct TOTAL.start_loc as location, count(W.start_loc) as successful_bids
  from 
      (select distinct start_loc, count(*) as frequency
      from bid
      where s_time between '06:00:00' and '08:00:00'
      group by start_loc) as TOTAL
  left join 
      (select distinct start_loc, count(*) as frequency
      from bid 
      where is_win is true
      and s_time between '06:00:00' and '08:00:00'
      group by start_loc) as W
  on TOTAL.start_loc = W.start_loc
  group by location), 
  
  WIN_PERCENT as (select distinct TOTAL.start_loc as location, (((WIN.frequency)*100)/(TOTAL.frequency)) as percent
  from (
      select distinct TOTAL.start_loc, count(W.start_loc) as frequency
      from 
          (select distinct start_loc, count(*) as frequency
          from bid
          where s_time between '06:00:00' and '08:00:00'
          group by start_loc) as TOTAL
      left join 
          (select distinct start_loc, count(*) as frequency
          from bid 
          where is_win is true
          and s_time between '06:00:00' and '08:00:00'
          group by start_loc) as W
          on TOTAL.start_loc = W.start_loc
          group by TOTAL.start_loc) 
      as WIN, (select distinct start_loc, count(*) as frequency
          from bid
          group by start_loc) as TOTAL
  where WIN.start_loc = TOTAL.start_loc)
  
  select L.loc_name as location, WB.successful_bids, WP.percent, AB.average_bid
  from Location L, AVG_BID AB, WIN_BIDS WB, WIN_PERCENT WP
  where L.loc_name = AB.location and L.loc_name = WB.location and L.loc_name = WP.location;
    `,
  
  panalytics_08: `with AVG_BID as (select distinct start_loc as location, avg(amount) as average_bid
  from bid
  where s_time between '08:00:00' and '10:00:00'
  group by location),
  
  WIN_BIDS as (select distinct TOTAL.start_loc as location, count(W.start_loc) as successful_bids
  from 
      (select distinct start_loc, count(*) as frequency
      from bid
      where s_time between '08:00:00' and '10:00:00'
      group by start_loc) as TOTAL
  left join 
      (select distinct start_loc, count(*) as frequency
      from bid 
      where is_win is true
      and s_time between '08:00:00' and '10:00:00'
      group by start_loc) as W
  on TOTAL.start_loc = W.start_loc
  group by location), 
  
  WIN_PERCENT as (select distinct TOTAL.start_loc as location, (((WIN.frequency)*100)/(TOTAL.frequency)) as percent
  from (
      select distinct TOTAL.start_loc, count(W.start_loc) as frequency
      from 
          (select distinct start_loc, count(*) as frequency
          from bid
          where s_time between '08:00:00' and '10:00:00'
          group by start_loc) as TOTAL
      left join 
          (select distinct start_loc, count(*) as frequency
          from bid 
          where is_win is true
          and s_time between '08:00:00' and '10:00:00'
          group by start_loc) as W
          on TOTAL.start_loc = W.start_loc
          group by TOTAL.start_loc) 
      as WIN, (select distinct start_loc, count(*) as frequency
          from bid
          group by start_loc) as TOTAL
  where WIN.start_loc = TOTAL.start_loc)
  
  select L.loc_name as location, WB.successful_bids, WP.percent, AB.average_bid
  from Location L, AVG_BID AB, WIN_BIDS WB, WIN_PERCENT WP
  where L.loc_name = AB.location and L.loc_name = WB.location and L.loc_name = WP.location;
    `,
  
  panalytics_10: `with AVG_BID as (select distinct start_loc as location, avg(amount) as average_bid
  from bid
  where s_time between '10:00:00' and '12:00:00'
  group by location),
  
  WIN_BIDS as (select distinct TOTAL.start_loc as location, count(W.start_loc) as successful_bids
  from 
      (select distinct start_loc, count(*) as frequency
      from bid
      where s_time between '10:00:00' and '12:00:00'
      group by start_loc) as TOTAL
  left join 
      (select distinct start_loc, count(*) as frequency
      from bid 
      where is_win is true
      and s_time between '10:00:00' and '12:00:00'
      group by start_loc) as W
  on TOTAL.start_loc = W.start_loc
  group by location), 
  
  WIN_PERCENT as (select distinct TOTAL.start_loc as location, (((WIN.frequency)*100)/(TOTAL.frequency)) as percent
  from (
      select distinct TOTAL.start_loc, count(W.start_loc) as frequency
      from 
          (select distinct start_loc, count(*) as frequency
          from bid
          where s_time between '10:00:00' and '12:00:00'
          group by start_loc) as TOTAL
      left join 
          (select distinct start_loc, count(*) as frequency
          from bid 
          where is_win is true
          and s_time between '10:00:00' and '12:00:00'
          group by start_loc) as W
          on TOTAL.start_loc = W.start_loc
          group by TOTAL.start_loc) 
      as WIN, (select distinct start_loc, count(*) as frequency
          from bid
          group by start_loc) as TOTAL
  where WIN.start_loc = TOTAL.start_loc)
  
  select L.loc_name as location, WB.successful_bids, WP.percent, AB.average_bid
  from Location L, AVG_BID AB, WIN_BIDS WB, WIN_PERCENT WP
  where L.loc_name = AB.location and L.loc_name = WB.location and L.loc_name = WP.location;
    `,
  
  panalytics_12: `with AVG_BID as (select distinct start_loc as location, avg(amount) as average_bid
  from bid
  where s_time between '12:00:00' and '14:00:00'
  group by location),
  
  WIN_BIDS as (select distinct TOTAL.start_loc as location, count(W.start_loc) as successful_bids
  from 
      (select distinct start_loc, count(*) as frequency
      from bid
      where s_time between '12:00:00' and '14:00:00'
      group by start_loc) as TOTAL
  left join 
      (select distinct start_loc, count(*) as frequency
      from bid 
      where is_win is true
      and s_time between '12:00:00' and '14:00:00'
      group by start_loc) as W
  on TOTAL.start_loc = W.start_loc
  group by location), 
  
  WIN_PERCENT as (select distinct TOTAL.start_loc as location, (((WIN.frequency)*100)/(TOTAL.frequency)) as percent
  from (
      select distinct TOTAL.start_loc, count(W.start_loc) as frequency
      from 
          (select distinct start_loc, count(*) as frequency
          from bid
          where s_time between '12:00:00' and '14:00:00'
          group by start_loc) as TOTAL
      left join 
          (select distinct start_loc, count(*) as frequency
          from bid 
          where is_win is true
          and s_time between '12:00:00' and '14:00:00'
          group by start_loc) as W
          on TOTAL.start_loc = W.start_loc
          group by TOTAL.start_loc) 
      as WIN, (select distinct start_loc, count(*) as frequency
          from bid
          group by start_loc) as TOTAL
  where WIN.start_loc = TOTAL.start_loc)
  
  select L.loc_name as location, WB.successful_bids, WP.percent, AB.average_bid
  from Location L, AVG_BID AB, WIN_BIDS WB, WIN_PERCENT WP
  where L.loc_name = AB.location and L.loc_name = WB.location and L.loc_name = WP.location;
    `,
  
  panalytics_14: `with AVG_BID as (select distinct start_loc as location, avg(amount) as average_bid
  from bid
  where s_time between '14:00:00' and '16:00:00'
  group by location),
  
  WIN_BIDS as (select distinct TOTAL.start_loc as location, count(W.start_loc) as successful_bids
  from 
      (select distinct start_loc, count(*) as frequency
      from bid
      where s_time between '14:00:00' and '16:00:00'
      group by start_loc) as TOTAL
  left join 
      (select distinct start_loc, count(*) as frequency
      from bid 
      where is_win is true
      and s_time between '14:00:00' and '16:00:00'
      group by start_loc) as W
  on TOTAL.start_loc = W.start_loc
  group by location), 
  
  WIN_PERCENT as (select distinct TOTAL.start_loc as location, (((WIN.frequency)*100)/(TOTAL.frequency)) as percent
  from (
      select distinct TOTAL.start_loc, count(W.start_loc) as frequency
      from 
          (select distinct start_loc, count(*) as frequency
          from bid
          where s_time between '14:00:00' and '16:00:00'
          group by start_loc) as TOTAL
      left join 
          (select distinct start_loc, count(*) as frequency
          from bid 
          where is_win is true
          and s_time between '14:00:00' and '16:00:00'
          group by start_loc) as W
          on TOTAL.start_loc = W.start_loc
          group by TOTAL.start_loc) 
      as WIN, (select distinct start_loc, count(*) as frequency
          from bid
          group by start_loc) as TOTAL
  where WIN.start_loc = TOTAL.start_loc)
  
  select L.loc_name as location, WB.successful_bids, WP.percent, AB.average_bid
  from Location L, AVG_BID AB, WIN_BIDS WB, WIN_PERCENT WP
  where L.loc_name = AB.location and L.loc_name = WB.location and L.loc_name = WP.location;
    `,
  
  panalytics_16: `with AVG_BID as (select distinct start_loc as location, avg(amount) as average_bid
  from bid
  where s_time between '16:00:00' and '18:00:00'
  group by location),
  
  WIN_BIDS as (select distinct TOTAL.start_loc as location, count(W.start_loc) as successful_bids
  from 
      (select distinct start_loc, count(*) as frequency
      from bid
      where s_time between '16:00:00' and '18:00:00'
      group by start_loc) as TOTAL
  left join 
      (select distinct start_loc, count(*) as frequency
      from bid 
      where is_win is true
      and s_time between '16:00:00' and '18:00:00'
      group by start_loc) as W
  on TOTAL.start_loc = W.start_loc
  group by location), 
  
  WIN_PERCENT as (select distinct TOTAL.start_loc as location, (((WIN.frequency)*100)/(TOTAL.frequency)) as percent
  from (
      select distinct TOTAL.start_loc, count(W.start_loc) as frequency
      from 
          (select distinct start_loc, count(*) as frequency
          from bid
          where s_time between '16:00:00' and '18:00:00'
          group by start_loc) as TOTAL
      left join 
          (select distinct start_loc, count(*) as frequency
          from bid 
          where is_win is true
          and s_time between '16:00:00' and '18:00:00'
          group by start_loc) as W
          on TOTAL.start_loc = W.start_loc
          group by TOTAL.start_loc) 
      as WIN, (select distinct start_loc, count(*) as frequency
          from bid
          group by start_loc) as TOTAL
  where WIN.start_loc = TOTAL.start_loc)
  
  select L.loc_name as location, WB.successful_bids, WP.percent, AB.average_bid
  from Location L, AVG_BID AB, WIN_BIDS WB, WIN_PERCENT WP
  where L.loc_name = AB.location and L.loc_name = WB.location and L.loc_name = WP.location;
    `,
  
  panalytics_18: `with AVG_BID as (select distinct start_loc as location, avg(amount) as average_bid
  from bid
  where s_time between '18:00:00' and '20:00:00'
  group by location),
  
  WIN_BIDS as (select distinct TOTAL.start_loc as location, count(W.start_loc) as successful_bids
  from 
      (select distinct start_loc, count(*) as frequency
      from bid
      where s_time between '18:00:00' and '20:00:00'
      group by start_loc) as TOTAL
  left join 
      (select distinct start_loc, count(*) as frequency
      from bid 
      where is_win is true
      and s_time between '18:00:00' and '20:00:00'
      group by start_loc) as W
  on TOTAL.start_loc = W.start_loc
  group by location), 
  
  WIN_PERCENT as (select distinct TOTAL.start_loc as location, (((WIN.frequency)*100)/(TOTAL.frequency)) as percent
  from (
      select distinct TOTAL.start_loc, count(W.start_loc) as frequency
      from 
          (select distinct start_loc, count(*) as frequency
          from bid
          where s_time between '18:00:00' and '20:00:00'
          group by start_loc) as TOTAL
      left join 
          (select distinct start_loc, count(*) as frequency
          from bid 
          where is_win is true
          and s_time between '18:00:00' and '20:00:00'
          group by start_loc) as W
          on TOTAL.start_loc = W.start_loc
          group by TOTAL.start_loc) 
      as WIN, (select distinct start_loc, count(*) as frequency
          from bid
          group by start_loc) as TOTAL
  where WIN.start_loc = TOTAL.start_loc)
  
  select L.loc_name as location, WB.successful_bids, WP.percent, AB.average_bid
  from Location L, AVG_BID AB, WIN_BIDS WB, WIN_PERCENT WP
  where L.loc_name = AB.location and L.loc_name = WB.location and L.loc_name = WP.location;
    `,
  
  panalytics_20: `with AVG_BID as (select distinct start_loc as location, avg(amount) as average_bid
  from bid
  where s_time between '20:00:00' and '22:00:00'
  group by location),
  
  WIN_BIDS as (select distinct TOTAL.start_loc as location, count(W.start_loc) as successful_bids
  from 
      (select distinct start_loc, count(*) as frequency
      from bid
      where s_time between '20:00:00' and '22:00:00'
      group by start_loc) as TOTAL
  left join 
      (select distinct start_loc, count(*) as frequency
      from bid 
      where is_win is true
      and s_time between '20:00:00' and '22:00:00'
      group by start_loc) as W
  on TOTAL.start_loc = W.start_loc
  group by location), 
  
  WIN_PERCENT as (select distinct TOTAL.start_loc as location, (((WIN.frequency)*100)/(TOTAL.frequency)) as percent
  from (
      select distinct TOTAL.start_loc, count(W.start_loc) as frequency
      from 
          (select distinct start_loc, count(*) as frequency
          from bid
          where s_time between '20:00:00' and '22:00:00'
          group by start_loc) as TOTAL
      left join 
          (select distinct start_loc, count(*) as frequency
          from bid 
          where is_win is true
          and s_time between '20:00:00' and '22:00:00'
          group by start_loc) as W
          on TOTAL.start_loc = W.start_loc
          group by TOTAL.start_loc) 
      as WIN, (select distinct start_loc, count(*) as frequency
          from bid
          group by start_loc) as TOTAL
  where WIN.start_loc = TOTAL.start_loc)
  
  select L.loc_name as location, WB.successful_bids, WP.percent, AB.average_bid
  from Location L, AVG_BID AB, WIN_BIDS WB, WIN_PERCENT WP
  where L.loc_name = AB.location and L.loc_name = WB.location and L.loc_name = WP.location;
    `,
  
  panalytics_22: `with AVG_BID as (select distinct start_loc as location, avg(amount) as average_bid
  from bid
  where s_time between '22:00:00' and '00:00:00'
  group by location),
  
  WIN_BIDS as (select distinct TOTAL.start_loc as location, count(W.start_loc) as successful_bids
  from 
      (select distinct start_loc, count(*) as frequency
      from bid
      where s_time between '22:00:00' and '00:00:00'
      group by start_loc) as TOTAL
  left join 
      (select distinct start_loc, count(*) as frequency
      from bid 
      where is_win is true
      and s_time between '22:00:00' and '00:00:00'
      group by start_loc) as W
  on TOTAL.start_loc = W.start_loc
  group by location), 
  
  WIN_PERCENT as (select distinct TOTAL.start_loc as location, (((WIN.frequency)*100)/(TOTAL.frequency)) as percent
  from (
      select distinct TOTAL.start_loc, count(W.start_loc) as frequency
      from 
          (select distinct start_loc, count(*) as frequency
          from bid
          where s_time between '22:00:00' and '00:00:00'
          group by start_loc) as TOTAL
      left join 
          (select distinct start_loc, count(*) as frequency
          from bid 
          where is_win is true
          and s_time between '22:00:00' and '00:00:00'
          group by start_loc) as W
          on TOTAL.start_loc = W.start_loc
          group by TOTAL.start_loc) 
      as WIN, (select distinct start_loc, count(*) as frequency
          from bid
          group by start_loc) as TOTAL
  where WIN.start_loc = TOTAL.start_loc)
  
  select L.loc_name as location, WB.successful_bids, WP.percent, AB.average_bid
  from Location L, AVG_BID AB, WIN_BIDS WB, WIN_PERCENT WP
  where L.loc_name = AB.location and L.loc_name = WB.location and L.loc_name = WP.location;
    `


}

/* GET signup page. */
router.get('/', function(req, res, next) {
  res.render('panalytics', { result: [], title: 'Express' });
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

router.post('/increasing', function(req, res, next){
  try{
    // Construct Specific SQL Query
	  pool.query(sql.query.panalytics_increasing,(err, data) => {
      console.log(data.rows)
      res.render('panalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('panalytics increasing error');
  }
})

router.post('/decreasing', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_decreasing,(err, data) => {
      console.log(data.rows)
      res.render('panalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('panalytics decreasing error');
  }
})

router.post('/00', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_00,(err, data) => {
      console.log(data.rows)
      res.render('panalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('panalytics decreasing error');
  }
})

router.post('/02', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_02,(err, data) => {
      console.log(data.rows)
      res.render('panalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('panalytics decreasing error');
  }
})

router.post('/04', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_04,(err, data) => {
      console.log(data.rows)
      res.render('panalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('panalytics decreasing error');
  }
})

router.post('/06', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_06,(err, data) => {
      console.log(data.rows)
      res.render('panalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('panalytics decreasing error');
  }
})

router.post('/08', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_08,(err, data) => {
      console.log(data.rows)
      res.render('panalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('panalytics decreasing error');
  }
})

router.post('/10', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_10,(err, data) => {
      console.log(data.rows)
      res.render('panalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('panalytics decreasing error');
  }
})

router.post('/12', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_12,(err, data) => {
      console.log(data.rows)
      res.render('panalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('panalytics decreasing error');
  }
})

router.post('/14', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_14,(err, data) => {
      console.log(data.rows)
      res.render('panalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('panalytics decreasing error');
  }
})

router.post('/16', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_16,(err, data) => {
      console.log(data.rows)
      res.render('panalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('panalytics decreasing error');
  }
})

router.post('/18', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_18,(err, data) => {
      console.log(data.rows)
      res.render('panalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('panalytics decreasing error');
  }
})

router.post('/20', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_20,(err, data) => {
      console.log(data.rows)
      res.render('panalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('panalytics decreasing error');
  }
})

router.post('/22', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_22,(err, data) => {
      console.log(data.rows)
      res.render('panalytics', {
        result: data.rows 
      })
    });
  } catch {
    console.log('panalytics decreasing error');
  }
})

module.exports = router;
