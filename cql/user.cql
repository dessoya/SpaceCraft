
drop table users;
create table users (

	user_uuid uuid,

	username varchar,
	tag int,

	vk_uuid uuid,
	google_uuid uuid,
	facebook_uuid uuid,

	capital_planet_uuid uuid,
	star_system_list list<uuid>,
	planet_list list<uuid>,

	primary key (user_uuid)
);

create index idx_vk on users (vk_uuid);
create index idx_google on users (google_uuid);
create index idx_facebook on users (facebook_uuid);

