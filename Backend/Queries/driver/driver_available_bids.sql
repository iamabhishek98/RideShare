select distinct  N.name, B.start_loc, B.end_loc, B.amount
from Bid B, (select distinct U.name, U.email
from users U, bid B
where U.email = B.email_bidder) N;
