select distinct  N.name, B.start_loc, B.end_loc, B.amount
from Bid B, (select distinct P.name, P.email
from passenger P, bid B
where P.email = B.email_bidder) N;
