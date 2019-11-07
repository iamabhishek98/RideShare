select distinct P.name, R.email_driver, R.rating, Q.common_songs
from (select distinct P.name, B.email_driver, B.rating 
        from bid B, passenger P
        where B.is_win is true 
        and P.email = B.email_driver
        and B.e_date is not null and B.e_time is not null) R, 
    (select distinct P.email, count(*) as common_songs
        from likes L inner join plays P 
        on L.name = P.name
        where L.email = 'ayurenev5@icio.us'
        group by P.email) Q, 
    passenger P
where R.email_driver = Q.email
and P.email = R.email_driver
order by rating desc, common_songs desc;
