'use strict'

var Class		= require('class')
  , pfs			= require('proxy-fs')
  , coroutine	= require('coroutine')

var ComponentCollector = module.exports = Class.inherit({

	onCreate: function(owner, Component, path, fileMarker) {
		this.owner = owner
		this.Component = Component
		this.path = path
		this.fileMarker = fileMarker
		this.components = { }
	},

	init: coroutine.method(function*(componentCollector, g) {
		componentCollector.path = yield pfs.createPath(componentCollector.path, g.resume)
	}),

	processChanges: coroutine.method(function*(componentCollector, g) {

		var changes = componentCollector.path.getChanges()
		if(changes.length > 0) componentCollector.path.cleanup()

		var cnt = changes.length
		while(changes.length) {
			var c = changes.shift()

			var pinfo = componentCollector.getInfo(c)
			if(pinfo.component) {
				var component = pinfo.component
				yield component.processChange(c, g.resume)
			}
		}

		return cnt
	}),

	getInfo: function(change) {

		var info = { }
		var name = change.relative.substr(0, change.relative.length - change.name.length - 1)

		if(name in this.components) {
			info.component = this.components[name]
		}

		else {

			// search to the top
			// /pageName/subdir1/subdir2/filename.wc
			var a = name.substr(1).split('/')
			name = null
			for(var i = a.length - 1; i >= 0; i--) {
				var f = ''
				for(var j = 0; j <= i; j++) {
					f += '/' + a[j]
				}
				name = f
				f += '/' + this.fileMarker
				if(this.path.fileInfo(this.path.path + f).exists) {
					break
				}
				name = null
			}

			if(name !== null) {
				var component = info.component = name in this.components ? this.components[name] : this.components[name] = this.Component.create(this.owner, name)
				name = '/' + a.join('/')
				this.components[name] = component
			}
			else {
				console.err('can\'t find component for file ' + this.path.path + change.relative)
			}

		}

		return info
	},

})