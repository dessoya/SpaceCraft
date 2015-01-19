'use strict'

var assert				= require('assert')
  , Class				= require('class')
  , util				= require('util')
  , coroutine			= require('coroutine')
  , errors				= require('errors')

  , Session				= require('./../../models/Session.js')
  , test_utils			= require('test_utils')


describe('model Session', function() {

	it('case 1', function(done) {

		this.timeout(20000)

	    coroutine(function*(g) {

			var cc = yield test_utils.create_cc([ Session ], g.resume)

	    	var session = Session.create(123, false, null, cc)
			assert.strictEqual(false, session.valid, 're_uuid')

	    	session = Session.create('12345678-1234-1234-1234-1234567890ab', false, null, cc)
			assert.strictEqual(true, session.valid, 're_uuid')

	    	yield session.load(g.resume)
			assert.strictEqual(false, session.valid, 'load')

			yield session.new(g.resume)
			var result = yield cc.query('select * from auth_sessions', g.resume)
			assert.strictEqual(1, result.rows.length, 'rows.length')
			assert.strictEqual(session.uuid, result.rows[0].session_uuid, 'rows.length')


			yield cc.remove(g.resume)
	    
	    })(function(err, result) {
	    	if(err) {
	    		console.showError(err)
				assert.strictEqual(1, 2, 'generator error')
	    	}
			done()
		})
	})

})
