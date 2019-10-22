drop table if exists users CASCADE;
drop table if exists driver CASCADE;
drop table if exists passenger CASCADE;
drop table if exists vehicles CASCADE;
drop table if exists drives CASCADE;
drop table if exists message CASCADE;
drop table if exists advertisesTrip CASCADE;
drop table if exists bid CASCADE;
drop table if exists log CASCADE;
drop table if exists location CASCADE;
drop table if exists favouriteLocation CASCADE;
drop table if exists gets CASCADE;
drop table if exists discount CASCADE;
drop table if exists rewarded CASCADE;

create table users(
    email varchar(256) primary key,
    name varchar(100) not null,
    password varchar(100) not null,
    address varchar(100) not null,
    credit_card_num varchar(100) not null
    --Just include some fields in the form that can be set to null.. just for fun
);

create table driver(
    email varchar(256) primary key references users(email)
);

create table passenger(
    email varchar(256) primary key references users(email)
);

create table vehicles(
    license_plate varchar(50) primary key,
    pax integer
);

create table drives(
    email varchar(256) references driver(email) not null,
    license_plate varchar(50) primary key references vehicles 
);

create table message(
    sender_email varchar(256) references users(email) not null,
    receiver_email varchar(256) references users(email) not null,
    msg varchar(1024) not null,
    msg_time time,
    msg_date date,
    unique(msg_time, msg_date, sender_email, receiver_email) /* do we need this */
    /*
        how do i ensure that sender_email and receiver_email are unique for each tuple but allow
        duplicates of this to exist in the table
    */
);

create table advertisesTrip(
    start_loc varchar(256) not null,
    end_loc varchar(256) not null,
    email varchar(256) references driver(email),
    a_date date,
    a_time time,   --time the driver will start his trip
    primary key(email, start_loc, end_loc)
);

create table log(
    email_driver varchar(256) not null references driver (email),
    email_passenger varchar(256) not null references passenger (email),
    amount float,
    e_date date,
    e_time time,
    review varchar(1024),
    rating numeric,
    log_id numeric primary key
);

create table bid(
    is_win boolean,
    b_date date,  
    b_time time,
    amount float,
    start_loc varchar(256),
    end_loc varchar(256),
    email_bidder varchar(256) references passenger(email),
    email_driver varchar(256) references driver(email),
    log_id numeric references log(log_id),
    primary key(email_bidder, email_driver, start_loc, end_loc, b_date, b_time),
    foreign key (email_driver, start_loc, end_loc) references advertisesTrip(email, start_loc, end_loc)
);

-- create table favouriteLocation(
--     loc_name varchar(256),
--     email varchar (256) not null references passenger(email),
--     primary key(loc_name, email)
-- );

create table location(
    loc_name varchar(256) primary key,
    loc_add varchar(256) not null
);

create table favouriteLocation(
    email_passenger varchar(256) references passenger(email),
    loc_name varchar(256) references location (loc_name),
    primary key(email_passenger, loc_name)
);

create table discount(
    exp_date date not null,
    description varchar(256),
    tier numeric not null,
    amount float not null,
    primary key(tier) 
);

create table gets (
    email varchar(256) references passenger(email),
    tier numeric references discount(tier),
    primary key(email, tier)
);

create table rewarded(
    email varchar(256) not null references passenger(email),
    tier numeric not null references discount(tier),
    primary key(email, tier)
);