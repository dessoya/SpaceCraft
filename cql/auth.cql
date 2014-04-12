
drop table auth_sessions;
create table auth_sessions (

	session_uuid uuid,
	is_auth boolean,
	provider varchar,
	user_uuid uuid,
	provider_username varchar,
	provider_uuid uuid,
	last_access timeuuid,
	
	primary key (session_uuid)
);
