select distinct N.name, CP.current_pax, B.email_bidder, B.vehicle, B.start_loc, B.end_loc, B.amount, B.s_date, B.s_time
from Bid B, 
    (select distinct P.name, P.email
        from passenger P, bid B
        where P.email = B.email_bidder) N,
    (select distinct P.email_driver, P.vehicle, P.pax-W.count as current_pax
        from  (select distinct Q1.email_driver, count(Q2.email_driver)
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
                        group by Q1.email_driver
                    union
                    select distinct D.email as email_driver, 0 as count 
                        from driver D left join bid B
                        on D.email = B.email_driver
                        where B.email_driver is null) W, 
                (select distinct A.email as email_driver, A.vehicle, V.pax
                    from vehicles V, advertisestrip A 
                    where V.license_plate = A.vehicle) P
        where W.email_driver = P.email_driver) CP
where B.email_bidder = N.email
and B.email_driver = CP.email_driver
and B.vehicle = CP.vehicle
and B.email_driver = $1
and B.is_win is false;
