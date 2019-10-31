drop function if exists won CASCADE;
drop trigger if exists check_delete_trip;
drop function if exists uses CASCADE;
drop trigger if exists check_highest_tier;
drop function if exists redeem CASCADE;
drop trigger if exists safe_to_delete;

--checks if a bid has been accepted by the driver before deleting the advertistment
create or replace function won()
returns trigger as $$
declare count NUMERIC;
BEGIN
   select COUNT(*) into count from bid B
   where B.start_loc = OLD.start_loc
   and B.driver = OLD.email
   and B.is_win
   and B.s_date = OLD.s_date
   and B.s_time = OLD.s_time;
   IF count = 1 THEN
      RETURN OLD;
   ELSE 
      RETURN NULL;
   END IF;
END;
$$ language plpgsql;

--check if the new tier obtained by the user is greater than any of them in the gets entity
create trigger check_delete_trip
before delete
on AdvertisesTrip
for each row 
execute procedure won();

create or replace function uses()
returns trigger as $$
BEGIN
    IF NEW.tier > ANY (SELECT G1.tier from gets where G1.email = NEW.email) THEN
        return NEW;
    ELSE
        return NULL;
    END IF;
END;   
$$ LANGUAGE plpgsql;

create trigger check_highest_tier
before INSERT on gets
for each row
execute procedure uses();

--check if the discount is used before deleting
create or replace function redeem()
returns trigger as $$
begin 
raise notice 'safe to delete'; return OLD;
end;
$$ language plpgsql;

create trigger safe_to_delete
before delete 
on gets
for each row when (OLD.is_used)
execute procedure redeem();







       