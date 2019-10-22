/*orders the average ratings of the driver descending order*/
select distinct email_driver, avg(rating)
from bid 
where is_win IS TRUE
group by email_driver
order by avg(rating) desc;

