select distinct N.name, A.start_loc, A.end_loc, A.a_date, A.a_time
from advertisesTrip A, (select distinct P.name, P.email 
from passenger P, advertisesTrip A
where P.email = A.email) N
where N.email = A.email
order by A.a_date desc, A.a_time desc;
