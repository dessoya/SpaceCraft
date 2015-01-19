'use strict'

var Class			= require('class')
  , coroutine		= require('coroutine')
  , fs				= require('fs')
  , utils			= require('./../utils.js')
  , crypto			= require('crypto')

// /* debug */
var re_debug_code = /^(\s*)(\/\/)(\s*\/\*\s*debug\s*\*\/.*)/
var re_var = /\%([a-zA-Z\d_-]+)\%/

var JavaScript = module.exports = require('./Base.js').inherit({

    type: 'js',

	gen_modify: coroutine(function*(resource, g) {

	}),

	loadContent: coroutine.method(function*(resource, g) {

		var path = resource.getSourcePath()
		// console.log('load ' + path)
		resource.content = '' + (yield fs.readFile(path, g.resume))

	}),

	releaseContent: function() {
		delete this.content
	},

	compile: function(build, callback) {
		
		var lines = this.content.split('\n'), filtered = [], a

		build.config.component_path = build.config.template_path = '/' + this.owner.type + this.owner.name

		for(var i = 0, l = lines.length; i < l; i++) {
			var line = lines[i]

			if(build.config.jsDebugCode) {
				if(a = re_debug_code.exec(line)) {
					console.log(a)
					line = a[1] + a[3]
				}
			}

			// variables
			while(a = re_var.exec(line)) {
				// console.log(a)
				line = line.substr(0, a.index) + build.config[a[1]] + line.substr(a.index + a[0].length)
				// console.log(line)
				// process.exit()
			}

			filtered.push(line)
		}
		var content = filtered.join('\n')

		if(build.config.jsCompress) {
			console.log('js compress ' + this.getSourcePath())
			return jsOptimizer.fromCache(this.getSourcePath(), '', content, callback)
		}

		callback(null, content)
	},

	checkBuildForUpdate: function(build) {

		if( build.config.jsPlacement && build.config.jsPlacement === 'external' ) {
			return true
		}

		return false
	},

	getKey: function(build) {

		var key = ''

		if(build.config.jsDebugCode) {
			key += 'jsDebugCode'
		}

		if(build.config.jsCompress) {
			key += 'jsCompress'
		}

		key = crypto.createHash('md5').update(key).digest('hex')

		return key
	}

}, require('./mixins/SingleFile.js') )