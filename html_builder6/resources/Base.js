'use strict'

var Class			= require('class')
  , coroutine		= require('coroutine')

var Base = module.exports = Class.inherit({

	onCreate: function(owner, name) {
		this.owner = owner
		this.name = name
		this.name_ = name.substr(0, name.length  - this.type.length - 1)
	},

	modify: function(mtime, callback) {
		this.mtime = mtime
		this.gen_modify(this, callback)
	},

	destroy: function(builds, callback) {
		this.gen_destroy(this, builds, callback)
	},

	update: function(build, callback) {
	    if(this.gen_update) {
			this.gen_update(this, build, callback)
		}
		else {
			callback()
		}
	},

	getSourcePath: function() {
		return this.owner.getSourcePath() + this.name
	},

	getFinalMTime: function(build, callback) {
		callback(null, this.mtime)
	},

	fileExists: function(build, relative) {
		return false
	},

	getBuildPath: function(build) {

		if(this.getKey) {
			return '/' + this.owner.buildRelativePath + this.owner.name + this.name_ + '.' + this.getKey(build) + '.' + this.type
		}

		return '/' + this.owner.buildRelativePath + this.owner.name + this.name
	}
	
})