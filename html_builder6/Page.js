'use strict'

var Class		= require('class')
  , coroutine	= require('coroutine')
  , fs			= require('fs')
  , Resources	= require('./resources/list.js')
  , crypto		= require('crypto')

var idIterator = 1

var Page = module.exports = require('./Component.js').inherit({

    componentType: 'page',
	buildRelativePath: 'pages',

	onCreate: function(project, name) {
		this.project = project
		this.name = name
		this.id = idIterator ++
		this.configAnalyzeMTime = 0
		this.lastUpdateMTime = 0
		this.resources = { }
		this.libsOrder = [ ]
	},

	getSourcePath: function() {
		return this.project.path + '/pages' + this.name
	},

	update: coroutine.method(function*(page, build, g) {

	    // todo: check
		console.log('update page ' + page.name + ' with build ' + build.name)

	    // check for valid page
	    if(!('/page.json' in page.resources)) {
	    	console.log('page ' + page.name + ' dont have page.json resource')
	    	return
	    }

	    var configResource = page.resources['/page.json']
		var pageConfig = configResource.json

		if(configResource.mtime != page.configAnalyzeMTime) {
			page.configAnalyzeMTime = configResource.mtime
			page.error = null

			console.log('analyze page ' + page.name + ' config')
			// check and make libs order
			var libsOrder = page.libsOrder = [ ], libs = page.libs = { }
			for(var name in pageConfig) {
				if(name.length > 2 && name.substr(0, 3) === 'use') {
					var a = pageConfig[name].split(',')
					for(var i = 0, l = a.length; i < l; i++) {
						libs['/' + a[i]] = { placeInOrder: false, checkDeps: false }
					}
				}
			}

			var exit, plibs = page.project.libCollector.components
			do {
				exit = true

				for(var name in libs) {
					var lib = libs[name]

					if(!('lib' in lib)) {
						if(name in plibs) {
							lib.lib = plibs[name]
							exit = false
							yield lib.lib.update(build, g.resume)
						}												
						else {
							page.error = 'lib ' + name + ' absent'
						}
					}

					if(lib.lib && !lib.checkDeps) {
						lib.checkDeps = true
						exit = false

						var l = lib.lib.libs
						for(var name in l) {
							if(!(name in libs)) {
								libs[name] = { placeInOrder: false, checkDeps: false }
							}
						}
					}

					if(lib.lib && lib.checkDeps && !lib.placeInOrder) {

						var df = true

						var d = lib.lib.libs, df = true
						for(var dname in d) {
							if(dname in libs && libs[dname].lib && libs[dname].checkDeps && libs[dname].placeInOrder) {
								
							}
							else {
								df = false
								break
							}
						}
						// console.log('lib deps ' + name)

						if(df) {
							exit = false
							lib.placeInOrder = true
							libsOrder.push(lib)
						}						
					}
				}

			}
			while(!exit)

			// page.libs = libs
			// page.libsOrder = libsOrder
		}

		if(page.error) {
			console.log('error: ' + page.error)
			return
		}

	    if(!('resultPath' in pageConfig)) {
	    	console.log('page ' + page.name + ' dont have resultPath in page.json')
	    	return
	    }

		// check exists
		var resultPath = build.config.path + pageConfig.resultPath
		var needRebuild = false, mtime

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

		    mtime = yield page.getFinalMTime(build, g.resume)
			// calc dependency items

			// var rmtime = (yield fs.stat(resultPath, g.resume)).mtime.getTime()
			var rmtime = fileInfo.mtime
			// console.log('resultPath '+resultPath+' rmtime '+rmtime+' mtime '+mtime)

			if(rmtime != mtime) {
				console.log('file ' + resultPath + ' outdated')
				needRebuild = true
			}
		}

		if(!needRebuild) {
			// check for composition

			var dep = page.composition(build)
			dep.sort(function(a,b) {
				if(a.name === b.name) return 0
				if(a.name < b.name) return -1
				return 1
			})

			var key = ''
			for(var i = 0, l = dep.length; i < l; i++) {
				key += dep[i].name
			}

			if(yield keyChecker.check(resultPath, key, g.resume)) {
				yield keyChecker.update(resultPath, key, g.resume)
				needRebuild = true
				console.log('file ' + resultPath + ' new composition')
			}
		}



		// build and place
		if(needRebuild) {

			console.log('build page ' + page.name)
			var rhtml = page.resources['/index.html']

			yield rhtml.loadContent(g.resume)

			var css = '', js = '', templates = '_t = {'

			var comps = page.composition(), cl = comps.length

			for(var i = 0; i < cl; i++) {
				var r = comps[i]
				if(r.type !== 'html') continue
				if(r.name === '/index.html') continue
				var n = '/' + r.owner.type + r.owner.name + r.name_

				yield r.loadContent(g.resume)
				var func = r.generateFunctionFromBuild(build)
				r.releaseContent()

				if(build.config.jsCompress) {
					var key = crypto.createHash('md5').update(JSON.stringify(build.config)).digest('hex')
					func = yield jsOptimizer.fromCache(r.getSourcePath(), key, 'a='+func, g.resume)
					func = func.substr(2, func.length - 4)
				}

				templates += "'" + n + "':" + func
				templates += ','
			}

			templates = templates.substr(0, templates.length - 1)

			// console.log('build.config.cssPlacement ' + build.config.cssPlacement)
			switch(build.config.cssPlacement) {
			case 'internal':
				for(var i = 0; i < cl; i++) {
					var r = comps[i]
					// console.log('r '+r.name+' type '+r.type)
					if(r.type === 'css') {
						// console.log('css '+r.name)
						yield r.loadContent(g.resume)
						css += yield r.compile(build, g.resume)
						r.releaseContent()
					}
				}

				css = '<style>' + css + '</style>'
			break

			case 'external':
				for(var i = 0; i < cl; i++) {
					var r = comps[i]
					if(r.type === 'css') {
				    	css += '  <link href="/' + r.owner.buildRelativePath + r.owner.name + r.name + '" rel="stylesheet" media="all">\n'
					}
				}
				css = css.substr(0, css.length - 1)
			break

			}

			switch(build.config.jsPlacement) {
			case 'internal':
				for(var i = 0; i < cl; i++) {
					var r = comps[i]
					// console.log('r '+r.name+' type '+r.type)
					if(r.type === 'js') {
						// console.log('css '+r.name)
						yield r.loadContent(g.resume)
						js += yield r.compile(build, g.resume)
						r.releaseContent()
					}
				}

				js = '<script>' + js + '</script>'
			break

			case 'external':
				for(var i = 0; i < cl; i++) {
					var r = comps[i]
					if(r.type === 'js') {
						js += '  <script src="/' + r.owner.buildRelativePath + r.owner.name + r.name_ + '.' + r.getKey(build) + '.js"></script>\n'
					}
				}
				js = js.substr(0, js.length - 1)

			break

			}

			templates += '};'


			// console.log(js)

			var content = yield rhtml.compile(build, { templates: templates, css: css, js: js }, g.resume)
			rhtml.releaseContent()

			yield fs.writeFile(resultPath, content, g.resume)

			mtime = yield page.getFinalMTime(build, g.resume)

			yield fs.utimes(resultPath, Math.floor(mtime/1000), Math.floor(mtime/1000), g.resume)
		}

		var c = page.composition()
		for(var i = 0, l = c.length; i < l; i++) {
			var r = c[i]
			yield r.update(build, g.resume)
		}

		page.lastUpdateMTime = yield page.getFinalMTime(build, g.resume)

	}),

	composition: function(build) {

		var dep = [ ] 

		for(var i = 0, c = this.libsOrder, l = c.length; i < l; i++) {
			var lib = c[i]
			dep = dep.concat(lib.lib.composition(build))
		}		

		for(var name in this.resources) {
			var r = this.resources[name]
			if(r.type === 'css' || r.type === 'js' || r.type === 'marker' || r.type === 'json') {
				dep.push(r)
			}
		}

		dep.push(this.resources['/index.html'])

		return dep
	},

	getFinalMTime: coroutine.method(function*(page, build, g) {

		for(var i = 0, c = page.libsOrder, l = c.length; i < l; i++) {
			var lib = c[i]
		    yield lib.lib.checkCompositionComponent(g.resume)
		}		

		var dep = page.composition(build)

		var mtime = 0
		for(var i = 0, l = dep.length; i < l; i++) {
			var r = dep[i]
			var rmtime = yield r.getFinalMTime(build, g.resume)
			// console.log(r.name + ' ' + rmtime)
			if(rmtime > mtime) mtime = rmtime
		}

		return mtime
	}),

	fileExists: function(build, relative) {
		
		var rs = this.resources
		if(!('/page.json' in rs)) return false
		var config = rs['/page.json'].json
		if(!('resultPath' in config)) return false

		if(relative === config.resultPath) return true

		var c = this.composition()
		for(var i = 0, l = c.length; i < l; i++) {
			var r = c[i]
			if(r.fileExists(build, relative)) return true
		}

		return false
	},

	changed: coroutine.method(function*(page, g) {

	    yield page.checkCompositionComponent(g.resume)

		var d = yield page.getFinalMTime(null, g.resume)
		if(page.lastUpdateMTime != d) {
			return true
		}

		return false
	})

})