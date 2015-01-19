'use strict'

var Class			= require('class')
  , coroutine		= require('coroutine')
  , fs				= require('fs')
  , crypto			= require('crypto')
  , vm				= require('vm')

var HTML = module.exports = require('./Base.js').inherit({

    type: 'html',

	gen_modify: coroutine(function*(resource, g) {

	}),

	gen_destroy: coroutine(function*(resource, builds, g) {

	}),

	loadContent: coroutine.method(function*(resource, g) {

		var path = resource.getSourcePath()
		var c = '' + (yield fs.readFile(path, g.resume))

		// crate tokens
		var r = resource.readTokens(c)
		resource.tokens = r.tokens
	}),

	releaseContent: function() {
		delete this.tokens
	},

	readTokens: function(text) {

		var a, tokens = [ ]

		while(text.length) {

			if(a = reStart.exec(text)) {

				if(a.index > 0) {
					tokens.push(Tokens.Const.create(text.substr(0, a.index)))
				}
				text = text.substr(a.index + a[0].length)
				// console.log(a)
				// console.log(text)

				// variable
				if(a[1]) {
					tokens.push(Tokens.End.create())
				}
				// for
				else if(a[2]) {
					tokens.push(Tokens.For.create(a[3], a[4]))
				}
				else if(a[5]) {					
					tokens.push(Tokens.Var.create(a[5]))
				}
				else {
					console.log(util.inspect(a,{depth:null}))
					break
				}
			}
			else {
				tokens.push(Tokens.Const.create(text))
				break
			}
		}

		return { tokens: tokens, text: text }
	},

	compile: coroutine.method(function*(resource, build, params, g) {

		var templateConfig = {
			stripSpaces: build.config.stripSpaces ? true : false
		}

		var func = resource.generateFunction(templateConfig, { leting: true })
		           
		var key = crypto.createHash('md5').update(JSON.stringify(templateConfig) + JSON.stringify({ leting: true })).digest('hex')

		var content = yield jsOptimizer.fromCache(resource.getSourcePath(), key, func, g.resume)

        var f = vm.runInNewContext(content)

		var html = f(params)

		return html
	}),

	generateFunctionFromBuild: function(build) {

		var templateConfig = {
			stripSpaces: build.config.stripSpaces ? true : false
		}

		return this.generateFunction(templateConfig, { })
	},

	generateFunction: function(config, opt, name) {

		var env = { level: 1, fori: 0 }, text = (opt.leting ? 'a = ' : '') + 'function(params) {\n'
		text += '  var _ = params, text = \'\';\n'

		for(var i = 0, c = this.tokens, l = c.length; i < l; i++) {
			text += c[i].compile(config, env)
		}

		text += '  return text;\n'
		text += '}'

		return text
	},

})

var reStart = /%\s*(?:(end\s+(?:for))|(for\s+([a-zA-Z_][a-zA-Z_-\d\.]+)\s+in\s+([a-zA-Z_][a-zA-Z_-\d\.]+))|([a-zA-Z_][a-zA-Z_-\d\.\s\+'/\.\[\]\(\)]+?))\s*%/
// 1 - end
// 2 - for name in collection
// 3 -     name
// 4 -     collection
// 5 - var

var Tokens = { }

var Token = Class.inherit({
	makeLevelAlign: function(env) {
		var c = env.level, a = ''
		while(c--) {
			a += '  '
		}
		return a
	}
})

Tokens.Const = Token.inherit({

	onCreate: function(c) {
		this.type = 'Const'
		this.c = c
	},

	compile: function(config, env) {
		var t = this.c
		if(config.stripSpaces) {
			t = t.replace(/^\s+|\s+$/g, '').replace(/\>\s+\</g, '><')
		}
		return this.makeLevelAlign(env) + 'text += \'' + t.replace(/(['\\])/g, '\\$1').replace(/\n/g, '\\n\\\n') + '\';\n'
	}

})

Tokens.Var = Token.inherit({

	onCreate: function(v) {
		this.type = 'Var'
		this.v = v
	},

	compile: function(config, env) {

		var t = this.v.replace(/^([a-zA-Z_])/, '_.$1').replace(/([\[\s\(])([a-zA-Z_])/g, '$1_.$2')
		

		return this.makeLevelAlign(env) + 'text += ' + t + ';\n'
	}
})


Tokens.For = Token.inherit({

	onCreate: function(i, c) {
		this.type = 'For'
		this.i = i
		this.c = c
	},

	compile: function(config, env) {
	    var i = 'i'+env.fori, l = 'l'+env.fori
		var t = this.makeLevelAlign(env) + 'for(var '+i+' = 0, '+l+' = _.'+this.c+'.length; '+i+' < '+l+'; '+i+'++ ) {\n';
		t += this.makeLevelAlign(env) + '  _.'+this.i+' = _.'+this.c+'['+i+'];\n';
		env.fori ++
		return t
	}
})


Tokens.End = Token.inherit({

	onCreate: function() {
		this.type = 'End'
	},

	compile: function(config, env) {
		var t = this.makeLevelAlign(env) + '}\n';
		return t
	}
})
