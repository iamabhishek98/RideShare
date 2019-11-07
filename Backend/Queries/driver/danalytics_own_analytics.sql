select A.email_driver, A.avg_price, R.rating
from (select distinct email_driver, avg(amount) as avg_price
        from bid 
        where is_win is true
        and e_time is not null
        and e_date is not null
        group by email_driver) A, 
    (select distinct email_driver, avg(rating) as rating
        from bid
        where is_win is true 
        and e_date is not null 
        and e_time is not null
        group by email_driver) R
where A.email_driver = R.email_driver
and A.email_driver = 'jcashen7@aboutads.info';
