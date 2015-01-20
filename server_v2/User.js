'use strict'

var coroutine			= require('coroutine')
  , util				= require('util')
  , cql					= require('ncc')


var User = {}

function*gen_create(username, sv) {

	var tag = parseInt([ 1 + Math.floor(Math.random()*9), Math.floor(Math.random()*10), Math.floor(Math.random()*10), Math.floor(Math.random()*10)].join(''))
	do {
		var user_uuid = cql.types.uuid()
		var result = yield ncc.execute('insert into users (user_uuid, username, tag) values (?,?,?) if not exists', [user_uuid, username, tag], 1, sv.resume)
	} while (!result.rows[0]['[applied]'])

	return user_uuid
}

User.create = function(username, callback) {
	coroutine(gen_create,username,callback)
}

User.update = function(user_uuid, fields, callback) {
	var keys = [], params = []
	for(var key in fields) {
		keys.push(key+'=?')
		params.push(fields[key])
	}
	var query = 'update users set ' + keys.join(',') + ' where user_uuid = ' + user_uuid
	// console.log(util.inspect([query,keys,params],{depth:null}))
	ncc.execute(query, params, 1, callback)
}

User.get = function(user_uuid, callback) {
	ncc.execute('select * from users where user_uuid=' + user_uuid, function(err, result) {
		if(err) return callback(err)
		var rows = result.rows
		callback(null, rows.length > 0 ? rows[0] : null)
	})
}

module.exports = User