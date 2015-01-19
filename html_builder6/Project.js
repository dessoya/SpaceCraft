'use strict'

var Class		= require('class')
  , pfs			= require('proxy-fs')
  , coroutine	= require('coroutine')
  , Page		= require('./Page.js')
  , Lib			= require('./Lib.js')
  , fs			= require('fs')
  , Build		= require('./Build.js')
  , util		= require('util')
  , ComponentCollector = require('./ComponentCollector.js')

var Project = module.exports = Class.inherit({

	onCreate: function(path) {
		this.path = path
	},

	init: coroutine.method(function*(project, g) {

		project.pageCollector = ComponentCollector.create(project, Page, project.path + '/pages', 'page.json')
		yield project.pageCollector.init(g.resume)

		project.libCollector = ComponentCollector.create(project, Lib, project.path + '/libs', 'lib.json')
		yield project.libCollector.init(g.resume)

		var c = '' + (yield fs.readFile(project.path + '/project.json', g.resume))
		project.config = JSON.parse(c)

		project.builds = { }

		for(var name in project.config.builds) {
			var b = project.builds[name] = Build.create(project, name, project.config.builds[name])
			yield b.init(g.resume)
		}

	}),

	processChanges: coroutine.method(function*(project, g) {

        var cnt = 0

		cnt += yield project.libCollector.processChanges(g.resume)
		cnt += yield project.pageCollector.processChanges(g.resume)

		return cnt
	}),

	updatePages: coroutine.method(function*(project, g) {

	    var p = project.pageCollector.components, b = project.builds
		for(var name in p) {
			var page = p[name]
			if(yield page.changed(g.resume)) {
				for(var name in b) {
					var build = b[name]
					yield page.update(build, g.resume)
				}
			}
		}
	}),

	removeDepricated: coroutine.method(function*(project, g) {

	    // console.log('project.removeDepricated')
	    var b = project.builds
		for(var name in b) {
			var build = b[name]
			yield build.removeDepricated(project, g.resume)
		}

	})
})