
drop table buildings;
create table buildings (

	building_uuid uuid,

	type int,
	level int,

	x int, y int,

	turn_on int,

	upgrading int,
	upgrade_in_progress int,
	upgrade_elapsed int,

	primary key(building_uuid)
);