'use strict'

var Class			= require('class')
  , coroutine		= require('coroutine')
  , uuid			= require('uuid')
  , crypto			= require('crypto')
  , util			= require('util')

var User = module.exports = Class.inherit({

	onCreate: function(type) {
	    
	    switch(type) {
		case 'method':
			this.loadByMethod(arguments[1], arguments[2], arguments[3])
			break
		case 'new':
			this.new(arguments[1], arguments[2])
			break
		case 'uuid':
			this.loadByUUID(arguments[1], arguments[2])
			break
		}
	},

	loadByMethod: coroutine.method(function*(user, method, method_uuid, g) {

		var result = yield cc.query('select * from idx_users_'+method+'_uuid where ' + method + '_uuid = ' + method_uuid, g.resume)
		if(result.rows.length < 1) {
			user.valid = false
			return user
		}

		yield user.loadByUUID(result.rows[0].user_uuid, g.resume)

		return user
	}),

	loadByUUID: coroutine.method(function*(user, uuid, g) {

		var result = yield cc.query('select * from users where user_uuid = ' + uuid, g.resume)
		if(result.rows.length < 1) {
			user.valid = false
			return user
		}

		user.set(result.rows[0])

		return user
	}),

	set: function(row) {
		this.valid = true
		this.uuid = row.user_uuid
		this.name = row.username
		this.tag = row.tag

		this.vk_uuid = row.vk_uuid
		this.facebook_uuid = row.facebook_uuid
		this.google_uuid = row.google_uuid
	},

	new: coroutine.method(function*(user, name, g) {

		var tag = parseInt([
			1 + Math.floor(Math.random()*9),
				Math.floor(Math.random()*10),
				Math.floor(Math.random()*10),
				Math.floor(Math.random()*10)
		].join(''))

		do {
			user.uuid = uuid.v4()
			var result = yield cc.query('insert into users (user_uuid, username, tag) values ('+user.uuid+','+cc.escape(name) + ',' + tag + ') if not exists', g.resume)
		} while (!result.rows[0]['[applied]'])

		return user
	}),

	update: coroutine.method(function*(user, fields, g) {

	    var i = 0
		if('facebook_uuid' in fields) {
			if(user.facebook_uuid) {
				// cc.query('delete from idx_auth_sessions_user_uuid where user_uuid = ' + session.user_uuid, g.group(1, i++))
			}
			cc.query('insert into idx_users_facebook_uuid (facebook_uuid, user_uuid) values (' + fields.facebook_uuid + ',' + user.uuid + ')', g.group(1, i++))
		}

		if('vk_uuid' in fields) {
			if(user.vk_uuid) {
				// cc.query('delete from idx_auth_sessions_user_uuid where user_uuid = ' + session.user_uuid, g.group(1, i++))
			}
			cc.query('insert into idx_users_vk_uuid (vk_uuid, user_uuid) values (' + fields.vk_uuid + ',' + user.uuid + ')', g.group(1, i++))
		}

		var keys = []
		for(var key in fields) {
			keys.push(key+'='+cc.escape(fields[key]))
		}
		cc.query('update users set ' + keys.join(',') + ' where user_uuid = ' + user.uuid, g.group(1, i++))

		var r = yield 0
		console.log(util.inspect(r,{depth:null}))
	})
})