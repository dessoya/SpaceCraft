'use strict'

var passport				= require('passport')
  , FacebookStrategy		= require('passport-facebook').Strategy
  , util					= require('util')
  , url						= require('url')

  , common					= require('./../common.js')
  , sessions				= require('./../sessions.js')


function req_return(req, res) {

	// console.log('/api/facebook/return')
	var session = req._as_session
	sessions.success_redirect(session, res, req.user.username, req.user.id)
	// res.end()
}


function init(app, method_config) {

	passport.use(new FacebookStrategy({
		clientID:		method_config.clientID,
		clientSecret:	method_config.clientSecret,
		callbackURL:	config.service_site + ':' + config.http_server.port + "/api/facebook/return",
		// enableProof:	false,
		profileFields:	['username', 'id']
	}, /* function() {} */
		function(accessToken, refreshToken, profile, done) {
			// process.nextTick(function () {
				return done(null, profile);
			// });
		} 
	))

	app.get('/api/facebook',		common.req_entry_point, function(req, res) { res.redirect('/api/facebook/auth') })
	app.get('/api/facebook/auth',	passport.authenticate('facebook'))
	app.get('/api/facebook/return',	sessions.req_session_checker, common.req_session_getter, passport.authenticate('facebook', { failureRedirect: '/' }), req_return)
}

module.exports = {
	init:	init
}