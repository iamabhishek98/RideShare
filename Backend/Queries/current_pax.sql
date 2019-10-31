select distinct P.email_driver, P.vehicle, P.pax-W.count as current_pax
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
where W.email_driver = P.email_driver;
