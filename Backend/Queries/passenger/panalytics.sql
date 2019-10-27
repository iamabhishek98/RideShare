with AVG_BID as (select distinct start_loc as location, avg(amount) as average_bid
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

select B.s_time as time, B.start_loc as location, WB.successful_bids, WP.percent, AB.average_bid
from Bid B, AVG_BID AB, WIN_BIDS WB, WIN_PERCENT WP
where B.start_loc = AB.location and B.start_loc = WB.location and B.start_loc = WP.location
    and B.s_time between '09:00:00' and '11:00:00';
