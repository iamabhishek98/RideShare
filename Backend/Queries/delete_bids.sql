delete from Bid where exists(select * from advertiseTrip A where 
A.email = email_driver 
and A.start_loc = start_loc
and A.a_date = s_date
and A.a_time = s_time
and is_win = true) and is_win = false;