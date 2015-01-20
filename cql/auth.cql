
drop table auth_sessions;
create table auth_sessions (

	session_uuid uuid,
	is_auth boolean,
	user_uuid uuid,
	auth_method varchar,
	last_access timeuuid,

	lock boolean,
	
	primary key (session_uuid)
);

drop table idx_auth_sessions_user_uuid;
create table idx_auth_sessions_user_uuid (

	user_uuid uuid,
	session_uuid uuid,

	primary key (user_uuid, session_uuid)
);
