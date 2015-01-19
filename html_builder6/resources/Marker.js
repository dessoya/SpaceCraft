'use strict'

var Class			= require('class')
  , coroutine		= require('coroutine')
  , fs				= require('fs')

var Marker = module.exports = require('./Base.js').inherit({

    type: 'marker',

	gen_modify: coroutine(function*(resource, g) {
	}),

	gen_destroy: coroutine(function*(resource, builds, g) {

	})

})