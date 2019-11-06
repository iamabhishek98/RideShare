with R as (select P.name, B.email_driver, B.rating 
from bid B, passenger P
where B.is_win is true 
and P.email = B.email_driver
and B.e_date is not null and B.e_time is not null) 

select email_driver, rating
from R
order by rating desc;
