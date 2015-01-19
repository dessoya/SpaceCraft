'use strict'

var Class			= require('class')
  , coroutine		= require('coroutine')
  , spawn			= require('child_process').spawn
  , fs				= require('fs')
  , crypto			= require('crypto')
  , utils			= require('./utils.js')

var config, idIterator = 1

var JSOptimizer = module.exports = Class.inherit({

	onCreate: function() {
		this.cnt = 5
		this.queue = []
	},

	optimize: function(text, filename, callback) {
		if(this.cnt < 1) {
			this.queue.push({ text: text, filename: filename, callback: callback })
		}
		else {
			this.cnt --
			this.gen_optimize(text, filename, function(err, result) {
				callback(err, result)
				this.processQueue()
			}.bind(this))
		}
	},

	processQueue: function() {
		if(this.queue.length) {
			var i = this.queue.shift(), text = i.text, callback = i.callback, filename = i.filename
			this.gen_optimize(text, filename, function(err, result) {
				callback(err, result)
				this.processQueue()
			}.bind(this))
		}
		else {
			this.cnt ++
		}
	},

/*

	var argv = ['-jar', config.compilerPath,
		'--jscomp_off=globalThis',
		'--js', ctx.source ],

	p = spawn('java', argv)

*/

	gen_optimize: coroutine(function*(text, filename, g) {

	    // make tmp file name
	    var tmpFileName = '/tmp/_' + (idIterator ++) + '_' + filename.replace(/[/]/g, '_')+ '.js'
	    yield fs.writeFile(tmpFileName, text, g.resume)

		var argv = ['-jar', config.closureCompilerPath,
			'--jscomp_off=globalThis',
			// '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
			'--compilation_level', 'SIMPLE_OPTIMIZATIONS',			
			'--js', tmpFileName ]

		console.log('optimize start')
	    var content = yield utils.classicExec('java', argv, g.resume)
	    if(content[1] && content[1].length > 0) {
	    	console.err(content[1])
	    }
	    content = content[0]
	    // console.log(tmpFileName)
	    // console.log(argv)
		console.log('optimize end')

	    yield fs.unlink(tmpFileName, g.resume)
	    
	    return content
	}),

	config: function(config_) {
		config = config_
		if(!fs.existsSync(config.cachePath)) {
			fs.mkdirSync(config.cachePath)
		}
	},

	fromCache: coroutine.method(function*(optimizer, path, key, jscontent, g) {

		var fkey = crypto.createHash('md5').update(path).digest('hex')

	    var cacheItem = config.cachePath + '/' + fkey + '.' + key + '.js'
	    console.log(cacheItem + ' ' + jscontent.length)

	    var needMake, content

	    var s = yield fs.stat(path, g.resume)

	    var exists = yield fs.exists(cacheItem, g.resumeWithError)
	    if(exists[0]) {
	    	var s2 = yield fs.stat(cacheItem, g.resume)
	    	if(s2.mtime.getTime() === s.mtime.getTime()) {
				needMake = false
	    	}
	    	else {
				needMake = true
	    	}
	    }
	    else {
	    	needMake = true
	    }

	    if(needMake) {

	    	content = jscontent
	    	content = yield jsOptimizer.optimize(content, path, g.resume)
			yield fs.writeFile(cacheItem, content, g.resume)
			yield fs.utimes(cacheItem, Math.floor(s.atime.getTime()/1000), Math.floor(s.mtime.getTime()/1000), g.resume)

	    }
	    else {

			content = '' + (yield fs.readFile(cacheItem, g.resume))
	    }

	    return content
	})

})

