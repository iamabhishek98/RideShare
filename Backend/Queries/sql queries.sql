/*orders the average ratings of the driver descending order*/
with B as (select distinct email_driver, avg(rating) as avg_rating
from bid 
where is_win is true
group by email_driver)

select distinct U.name as driver, round(B.avg_rating,2) as avg_rating
from users U, B
where U.email = B.email_driver
order by round(B.avg_rating,2) desc;


/*maximum number of bids at any time of the day*/
select distinct s_time as time, count(*) as frequency
from bid 
group by s_time
order by count(*) desc;


/*hotspots for carpool bidding*/
with B as (select distinct start_loc, count(*) as frequency
from bid
group by start_loc)

select distinct L.loc_name as location, B.frequency
from location L, B
where L.loc_name = B.start_loc
order by B.frequency desc;

/*percent of is_win bids*/
with TOTAL as (select distinct start_loc, count(*) as frequency
        from bid
        group by start_loc)

select distinct TOTAL.start_loc as location, (((WIN.frequency)*100)/(TOTAL.frequency)) as percent
from (
    select distinct TOTAL.start_loc, count(W.start_loc) as frequency
    from 
        TOTAL
    left join 
        (select distinct start_loc, count(*) as frequency
         from bid 
         where is_win is true
         group by start_loc) as W
         on TOTAL.start_loc = W.start_loc
         group by TOTAL.start_loc) 
    as WIN, TOTAL
where WIN.start_loc = TOTAL.start_loc
order by percent desc;

/* prints the statistics for the passenger that counts the number of successful trips from every particular location*/
with B as (select distinct start_loc, count(*) as frequency
from bid 
where is_win is True
group by start_loc)

select distinct L.loc_name as location, B.frequency
from location L, B
where L.loc_name = B.start_loc 
order by B.frequency desc;


/*average expenditure of passengers*/
with B as (select distinct email_bidder, avg(amount) as avg_expenditure
from bid
where is_win is true
group by email_bidder)

select distinct U.name as passenger, B.avg_expenditure
from users U, B
where U.email = B.email_bidder;
