'use strict'

var Class			= require('class')
  , fs				= require('fs')
  , util			= require('util')
  , crypto			= require('crypto')
  , cssMini			= require('css-condense')
  , spawn			= require('child_process').spawn

function jsmini(content, callback) {
	var md5 = crypto.createHash('md5')
	md5.update(content + config.cleanDebug)
	var minifiedPath = config.compiledCache + '/' + md5.digest('hex') + '.js'

	// console.log('start minifyng '+path)
	var ctx = { minifiedPath: minifiedPath, source: minifiedPath+'.source', compressedContent: '' }
	fs.writeFileSync(ctx.source, content)

	var argv = ['-jar', config.compilerPath,
		'--jscomp_off=globalThis',
		'--js', ctx.source ],
		p = spawn('java', argv)

	p.stdout.on('data', function (data) {
		this.compressedContent += data
	}.bind(ctx))

	p.stderr.on('data', function (data) {
	  console.log(this.sourcePath + ' stderr: ' + data)
	}.bind(ctx))

	p.on('close', function (code) {
		callback(this.compressedContent)
	}.bind(ctx));
}


var Page = Class.inherit({
	onCreate: function(builder, pageConfig) {
		this.builder = builder

		this.cssOrder = []
		this.cssContent = {}
		this.cssCompiled = ''

		this.jsOrder = []
		this.jsContent = {}
		this.jsCompiled = ''

		this.tmpls = {}
		this.tmplCompiled = ''

		for(var i = 0; i < pageConfig.files.length; i++) {
			var path = pageConfig.files[i]
			var sourcePath = builder.sourcePath + '/' + path
			this.addFile(sourcePath)
		}

		this.sourceHtmlPath = builder.sourcePath + '/' + pageConfig.path
		this.staticHtmlPath = builder.staticPath + '/' + pageConfig.dest
		builder.registerFile(this.sourceHtmlPath, this.onHtmlChange.bind(this))
	},

	addFile: function(path) {

		if('/*' === path.substr(-2)) {				
			path = path.substr(0, path.length - 2)
			var files = fs.readdirSync(path)
			// console.dir(files)
			for(var j = 0, l = files.length; j < l; j++) {
				var sourceFilePath = path + '/' + files[j]
				this.addFile(sourceFilePath)
			}
		}			
		else if('.tmpl' === path.substr(-5)) {
			// console.log(path+' '+path.substr(-5))
			this.builder.registerFile(path, this.onTmplChange.bind(this))
			this.tmpls[path] = ''
		}
		else if('.css' === path.substr(-4)) {
			this.builder.registerFile(path, this.onCssChange.bind(this))
			this.cssOrder.push(path)
		}
		else if('.js' === path.substr(-3)) {
			this.builder.registerFile(path, this.onJsChange.bind(this))
			this.jsOrder.push(path)
		}		
	},

	onHtmlChange: function() {
		console.log('html change '+this.sourceHtmlPath)
		var content = '' + fs.readFileSync(this.sourceHtmlPath)
		// clean
		this.content = content.replace(/\>\s+\</g, '><').replace(/\s+$/, '')
		this.save()
	},

	save: function() {
		if(!this.content) return;
		console.log('write new version '+this.sourceHtmlPath)
		fs.writeFileSync(this.staticHtmlPath, this.applyResource())
	},

	getTmplName: function(path) {
		var b = this.builder.sourcePath
		path = path.substr(b.length + 1)
		path = path.replace(/\//g, '_')
		path = path.substr(0, path.length - 5)
		return path
	},

	onTmplChange: function(path, mtime) {
		// console.log('onTmplChange '+path)
		var content = '' + fs.readFileSync(path)
		var compiled = 'function tmpl(args) {'
		if(config.hints) compiled += '\n'
		compiled += 'var h="";'
		if(config.hints) compiled += '\n'

		var items = [{type:0,data:content}]
		
		var collectionId = 1
		var operations = [
			{	re: new RegExp(/\%\s+for\s+(?:(end)|(\S+)\s+in\s+(\S+))\s+\%/),
				operation: function(a, result) {
					// for end
					if(a[1] && a[1].length) {
						var part = '}'
						if(config.hints) part += '\n'
						result.push({type:1,data:part})
					}
					// for begine
					else {
						var iname = 'i'+collectionId, lname = 'l'+collectionId
						var iterator = a[2], collection = a[3]
						var part = 'for(var '+iname+'=0,'+lname+'=args.'+collection+'.length;'+iname+'<'+lname+';'+iname+'++){'
						if(config.hints) part += '\n'
						part += 'args.'+iterator+'=args.'+collection+'['+iname+'];'
						if(config.hints) part += '\n'

						result.push({type:1,data:part})
						collectionId ++
					}		
				}
			},
			{	re: new RegExp(/\%\s+if\s+(?:(end)|(\S+))\s+\%/),
				operation: function(a, result) {
					// if end
					if(a[1] && a[1].length) {
						var part = '}'
						if(config.hints) part += '\n'
						result.push({type:1,data:part})
					}
					// if begin
					else {
						var expression = a[2]

						var part = 'if(' + expression + '){'
						part = part.replace(/\$/g, 'args.')

						result.push({type:1,data:part})
					}		
				}
			},
			{	re: new RegExp(/\%(\S+?)%/),
				operation: function(a, result) {
					var part = 'args.' + a[1]
					result.push({ type: 2, data: part })
				}
			}
		]

		for(var j = 0, k = operations.length; j < k; j++) {
			var operation = operations[j]
			var result = []
			for(var i = 0, l = items.length; i < l; i++) {
				var item = items[i]
				if(item.type !== 0) {
					result.push(item)
					continue
				}
				var text = item.data, a
				while(text.length > 0 && (a = operation.re.exec(text))) {
					result.push({type:0,data:text.substr(0, a.index)})
					operation.operation(a, result)
					text = text.substr(a.index + a[0].length)
				}
				if(text.length) result.push({type:0,data:text})
			}
			items = result
		}

		console.log(util.inspect(items,{depth:null}))
		var cc = []
		for(var i = 0, l = items.length; i < l; i++) {
			var item = items[i]
			switch(item.type) {

			case 0:
				cc.push('"'+item.data.replace(/^\s+|\s+$/g, '').replace(/\>\s+\</g, '><').replace(/\"/g, '\\"')+'"')
				break

			case 1:
				if(cc.length) {
					compiled += 'h += '+cc.join('+') + ';'
					if(config.hints) compiled += '\n'
					cc = []
				}
				compiled += item.data
				//if(config.hints) compiled += '\n'
				break

			case 2:
				cc.push(item.data)
				break
			}
		}		
		if(cc.length) {
			compiled += 'h += '+cc.join('+') + ';'
			if(config.hints) compiled += '\n'
		}

		compiled += 'return h;'
		if(config.hints) compiled += '\n'
		compiled += '}'

		jsmini(compiled, function(mini) {

			mini = mini.replace(/function\stmpl/, 'function')
			mini = mini.replace(/\s*\;\s*$/, '')

			this.self.tmpls[this.path] = mini

			var tmpls = []
			for(var path in this.self.tmpls) {
				var part = ''
				if(config.hints) part += '/* ---- file: '+path+' */\n'
				part += this.self.getTmplName(path)+': '+this.self.tmpls[path]
				tmpls.push(part)
			}
			// console.dir(tmpls)

			this.self.tmplCompiled = ''
			if(config.hints) this.self.tmplCompiled += '\n'
			this.self.tmplCompiled += 'tmpls={'
			if(config.hints) this.self.tmplCompiled += '\n'

			var sep = ',' + ( config.hints ? '\n' : '' )
			this.self.tmplCompiled += tmpls.join(sep)

			if(config.hints) this.self.tmplCompiled += '\n'
			this.self.tmplCompiled += '};'
			if(config.hints) this.self.tmplCompiled += '\n'

			this.self.save()

		}.bind({self:this,path:path}))
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
		this.save()
	},

	jsAfterLoad: function(content) {
		if(!config.cleanDebug) return content

		var lines = content.split('\n'), filtered = [], re_debug = /^\s*\/\*\s*debug\s*\*\//
		for(var i = 0, l = lines.length; i < l; i++) {
			var line = lines[i]
			if(re_debug.exec(line)) {
			}
			else {
				filtered.push(line)
			}
		}
		return filtered.join('\n')
	},

	onJsChange: function(path, mtime) {

		if(config.useMini) {

		// check for exists in cache
		var md5 = crypto.createHash('md5')
		md5.update(path + config.cleanDebug)
		var minifiedPath = config.compiledCache + '/' + md5.digest('hex') + '.js'
		if(fs.existsSync(minifiedPath) && mtime === fs.statSync(minifiedPath).mtime.getTime()) {
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
			this.save()
		}
		else {
			// need to create
			console.log('start minifyng '+path)
			var ctx = { page: this, sourcePath: path, minifiedPath: minifiedPath, source: minifiedPath+'.source', mtime: mtime, compressedContent: '' }
			fs.writeFileSync(ctx.source, this.jsAfterLoad('' + fs.readFileSync(path)))

			var argv = ['-jar', config.compilerPath, 
				'--jscomp_off=globalThis', 
				'--js', ctx.source ],
				p = spawn('java', argv), js = ''
				

			p.stdout.on('data', function (data) {
				this.compressedContent += data
			}.bind(ctx))

			p.stderr.on('data', function (data) {
			  console.log(this.sourcePath + ' stderr: ' + data)
			}.bind(ctx))

			p.on('close', function (code) {

 				fs.writeFileSync(this.minifiedPath, this.compressedContent.replace(/\s+$/, ''))
				var mtime = Math.floor(this.mtime / 1000)
				fs.utimesSync(this.minifiedPath, mtime, mtime)
				this.page.onJsChange(this.sourcePath, this.mtime)

			}.bind(ctx));
		}

		}
		else {
			var content = '' + fs.readFileSync(path)
			this.jsContent[path] = this.jsAfterLoad(content)
			this.jsCompiled = config.hints ? '\n' : ''
			for(var i = 0, c = this.jsOrder, l = c.length; i < l; i++) {
				path = c[i]
				if(config.hints) this.jsCompiled += '/* ---- file: '+path+' */\n'
				this.jsCompiled += this.jsContent[path]
				if(config.hints) this.jsCompiled += '\n'
			}
			this.save()
		}
	},

	applyResource: function() {
		var content = this.content
		content = content.replace(/%css%/, this.cssCompiled)
		var jsContent = this.tmplCompiled + this.jsCompiled
		content = content.replace(/%js%/, jsContent)
		return content
	}
})

module.exports = Page