with B as (select A.email as email, COUNT(*) as num 
from advertisesTrip A, likes L, plays P, Bid B
where P.name = L.name and L.email = $1 and P.email = A.email
group by A.email)

select distinct A.email, A.a_date, A.a_time, A.veichle, A.start_loc, A.end_loc 
from AdvertisesTrip A, B
where A.email = B.email
order by B.num desc