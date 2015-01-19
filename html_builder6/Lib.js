'use strict'

var Class		= require('class')
  , coroutine	= require('coroutine')
  , fs			= require('fs')
  , Resources	= require('./resources/list.js')


var Lib = module.exports = require('./Component.js').inherit({

    componentType: 'lib',
	buildRelativePath: 'libs',
	type: 'lib',

	onCreate: function(project, name) {
		this.project = project
		this.name = name
		this.resources = { }
		this.libs = { }
		this.configAnalyzeMTime = 0
	},

	getSourcePath: function() {
		return this.project.path + '/libs' + this.name
	},

	composition: function(build) {

		var dep = [ ]

		for(var name in this.resources) {
			var r = this.resources[name]
			if(r.type === 'css' || r.type === 'js' || r.type === 'marker' || r.type === 'html' || r.type === 'json') {
				dep.push(r)
			}
		}

		return dep
	},

	update: coroutine.method(function*(lib, build, g) {

		console.log('update lib ' + lib.name + ' with build ' + build.name)

	    // check for valid page
	    if(!('/lib.json' in lib.resources)) {
	    	console.log('lib ' + lib.name + ' dont have lib.json resource')
	    	return
	    }

	    var configResource = lib.resources['/lib.json']
		var libConfig = configResource.json

		if(configResource.mtime != lib.configAnalyzeMTime) {
			lib.configAnalyzeMTime = configResource.mtime
			lib.configError = null

			console.log('analyze lib ' + lib.name + ' config')
			// check and make libs order
			var libs = lib.libs = { }
			for(var name in libConfig) {
				if(name.length > 2 && name.substr(0, 3) === 'use') {
					var a = libConfig[name].split(',')
					for(var i = 0, l = a.length; i < l; i++) {
						libs['/' + a[i]] = { }
					}
				}
			}
		}
	})
})
