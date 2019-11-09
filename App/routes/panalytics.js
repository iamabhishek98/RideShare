var express = require('express');
var router = express.Router();

const {Pool} = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})
var passenger_email;

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
          where s_time between '00:00:00' and '02:00:00'
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
          where s_time between '02:00:00' and '04:00:00'
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
          where s_time between '04:00:00' and '06:00:00'
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
          where s_time between '06:00:00' and '08:00:00'
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
          where s_time between '08:00:00' and '10:00:00'
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
          where s_time between '10:00:00' and '12:00:00'
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
          where s_time between '12:00:00' and '14:00:00'
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
          where s_time between '14:00:00' and '16:00:00'
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
          where s_time between '16:00:00' and '18:00:00'
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
          where s_time between '18:00:00' and '20:00:00'
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
          where s_time between '20:00:00' and '22:00:00'
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
          where s_time between '22:00:00' and '00:00:00'
          group by start_loc) as TOTAL
  where WIN.start_loc = TOTAL.start_loc)
  
  select L.loc_name as location, WB.successful_bids, WP.percent, AB.average_bid
  from Location L, AVG_BID AB, WIN_BIDS WB, WIN_PERCENT WP
  where L.loc_name = AB.location and L.loc_name = WB.location and L.loc_name = WP.location;
    `,
  
  own_analytics : `select distinct T.email_bidder, T.expenditure, A.avg_price
  from (select distinct email_bidder, sum(amount) as expenditure
          from bid 
          where is_win is true 
          and e_time is not null 
          and e_date is not null
          group by email_bidder) T,
      (select distinct email_bidder, avg(amount) as avg_price
          from bid 
          where is_win is true
          and e_time is not null
          and e_date is not null
          group by email_bidder) A
  where T.email_bidder = A.email_bidder and T.email_bidder = $1;`
}

// do the passport.js shit here to get user email

/* GET signup page. */
router.get('/', function(req, res, next) {
  console.log("Passenger Analytics");
  if(req.session.passport == undefined){
    console.log("user not logged in");
    res.redirect('login');
  } else if(req.session.passport.user.id == "passenger"){
    //passenger success
    try{
      // Construct Specific SQL Query
      pool.query(sql.query.own_analytics, ['shagergham0@theatlantic.com'], (err, data) => {
        if (data != undefined) {
          console.log(data.rows)
          pool.query(sql.query.panalytics_basic,(err, data2) => {
            if (data2 != undefined) {
              console.log(data2.rows)
              res.render('panalytics', {
                own_analytics: data.rows, result: data2.rows, title: 'Express'  
              })
            } else {
              console.log('bid analytics data is undefined')
            }
          });
        } else {
          console.log('own analytics data is undefined')
        }
      });
      
    } catch {
      console.log('panalytics basic error');
    }
  } else if(req.session.passport.user.id == "driver"){
    //no access
    res.redirect('./driver');
  } else {
    res.redirect('./login')
  }
  
  // res.render('panalytics', { result: [], title: 'Express' });
});

// POST

router.post('/increasing', function(req, res, next){
  try{
    // Construct Specific SQL Query
	  pool.query(sql.query.panalytics_increasing,(err, data) => {
      if (data != undefined) {
        console.log(data.rows)
        res.render('panalytics', {
          result: data.rows 
        })
      } else {
          console.log('data is undefined')
      }
    });
  } catch {
    console.log('panalytics increasing error');
  }
})

router.post('/decreasing', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_decreasing,(err, data) => {
      if (data != undefined) {
        console.log(data.rows)
        res.render('panalytics', {
          result: data.rows 
        })
      } else {
          console.log('data is undefined')
      }
    });
  } catch {
    console.log('panalytics decreasing error');
  }
})

router.post('/00', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_00,(err, data) => {
      if (data != undefined) {
        console.log(data.rows)
        res.render('panalytics', {
          result: data.rows 
        })
      } else {
          console.log('data is undefined')
      }
    });
  } catch {
    console.log('panalytics 00 error');
  }
})

router.post('/02', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_02,(err, data) => {
      if (data != undefined) {
        console.log(data.rows)
        res.render('panalytics', {
          result: data.rows 
        })
      } else {
          console.log('data is undefined')
      }
    });
  } catch {
    console.log('panalytics 02 error');
  }
})

router.post('/04', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_04,(err, data) => {
      if (data != undefined) {
        console.log(data.rows)
        res.render('panalytics', {
          result: data.rows 
        })
      } else {
          console.log('data is undefined')
      }
    });
  } catch {
    console.log('panalytics 04 error');
  }
})

router.post('/06', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_06,(err, data) => {
      if (data != undefined) {
        console.log(data.rows)
        res.render('panalytics', {
          result: data.rows 
        })
      } else {
          console.log('data is undefined')
      }
    });
  } catch {
    console.log('panalytics 06 error');
  }
})

router.post('/08', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_08,(err, data) => {
      if (data != undefined) {
        console.log(data.rows)
        res.render('panalytics', {
          result: data.rows 
        })
      } else {
          console.log('data is undefined')
      }
    });
  } catch {
    console.log('panalytics 08 error');
  }
})

router.post('/10', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_10,(err, data) => {
      if (data != undefined) {
        console.log(data.rows)
        res.render('panalytics', {
          result: data.rows 
        })
      } else {
          console.log('data is undefined')
      }
    });
  } catch {
    console.log('panalytics 10 error');
  }
})

router.post('/12', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_12,(err, data) => {
      if (data != undefined) {
        console.log(data.rows)
        res.render('panalytics', {
          result: data.rows 
        })
      } else {
          console.log('data is undefined')
      }
    });
  } catch {
    console.log('panalytics 12 error');
  }
})

router.post('/14', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_14,(err, data) => {
      if (data != undefined) {
        console.log(data.rows)
        res.render('panalytics', {
          result: data.rows 
        })
      } else {
          console.log('data is undefined')
      }
    });
  } catch {
    console.log('panalytics 14 error');
  }
})

router.post('/16', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_16,(err, data) => {
      if (data != undefined) {
        console.log(data.rows)
        res.render('panalytics', {
          result: data.rows 
        })
      } else {
          console.log('data is undefined')
      }
    });
  } catch {
    console.log('panalytics 16 error');
  }
})

router.post('/18', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_18,(err, data) => {
      if (data != undefined) {
        console.log(data.rows)
        res.render('panalytics', {
          result: data.rows 
        })
      } else {
          console.log('data is undefined')
      }
    });
  } catch {
    console.log('panalytics 18 error');
  }
})

router.post('/20', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_20,(err, data) => {
      if (data != undefined) {
        console.log(data.rows)
        res.render('panalytics', {
          result: data.rows 
        })
      } else {
          console.log('data is undefined')
      }
    });
  } catch {
    console.log('panalytics 20 error');
  }
})

router.post('/22', function(req, res, next){
  try{
    // var order = 'desc';
	  pool.query(sql.query.panalytics_22,(err, data) => {
      if (data != undefined) {
        console.log(data.rows)
        res.render('panalytics', {
          result: data.rows 
        })
      } else {
          console.log('data is undefined')
      }
    });
  } catch {
    console.log('panalytics 22 error');
  }
})

router.post('/dashboard', function(req, res, next){
  res.redirect('../passenger');
})
module.exports = router;
