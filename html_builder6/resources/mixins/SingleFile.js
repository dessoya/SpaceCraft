'use strict'

var Class			= require('class')
  , coroutine		= require('coroutine')
  , fs				= require('fs')
  , utils			= require('./../../utils.js')

var SingleFile = module.exports = Class.inherit({

	gen_update: coroutine(function*(resource, build, g) {

	    if(resource.checkBuildForUpdate) {
	    	if(!resource.checkBuildForUpdate(build)) {
	    		return
	    	}
	    }

		var resultPath = build.config.path + resource.getBuildPath(build)
		var needRebuild = false, mtime = resource.mtime

		// var exists = (yield fs.exists(resultPath, g.resumeWithError))[0]
		var fileInfo = build.path.fileInfo(resultPath)

		if(fileInfo.exists) {
			// console.log('file ' + resultPath + ' exists')
		}
		else {
			console.log('file ' + resultPath + ' absent')
			needRebuild = true
		}

		// check mtime
		if(fileInfo.exists) {

			// var rmtime = (yield fs.stat(resultPath, g.resume)).mtime.getTime()
			var rmtime = fileInfo.mtime

			if(rmtime != mtime) {
				//console.log('file ' + resultPath + ' outdated mtime ' + mtime + ' rmtime ' + rmtime)
				console.log('file ' + resultPath + ' outdated')
				// mtime = rmtime
				needRebuild = true
			}
		}

		// build and place
		if(needRebuild) {
			console.log('build resource ' + (resource.owner.type === 'lib' ? 'lib[' + resource.owner.name.substr(1) + ']': '') + resource.name)

			yield resource.loadContent(g.resume)
			var content = yield resource.compile(build, g.resume)
			resource.releaseContent()

			// todo: move to proxy-fs
			yield utils.checkPath(resultPath, g.resume)

			// console.log('write ' + resultPath)
			// console.log(content)

			yield fs.writeFile(resultPath, content, g.resume)
			// smtime = yield resource.getFinalMTime(build, g.resume)
			// var smtime = mtime
			// console.log('utimes file ' + resultPath + ' mtime ' + mtime + ' ' + Math.floor(mtime/1000))
			yield fs.utimes(resultPath, Math.floor(mtime/1000), Math.floor(mtime/1000), g.resume)
		}		

	}),

	gen_destroy: coroutine(function*(resource, builds, g) {

		for(var name in builds) {
			var build = builds[name]

		    if(resource.checkBuildForUpdate) {
		    	if(!resource.checkBuildForUpdate(build)) {
	    			continue
		    	}
		    }

			// var resultPath = build.config.path + '/pages' + resource.owner.name + resource.name
			var resultPath = build.config.path + resource.getBuildPath(build)
						
			console.log('delete file ' + resultPath)
			yield fs.unlink(resultPath, g.resume)
		}

	}),

	fileExists: function(build, relative) {

	    if(this.checkBuildForUpdate) {
	    	if(!this.checkBuildForUpdate(build)) {
    			return false
	    	}
	    }

	    // if(relative === '/pages' + this.owner.name + this.name) return true
	    if(relative === this.getBuildPath(build)) return true	    

		return false
	}

})