'use strict'

var passport				= require('passport')
  , VKontakteStrategy		= require('passport-vkontakte').Strategy
  , util					= require('util')
  , url						= require('url')

  , common					= require('./../common.js')
  , sessions				= require('./../sessions.js')


function req_return(req, res) {
	var session = req._as_session
	console.log(util.inspect(req.user,{depth:null}))
	sessions.success_redirect(session, res, req.user.username, req.user.id)
}


function init(app, method_config) {

	passport.use(new VKontakteStrategy({
    	clientID:		method_config.clientID,
	    clientSecret:	method_config.clientSecret,
    	callbackURL:	config.service_site + ':' + config.http_server.port + "/api/vk/return",
  	},
  	function(accessToken, refreshToken, profile, done) {
    	// User.findOrCreate({ vkontakteId: profile.id }, function (err, user) {
      	return done(null, profile)
    	// });
  	}
	))


	app.get('/api/vk',			common.req_entry_point, function(req, res) { res.redirect('/api/vk/auth') })
	app.get('/api/vk/auth',		passport.authenticate('vkontakte'))
	app.get('/api/vk/return',	sessions.req_session_checker, common.req_session_getter, passport.authenticate('vkontakte', { failureRedirect: '/' }), req_return)
}

module.exports = {
	init:	init
}