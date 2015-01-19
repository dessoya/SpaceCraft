'use strict'

var Class			= require('class')
  , coroutine		= require('coroutine')
  , fs				= require('fs')
  , cssMini			= require('css-condense')
  , utils			= require('./../utils.js')

var CSS = module.exports = require('./Base.js').inherit({

    type: 'css',

	gen_modify: coroutine(function*(resource, g) {

	}),

	loadContent: coroutine.method(function*(resource, g) {

		var path = resource.getSourcePath()
		resource.content = '' + (yield fs.readFile(path, g.resume))

	}),

	releaseContent: function() {
		delete this.content
	},

	compile: function(build, callback) {
		
		// console.log('css content ' + this.content)

		if(build.config.cssCompress) {
			return callback(null, cssMini.compress(this.content))
		}

		callback(null, this.content)

	},

	checkBuildForUpdate: function(build) {

		if( build.config.cssPlacement && build.config.cssPlacement === 'external' ) {
			return true
		}

		return false
	},


}, require('./mixins/SingleFile.js') )
