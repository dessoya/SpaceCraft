'use strict'

var Class			= require('class')
  , fs				= require('fs')
  , crypto			= require('crypto')
  , cssMini			= require('css-condense')
  , spawn			= require('child_process').spawn

var Page = Class.inherit({
	onCreate: function(builder, pageConfig) {
		this.builder = builder
/*
		"path": "index.html",
		"dest": "index.html",
*/		
		this.cssOrder = []
		this.cssContent = {}
		this.cssCompiled = ''

		this.jsOrder = []
		this.jsContent = {}
		this.jsCompiled = ''

		for(var i = 0; i < pageConfig.files.length; i++) {
			var path = pageConfig.files[i]
			var sourcePath = builder.sourcePath + '/' + path
			if('.css' === path.substr(-4)) {
				builder.registerFile(sourcePath, this.onCssChange.bind(this))
				this.cssOrder.push(sourcePath)
			}
			else if('.js' === path.substr(-3)) {
				builder.registerFile(sourcePath, this.onJsChange.bind(this))
				this.jsOrder.push(sourcePath)
			}
		}

		this.sourceHtmlPath = builder.sourcePath + '/' + pageConfig.path
		this.staticHtmlPath = builder.staticPath + '/' + pageConfig.dest
		builder.registerFile(this.sourceHtmlPath, this.onHtmlChange.bind(this))
		// this.onHtmlChange()
	},

	onHtmlChange: function() {
		console.log('html change '+this.sourceHtmlPath)
		var content = '' + fs.readFileSync(this.sourceHtmlPath)
		// clean
		this.content = content.replace(/\>\s+\</g, '><').replace(/\s+$/, '')
		fs.writeFileSync(this.staticHtmlPath, this.applyResource())
	},

	onCssChange: function(path, mtime) {
		var content = '' + fs.readFileSync(path)
		this.cssContent[path] = cssMini.compress(content)		
		this.cssCompiled = config.hints ? '\n' : ''
		for(var i = 0, c = this.cssOrder, l = c.length; i < l; i++) {
			path = c[i]
			if(config.hints) this.cssCompiled += '/* ---- file: '+path+' */\n'
			this.cssCompiled += this.cssContent[path]
			if(config.hints) this.cssCompiled += '\n'
		}
		if(!this.content) return;
		fs.writeFileSync(this.staticHtmlPath, this.applyResource())
	},

	onJsChange: function(path, mtime) {

		// check for exists in cache
		var md5 = crypto.createHash('md5')
		md5.update(path)
		var minifiedPath = config.compiledCache + '/' + md5.digest('hex') + '.js'
		if(fs.existsSync(minifiedPath) && mtime === fs.statSync(path).mtime.getTime()) {
			// exists and equal

			var content = '' + fs.readFileSync(minifiedPath)
			this.jsContent[path] = content
			this.jsCompiled = config.hints ? '\n' : ''
			for(var i = 0, c = this.jsOrder, l = c.length; i < l; i++) {
				path = c[i]
				if(config.hints) this.jsCompiled += '/* ---- file: '+path+' */\n'
				this.jsCompiled += this.jsContent[path]
				if(config.hints) this.jsCompiled += '\n'
			}
			if(!this.content) return;
			fs.writeFileSync(this.staticHtmlPath, this.applyResource())

		}
		else {
			// need to create
			console.log('start minifyng '+path)
			var argv = ['-jar', config.compilerPath, 
				'--jscomp_off=globalThis', 
				'--js', path],
				p = spawn('java', argv), js = '',
				ctx = { page: this, sourcePath: path, minifiedPath: minifiedPath, mtime: mtime, compressedContent: '' }

			p.stdout.on('data', function (data) {
				this.compressedContent += data
			}.bind(ctx))

			p.stderr.on('data', function (data) {
			  console.log(this.sourcePath + ' stderr: ' + data)
			}.bind(ctx))

			p.on('close', function (code) {

 				fs.writeFileSync(this.minifiedPath, this.compressedContent.replace(/\s+$/, ''))
				fs.utimesSync(this.minifiedPath, this.mtime, this.mtime)
				this.page.onJsChange(this.sourcePath, this.mtime)

			}.bind(ctx));
		}		
	},

	applyResource: function() {
		var content = this.content
		content = content.replace(/%css%/, this.cssCompiled)
		content = content.replace(/%js%/, this.jsCompiled)
		return content
	}
})

module.exports = Page