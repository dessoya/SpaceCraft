'use strict'

var tokens			= require('./tokens.js')

var sessions = { }

function make_app_path(session) {
	return session.protocol + '//' + session.hostname + ':' + session.port
}

function success_redirect(session, res, username, unique) {
	var token = tokens.generate()
	var args = {
		method:			session.method,
		session_uuid:	session.session_uuid,
		username:		username,
		unique:			unique,
		token:			token
	}
	var a = []
	for(var name in args) a.push(name+'='+encodeURIComponent(args[name]))
	res.redirect(make_app_path(session) + '/api/auth/success?' + a.join('&'))
}

function req_session_checker(req, res, next) {
	var session_uuid = req.cookies[config.sessionCookie] || ''
	if(!(session_uuid in sessions)) {
		console.err('session absent')
		res.status(403)
		res.end()
		return
	}
	next()
}

module.exports = {
	init:			function(app) { },
	add:			function(session) {
		sessions[session.session_uuid] = session
	},
	make_app_path:			make_app_path,
	success_redirect:		success_redirect,
	req_session_checker:	req_session_checker,
	all: function() { return sessions },
	getAndDelete: function(session_uuid) {
		if(session_uuid in sessions) {
			var session = sessions[session_uuid]
			delete sessions[session_uuid]
			return session
		}
		return null
	}
}