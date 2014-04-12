'use strict'

var Phoenix			= require('phoenix')
  , coroutine		= require('coroutine')
  , cql				= require('ncc')
  , url				= require('url')
  , APIRequest		= require('./../../APIRequest.js')

var List = APIRequest.inherit({
	request_gen: function*(params,sv) {

		var result = yield ncc.execute('select name from galaxys', [ ], sv.resume)
		var rows = result.rows, c = rows.length, a = []; while(c--)
			a.push({name:rows[c].name})

		return a
	}
})

module.exports = List