select distinct T.email_bidder, T.expenditure, A.avg_price
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
where T.email_bidder = A.email_bidder;
