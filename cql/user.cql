
drop table users;
create table users (

	user_uuid uuid,

	username varchar,
	tag int,

	vk_uuid uuid,
	google_uuid uuid,
	facebook_uuid uuid,

	primary key (user_uuid)
);

drop table idx_users_vk_uuid;
create table idx_users_vk_uuid (

	vk_uuid uuid,
	user_uuid uuid,

	primary key (vk_uuid)
);


drop table idx_users_facebook_uuid;
create table idx_users_facebook_uuid (

	facebook_uuid uuid,
	user_uuid uuid,

	primary key (facebook_uuid)
);

drop table idx_users_google_uuid;
create table idx_users_google_uuid (

	google_uuid uuid,
	user_uuid uuid,

	primary key (google_uuid)
);
