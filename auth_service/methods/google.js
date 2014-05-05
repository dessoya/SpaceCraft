'use strict'

var passport				= require('passport')
  , GoogleStrategy			= require('passport-google').Strategy
  , util					= require('util')
  , url						= require('url')

  , common					= require('./../common.js')
  , sessions				= require('./../sessions.js')


function req_return(req, res) {

	var session = req._as_session

	var q = url.parse(req.url, true);
	var mode = q.query['openid.mode'];
	if('id_res' === mode) {
		var email = q.query['openid.ext1.value.email']
		sessions.success_redirect(session, res, email, email)
	}
	else {
		var path = sessions.make_app_path(session) + '/api/auth/failed?reason=provider&method='+session.method
		res.redirect(path)
	}
}


function init(app, method_config) {

	passport.use(new GoogleStrategy({
    		returnURL:	config.service_site + ':' + config.http_server.port + "/api/google/return",
		    realm:		config.service_site + ':' + config.http_server.port + "/"
  		}, function() {} /*
		function(identifier, profile, done) {
			console.log(1)
			process.nextTick(function () {
				console.log(2)
				return done(null, profile)
			})
	  	} */
	))

	app.get('/api/google',			common.req_entry_point, function(req, res) { res.redirect('/api/google/auth') })
	app.get('/api/google/auth',		passport.authenticate('google'))
	app.get('/api/google/return',	sessions.req_session_checker, common.req_session_getter, req_return)
}

module.exports = {
	init:	init
}