select distinct N.name, A.email, CP.current_pax, A.start_loc, A.end_loc, A.a_date, A.a_time
from advertisesTrip A, 
    (select distinct P.name, P.email 
        from passenger P, advertisesTrip A
        where P.email = A.email) N, 
    (select distinct P.email_driver, P.vehicle, P.pax-W.count as current_pax
        from 
            (select Q1.email_driver, count(Q2.email_driver)
                from 
                    (select distinct email_driver, count(*)
                    from bid
                    group by email_driver) Q1
                left join 
                    (select distinct email_driver, count(*) 
                    from bid 
                    where is_win is true
                    group by email_driver) Q2
                on Q1.email_driver = Q2.email_driver
                group by Q1.email_driver) W,  
            (select distinct B.email_driver, B.vehicle, V.pax
                from vehicles V, bid B 
                where V.license_plate = B.vehicle) P
        where W.email_driver = P.email_driver) CP
where N.email = A.email
and CP.email_driver = A.email
order by A.a_date desc, A.a_time desc;

-- select distinct N.name, A.email, A.start_loc, A.end_loc, A.a_date, A.a_time
-- from advertisesTrip A, (select distinct P.name, P.email 
-- from passenger P, advertisesTrip A
-- where P.email = A.email) N
-- where N.email = A.email
-- order by A.a_date desc, A.a_time desc;


select distinct N.name, CP.current_pax, B.email_bidder, B.vehicle, B.start_loc, B.end_loc, B.amount, B.s_date, B.s_time
from Bid B, 
    (select distinct P.name, P.email
    from passenger P, bid B
    where P.email = B.email_bidder) N, 
    (select distinct P.email_driver, P.vehicle, P.pax-W.count as current_pax
    from 
        (select Q1.email_driver, count(Q2.email_driver)
            from 
                (select distinct email_driver, count(*)
                from bid
                group by email_driver) Q1
            left join 
                (select distinct email_driver, count(*) 
                from bid 
                where is_win is true
                group by email_driver) Q2
            on Q1.email_driver = Q2.email_driver
            group by Q1.email_driver) W,  
        (select distinct B.email_driver, B.vehicle, V.pax
            from vehicles V, bid B 
            where V.license_plate = B.vehicle) P
    where W.email_driver = P.email_driver) CP
where B.email_bidder = N.email
and B.email_driver = 'ayurenev5@icio.us';
