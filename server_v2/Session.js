'use strict'

var Class			= require('class')
  , coroutine		= require('coroutine')
  , cql				= require('ncc')
  , crypto			= require('crypto')
  
var Session = Class.inherit({

})

Session.method_uuid = function(key) {

	var md5 = crypto.createHash('md5')
	md5.update('' + key)
	md5 = md5.digest('hex')

	// e1bd021e-6068-455d-bc4d-759d55ac7f1c
	var uuid = md5.substr(0,8) + '-' + md5.substr(8,4) + '-' + md5.substr(12,4) + '-' + md5.substr(16,4) + '-' + md5.substr(20)

	return uuid
}

Session.update = function(session_uuid, fields, callback) {
	var keys = [], params = []
	for(var key in fields) {
		keys.push(key+'=?')
		params.push(fields[key])
	}
	ncc.execute('update auth_sessions set ' + keys.join(',') + ' where session_uuid = ' + session_uuid, params, 1, callback)
}

var re_uuid_checker = /^[a-f\d]{8}\-[a-f\d]{4}\-[a-f\d]{4}\-[a-f\d]{4}\-[a-f\d]{12}$/
Session.get = function(session_uuid, callback) {
	if(re_uuid_checker.exec(session_uuid)) {
		ncc.execute('select * from auth_sessions where session_uuid = ' + session_uuid, function(err, result) {
			if(err) {
				callback(GE_ERROR, err)
			}
			else {
				if(result.rows.length) {
					var session = result.rows[0]
					delete session.columns
					callback(GE_END, session)
				}
				else {
					callback(GE_END, null)
				}
			}
		})
	}
	else {
		process.nextTick(function() {
			callback(GE_END, null)
		})
	}
}

Session.updateLastAccess = function(session_uuid, callback) {
	ncc.execute('update auth_sessions set last_access = now() where session_uuid = ' + session_uuid, function(err, result) {
		if(err) {
			callback(GE_ERROR, err)
		}
		else {
			callback(GE_END)
		}
	})
}

Session.generate = function(callback) {
	coroutine(function*(params, sv) {
		do {
			var session_uuid = cql.types.uuid() 
			var result = yield ncc.execute("insert into auth_sessions (session_uuid, last_access) values (?, now()) if not exists", [session_uuid], 1, sv.resume)
		} while(!result.rows[0]['[applied]'])
		return { session_uuid: session_uuid, is_auth: false }
	}, null, callback)
}

module.exports = Session