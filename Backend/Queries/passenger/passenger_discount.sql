/*total expenditure*/
with TE as (select distinct email_bidder, sum(amount) as total_expenditure
from bid
where e_date is not null
group by email_bidder),
/*must combine with passengers who have not made any bids yet*/

/*get the tier of the passenger*/
T as (select distinct email_bidder, 
    case 
        when (total_expenditure >= 500 and total_expenditure < 1000) then 1 
        when (total_expenditure >= 1000 and total_expenditure < 1500) then 2
        when (total_expenditure >= 1500 and total_expenditure < 2000) then 3
        when (total_expenditure >= 2000 and total_expenditure < 2500) then 4
        when (total_expenditure >= 2500) then 5
        else 0
    end as tier
from TE)

select distinct T.email_bidder, D.tier, D.amount/100 as discount, D.description 
        from T, discount D
        where D.tier = T.tier;

/*insertion into discounts table*/
insert into gets(email, tier) 
select email_bidder, tier
from (select distinct T.email_bidder, D.tier, D.amount/100 as discount, D.description 
        from (select distinct email_bidder, 
                    case 
                        when (total_expenditure >= 500 and total_expenditure < 1000) then 1 
                        when (total_expenditure >= 1000 and total_expenditure < 1500) then 2
                        when (total_expenditure >= 1500 and total_expenditure < 2000) then 3
                        when (total_expenditure >= 2000 and total_expenditure < 2500) then 4
                        when (total_expenditure >= 2500) then 5
                        else 0
                    end as tier
                from (select distinct email_bidder, sum(amount) as total_expenditure
                        from bid
                        where e_date is not null
                        group by email_bidder) A) T, 
        discount D
        where D.tier = T.tier) DP
where not exists (select * from gets 
                    where email = DP.email_bidder and tier = DP.tier);

