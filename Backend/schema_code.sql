drop table if exists users CASCADE;
drop table if exists driver CASCADE;
drop table if exists passenger CASCADE;
drop table if exists vehicles CASCADE;
drop table if exists drives CASCADE;
drop table if exists message CASCADE;
drop table if exists advertisesTrip CASCADE;
drop table if exists bid CASCADE;
drop table if exists location CASCADE;
drop table if exists favouriteLocation CASCADE;
drop table if exists gets CASCADE;
drop table if exists discount CASCADE;

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
    check (sender_email <> receiver_email),
    unique(msg_time, msg_date, sender_email, receiver_email) /* do we need this */
    /*
        how do i ensure that sender_email and receiver_email are unique for each tuple but allow
        duplicates of this to exist in the table
    */
);

create table location(
    loc_name varchar(256) primary key,
    loc_add varchar(256) not null
);

create table favouriteLocation(
    email_passenger varchar(256) references passenger(email),
    loc_name varchar(256) references location (loc_name),
    primary key(email_passenger, loc_name)
);

create table advertisesTrip(
    start_loc varchar(256) not null references location(loc_name),
    end_loc varchar(256) not null references location(loc_name),
    email varchar(256) references driver(email),
    a_date date not null,
    a_time time not null,   --time the driver will start his trip
    primary key(email, start_loc, a_date, a_time)
);

create table bid(
    is_win boolean default false,
    amount float not null,
    start_loc varchar(256) not null,
    end_loc varchar(256) not null,
    email_bidder varchar(256) references passenger(email),
    email_driver varchar(256) references driver(email),
    s_date date not null,
    s_time time not null,
    e_date date,
    e_time time,
    review varchar(1024),
    rating numeric,
    CHECK ((is_win is true and (e_time > s_time) or (e_date > s_date)) or 
          ((is_win is false and e_time is null and e_date is null and review is null and rating is null))),
    primary key(email_bidder, email_driver, start_loc, s_date, s_time),
    foreign key (email_driver, start_loc, s_date, s_time) references advertisesTrip(email, start_loc, a_date, a_time)
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
