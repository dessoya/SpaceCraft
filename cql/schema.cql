
--

drop table galaxys;
create table galaxys (

	galaxy_uuid uuid,

	name varchar,

	x double,
	y double,
	z double,

	primary key (galaxy_uuid)
);

create index idx_name on galaxys(name);

drop table star_systems;
create table star_systems (

	star_system_uuid uuid,

	galaxy_uuid uuid,

	star_weight double,
	star_class int,
	star_class_num int,

	x double,
	y double,
	z double,

	orbit_0_type int,
	orbit_0_uuid uuid,
	orbit_1_type int,
	orbit_1_uuid uuid,
	orbit_2_type int,
	orbit_2_uuid uuid,
	orbit_3_type int,
	orbit_3_uuid uuid,
	orbit_4_type int,
	orbit_4_uuid uuid,
	orbit_5_type int,
	orbit_5_uuid uuid,
	orbit_6_type int,
	orbit_6_uuid uuid,
	orbit_7_type int,
	orbit_7_uuid uuid,
	orbit_8_type int,
	orbit_8_uuid uuid,
	orbit_9_type int,
	orbit_9_uuid uuid,
	orbit_10_type int,
	orbit_10_uuid uuid,
	orbit_11_type int,
	orbit_11_uuid uuid,
	orbit_12_type int,
	orbit_12_uuid uuid,
	orbit_13_type int,
	orbit_13_uuid uuid,
	orbit_14_type int,
	orbit_14_uuid uuid,
	orbit_15_type int,
	orbit_15_uuid uuid,
	orbit_16_type int,
	orbit_16_uuid uuid,
	orbit_17_type int,
	orbit_17_uuid uuid,
	orbit_18_type int,
	orbit_18_uuid uuid,
	orbit_19_type int,
	orbit_19_uuid uuid,

	primary key (star_system_uuid)
);

create index idx_galaxy_uuid on star_systems (galaxy_uuid);

drop table planets;
create table planets (

	planet_uuid uuid,
	star_system_uuid uuid,
	orbit int,
	owner_user_uuid uuid,

	treat_ms bigint,

	buildings_list list<uuid>,

	population_sinc double,
	population double,
	population_usage double,

	crystals_sinc double,
	crystals double,

	minerals_sinc double,
	minerals double,

	fuel_sinc double,
	fuel double,

	energy double,
	energy_usage double,
	bld_energy_usage double,

	primary key (planet_uuid)
);


drop table live_planets;
create table live_planets (
	planet_uuid uuid,
	treat_ms bigint,
	primary key (planet_uuid)
);

-- map

drop table galaxy_xmap;
create table galaxy_xmap ( 
	galaxy_uuid uuid,
	star_system_uuid uuid, 
	x double, 
	primary key ( (galaxy_uuid), x) 
) with CLUSTERING ORDER BY ( x asc );

drop table galaxy_ymap;
create table galaxy_ymap ( 
	galaxy_uuid uuid,
	star_system_uuid uuid, 
	y double, 
	primary key ( (galaxy_uuid), y) 
) with CLUSTERING ORDER BY ( y asc );

drop table galaxy_zmap;
create table galaxy_zmap ( 
	galaxy_uuid uuid,
	star_system_uuid uuid, 
	z double, 
	primary key ( (galaxy_uuid), z) 
) with CLUSTERING ORDER BY ( z asc );
