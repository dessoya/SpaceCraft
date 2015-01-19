'use strict'

var Class			= require('class')
  , coroutine		= require('coroutine')
  , uuid			= require('uuid')
  , crypto			= require('crypto')
  , util			= require('util')
  , fs				= require('fs')

var re_uuid = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/

var Session = module.exports = Class.inherit({

	onCreate: function(session_uuid, load, callback, cc_) {
	    
    	this.cc = cc_ ? cc_ : cc

	    this.uuid = session_uuid
		this.valid = ('string' === typeof session_uuid && re_uuid.exec(session_uuid)) ? true : false

		if(load === true) {
			if(this.valid) {
				this.load(callback)
			}
			else {
				callback(null, this)
			}
		}

	},

	load: coroutine.method(function*(session, g) {

		var result = yield session.cc.query('select session_uuid, auth_method, is_auth, lock, user_uuid, unixTimestampOf(last_access) as la from auth_sessions where session_uuid = ' + session.uuid, g.resume)
		if(result.rows.length > 0) {
			session.valid = true
			var row = result.rows[0]

			session.last_access = row.la
			session.is_lock = row.lock
			session.is_auth = row.is_auth
			session.auth_method = row.auth_method
			session.user_uuid = row.user_uuid

		}
		else {
			session.valid = false
		}

		return session
	}),

	new: coroutine.method(function*(session, g) {
	    // generate uuid
	    session.uuid = null
	    do {
	    	session.uuid = uuid.v4()
	    	console.log('generate session ' + session.uuid)
			var result = yield session.cc.query('insert into auth_sessions (session_uuid,last_access,create_time) values (' + session.uuid + ',now(),now()) if not exists', g.resume)
			if(!result.rows[0]['[applied]']) {
				session.uuid = null
			}
		} while(null === session.uuid)
		yield session.load(g.resume)
		session.valid = true
	}),

	method_uuid: function(key) {

		var md5 = crypto.createHash('md5')
		md5.update('' + key)
		md5 = md5.digest('hex')

		// e1bd021e-6068-455d-bc4d-759d55ac7f1c
		var uuid = md5.substr(0,8) + '-' + md5.substr(8,4) + '-' + md5.substr(12,4) + '-' + md5.substr(16,4) + '-' + md5.substr(20)

		return uuid
	},

	update: coroutine.method(function*(session, fields, g) {

	    var i = 0
		if('user_uuid' in fields) {
		
		/*
			if(session.user_uuid) {
				cc.query('delete from idx_auth_sessions_user_uuid where user_uuid = ' + session.user_uuid, g.resume)
			}
		*/

			if(null !== fields.user_uuid) {
				var result = yield cc.query('select * from idx_auth_sessions_user_uuid where user_uuid = ' + fields.user_uuid, g.resume), session_uuids = []
				for(var i = 0, c = result.rows, l = c.length; i < l; i++) {
					session_uuids.push(c[i].session_uuid)
				}

				if(session_uuids.length > 0) {
					yield cc.query('delete from idx_auth_sessions_user_uuid where user_uuid = ' + fields.user_uuid, g.resume)
					yield cc.query('update auth_sessions set is_auth = null, auth_method = null, user_uuid = null where session_uuid in (' + session_uuids.join(',') + ')', g.resume)
				}

				yield cc.query('insert into idx_auth_sessions_user_uuid (user_uuid, session_uuid) values (' + fields.user_uuid + ',' + session.uuid + ')', g.resume)
			}
		}

		var keys = [ 'last_access=now()' ]
		for(var key in fields) {
			keys.push(key+'='+cc.escape(fields[key]))
			this[key] = fields[key]
		}

    	console.log('update session ' + session.uuid)
		yield cc.query('update auth_sessions set ' + keys.join(',') + ' where session_uuid = ' + session.uuid, g.resume)

		// var r = yield 0
		// console.log(util.inspect(r,{depth:null}))
	}),

	lock: coroutine.method(function*(session, g) {
		
		if(session.is_lock === true) {

			// todo: check for expire
			if(Date.now() - session.la > 1000 * 10) {
				console.log('take expired session ' + session.uuid)
				yield session.update({}, g.resume)
				return true
			}

			return false
		}

		var result = yield cc.query('update auth_sessions set lock = true where session_uuid = ' + session.uuid + ' if lock = null', g.resumeWithError)

		if(result[0]) {
			console.showError(result[0])
			return false
		}

		var row = result[1].rows[0]
		if(row['[applied]']) return true

		return false
	})

})

Session.unlock = function(session_uuid) {
    console.log('unlock session ' + session_uuid)
	cc.query('update auth_sessions set lock = null where session_uuid = ' + session_uuid, function(err, result) {
		if(err) {
			console.showError(err)
		}
	})
}

Session.install = coroutine(function*(cc, g) {

	var querys = ('' + (yield fs.readFile(__dirname + '/Session.cql', g.resume))).split(';')
	for(var i = 0, l = querys.length; i < l; i++) {
		var query = querys[i]
		query = query.replace(/^[\r\s\t\n]+|[\r\n\s\t]+$/g, '')
		query = query.replace(/[\t\r\n]+/g, '')
		if(query[0] == 'd') {
			yield cc.query(query, g.resumeWithError)
		}
		else {
			yield cc.query(query, g.resume)
		}
	}

})
