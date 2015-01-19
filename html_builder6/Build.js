'use strict'

var Class		= require('class')
  , coroutine	= require('coroutine')
  , fs			= require('fs')
  , pfs			= require('proxy-fs')
  , util		= require('util')
  , utils		= require('./utils.js')

var Build = module.exports = Class.inherit({

	onCreate: function(project, name, config) {
		this.project = project
		this.name = name
		this.config = config
	},

	init: coroutine.method(function*(build, g) {

		var exists = (yield fs.exists(build.config.path, g.resumeWithError))[0]
		if(!exists) {
			yield fs.mkdir(build.config.path, g.resume)
		}

		build.path = yield pfs.createPath(build.config.path, g.resume)

		// console.log(util.inspect(build.path, {depth:null}))

		var r = yield utils.classicExec('find', [ build.config.path, '-empty', '-type', 'd', '-delete' ], g.resume)
		var exists = (yield fs.exists(build.config.path, g.resumeWithError))[0]
		if(!exists) {
			yield fs.mkdir(build.config.path, g.resume)
		}
		// console.log(r)
		// find /home/sc/hbe/static/debug -empty -type d -delete

	}),

	removeDepricated: coroutine.method(function*(build, project, g) {

	    // console.log('build[' + build.name + '].removeDepricated')

		var changes = build.path.getChanges()

		if(changes.length > 0) {
			// console.log(changes)
			build.path.cleanup()
		}

		var p = project.pageCollector.components, deleted = false
		while(changes.length) {

			var change = changes.shift()
			// console.log(change)

			if(change.event === 'deleteFile') continue

			var exists = false
			for(var name in p) {
				var page = p[name]
				if(page.fileExists(build, change.relative)) {
					exists = true
					break
				}
			}

			if(!exists) {
			    var file = build.config.path + change.relative
				console.log('file ' + file + ' depricated')
				yield fs.unlink(file, g.resume)
				deleted = true
			}
		}

		if(deleted) {
			var r = yield utils.classicExec('find', [ build.config.path, '-empty', '-type', 'd', '-delete' ], g.resume)
	   	}

	})
})