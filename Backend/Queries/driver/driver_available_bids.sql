/*select number of is_win bids*/
/*find the number of total pax*/
/*subtract the is_win from pax*/
with W as (
    select count(*) 
    from bid 
    where is_win is true
    and email_driver = 'ayurenev5@icio.us'
),

P as (
    select pax, B.vehicle
    from vehicles V, bid B 
    where V.license_plate = B.vehicle
    and B.email_driver = 'ayurenev5@icio.us'
)

with N as (select distinct P.name, P.email
from passenger P, bid B
where P.email = B.email_bidder),

CP as (select P.vehicle, P.pax-W.count as current_pax
from (select count(*) 
    from bid 
    where is_win is true
    and email_driver = 'ayurenev5@icio.us') W, 
    (select pax, B.vehicle
    from vehicles V, bid B 
    where V.license_plate = B.vehicle
    and B.email_driver = 'ayurenev5@icio.us') P)

select distinct N.name, CP.current_pax, B.email_bidder, B.vehicle, B.start_loc, B.end_loc, B.amount, B.s_date, B.s_time
from Bid B, (select distinct P.name, P.email
from passenger P, bid B
where P.email = B.email_bidder) N, 
(select P.vehicle, P.pax-W.count as current_pax
from (select count(*) 
    from bid 
    where is_win is true
    and email_driver = 'ayurenev5@icio.us') W, 
    (select pax, B.vehicle
    from vehicles V, bid B 
    where V.license_plate = B.vehicle
    and B.email_driver = 'ayurenev5@icio.us') P)CP
where B.email_bidder = N.email
and B.email_driver = 'ayurenev5@icio.us';
