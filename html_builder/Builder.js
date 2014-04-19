'use strict'

var Class			= require('class')
  , fs				= require('fs')
  , Page			= require('./Page.js')

var Builder = Class.inherit({

	onCreate: function(sourcePath, staticPath, pagesConfig) {
		this.sourcePath = sourcePath
		this.staticPath = staticPath

		this.files = {}

		this.pages = []
		var c = pagesConfig.length; while(c--) this.pages.push(Page.create(this, pagesConfig[c]))

		this.interval = setInterval(this.onInterval.bind(this), 700)
	},

	registerFile: function(path, callback) {
		if(!(path in this.files)) this.files[path] = { callbacks: [], mtime: 0 }
		this.files[path].callbacks.push(callback)
	},

	onInterval: function() {
		for(var path in this.files) {
			var stat = fs.statSync(path), item = this.files[path], mtime = stat.mtime.getTime()
			if(mtime > item.mtime) {
				item.mtime = mtime
				var c = item.callbacks
				for(var i = 0, l = c.length; i < l; i++)
					c[i](path, mtime)
			}			
		}
	}

})

module.exports = Builder