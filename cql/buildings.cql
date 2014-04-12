
drop table buildings;
create table buildings (

	building_uuid uuid,
	planet_uuid uuid,

	type int,

	x int, y int,

	primary key(building_uuid)
);