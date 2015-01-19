'use strict'

var Class			= require('class')
  , coroutine		= require('coroutine')
  , spawn			= require('child_process').spawn
  , fs				= require('fs')
  , crypto			= require('crypto')


var checkPath = coroutine(function*(path, g) {
    // console.log('check path ' + path)
	var p = path.substr(1).split('/')
	var c = ''
	for(var i = 0, l = p.length - 1; i < l; i++) {
		c += '/' + p[i]
	    // console.log('exists ' + c)
		var r = yield fs.exists(c, g.resumeWithError)
		if(r[0]) {
		}
		else {
			// console.log('mkdir ' + c)
			yield fs.mkdir(c, g.resume)
		}
	}
})

function classicExec(cmd, argv, callback) {

	var p = spawn(cmd, argv), content = '', stderr = ''

	p.stdout.on('data', function (data) {
		content += data
	})

	p.stderr.on('data', function (data) {
		stderr += data
		console.log('stderr ' + data)
	})

	p.on('close', function (code) {
		callback(null, [ content, stderr ])
	})
}


module.exports = {
	classicExec:		classicExec,
	checkPath:			checkPath
}