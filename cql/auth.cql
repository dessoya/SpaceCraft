
drop table auth_sessions;
create table auth_sessions (

	session_uuid uuid,
	is_auth boolean,
	user_uuid uuid,
	auth_method varchar,
	last_access timeuuid,
	
	primary key (session_uuid)
);
