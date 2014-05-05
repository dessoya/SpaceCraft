'use strict'

var url				= require('url')

  , sessions		= require('./sessions.js')

var re_session_uuid_check = /^[a-f\d]{8}\-[a-f\d]{4}\-[a-f\d]{4}\-[a-f\d]{4}\-[a-f\d]{12}$/
var re_method = /^\/api\/([^\/]+)/

function req_entry_point(req, res, next) {

	var session = { }

	if(!('referer' in req.headers)) {
		console.err('referer absent at ' + req.url)
		res.status(403)
		res.end()
		return
	}

	var referer = req.headers.referer, r = url.parse(referer)
	session.protocol = r.protocol
	session.hostname = r.hostname
	session.port = r.port
	// console.log(util.inspect(session,{depth:null}))

	var q = url.parse(req.url, true)

	var a = re_method.exec(q.pathname)
	session.method = a[1]

	session.session_uuid = q.query.session_uuid || ''
	if(!re_session_uuid_check.exec(session.session_uuid)) {
		var path = sessions.make_app_path(session) + '/api/auth/failed?reason=session_uuid&method=' + session.method
		// console.log('path '+path)
		res.redirect(path)
		return
	}
	// console.log('step 1 session_uuid ' + session.session_uuid)

	sessions.add(session)
	res.cookie(config.sessionCookie, session.session_uuid, { expires: new Date( Date.now() + 60*1000*60*24*60 ), httpOnly: true, path: '/' })
	next()
}

function req_session_getter(req, res, next) {

	var session_uuid = req.cookies[config.sessionCookie]
	// console.log('step 3 session_uuid ' + session_uuid)
	var session = sessions.getAndDelete(session_uuid)
	if(session === null) {
		var path = sessions.make_app_path(session) + '/api/auth/failed?reason=session_absent&session_uuid=' + session_uuid + '&method=' + session.method
		res.redirect(path)
		return	
	}
	// console.log('step 3 finish')
	req._as_session = session
	next()
}

module.exports = {
	init: function(app) { },
	req_entry_point: req_entry_point,
	req_session_getter: req_session_getter,
}