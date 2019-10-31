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
and B.email_driver = CP.email_driver
and B.email_driver = 'ayurenev5@icio.us';

-- select distinct N.name, B.email_bidder, B.vehicle, B.start_loc, B.end_loc, B.amount, B.s_date, B.s_time
-- from Bid B, (select distinct P.name, P.email
-- from passenger P, bid B
-- where P.email = B.email_bidder) N
-- where B.email_bidder = N.email
-- and B.email_driver = 'ayurenev5@icio.us';
