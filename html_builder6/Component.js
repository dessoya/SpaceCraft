'use strict'

var Class		= require('class')
  , coroutine	= require('coroutine')
  , fs			= require('fs')
  , Resources	= require('./resources/list.js')


var Component = module.exports = Class.inherit({

	processChange: coroutine.method(function*(component, change, g) {

		var name = change.relative.substr(component.name.length)
		// console.log('lib ' + lib.name + ' process file ' + name)

		switch(change.event) {

		case 'newFile':

			if(name in component.resources) {
				console.err('resource allready exists ' + name + ' in ' + component.componentType + ' ' + component.name)
			}
			else if(change.wc in Resources) {
				console.log('new resource ' + name + ' in ' + component.componentType + ' ' + component.name)
				var r = component.resources[name] = Resources[change.wc].create(component, name)
				yield r.modify(change.mtime, g.resume)
			}
			else {
				console.log('skip new file ' + name + ' in ' + component.componentType + ' ' + component.name)
			}

			// update 
			var name_ = '/composition.marker'
			if(name_ in component.resources) {
				var r = component.resources[name_]
				if(r.mtime < component.resources[name].mtime) { 
					var mtime = component.resources[name].mtime
					r.mtime = mtime
					yield fs.utimes(r.getSourcePath(), Math.floor(mtime / 1000), Math.floor(mtime / 1000), g.resume)
				}
			}

		break

		case 'modifyFile':
			if(change.wc in Resources) {
				if(name in component.resources) { 
					console.log('modify resource ' + name + ' in ' + component.componentType + ' ' + component.name)
					yield component.resources[name].modify(change.mtime, g.resume)
				}
				else {
					console.err('modify resource ' + name + ' absent in ' + component.componentType + ' ' + component.name)
				}
			}
			else {
				console.log('skip modify  file ' + name + ' in ' + component.componentType + ' ' + component.name)
		    }

			// update 
			var name_ = '/composition.marker'
			if(name_ in component.resources) {
				var r = component.resources[name_]
				if(r.mtime < component.resources[name].mtime) { 
					var mtime = component.resources[name].mtime
					r.mtime = mtime
					yield fs.utimes(r.getSourcePath(), Math.floor(mtime / 1000), Math.floor(mtime / 1000), g.resume)
				}
			}

		break

		case 'deleteFile':

			if(change.wc in Resources) {
				if(name in component.resources) { 
					console.log('delete resource ' + name + ' in ' + component.componentType + ' ' + component.name)
					yield component.resources[name].destroy(component.project.builds, g.resume)
					delete component.resources[name]
				}
				else {
					console.err('delete resource ' + name + ' absent in ' + component.componentType + ' ' + component.name)
				}
			}
			else {
				console.log('skip delete file ' + name + ' in ' + component.componentType + ' ' + component.name)
		    }

			// update 
			var name = '/composition.marker'
			if(name in component.resources) {
				var mtime = Date.now(),r = component.resources[name]
				r.mtime = mtime
				yield fs.utimes(r.getSourcePath(), Math.floor(mtime / 1000), Math.floor(mtime / 1000), g.resume)
			}
		break

		}
		
	}),

	checkCompositionComponent: coroutine.method(function*(component, g) {

		var name = '/composition.marker'
		if(name in component.resources) return

		var mtime = 0, r = component.resources
		for(var key in r) {
			var item = r[key]
			if(mtime < item.mtime) {
				mtime = item.mtime
			}
		}

		r = component.resources[name] = Resources.marker.create(component, name)
		yield r.modify(mtime, g.resume)

		var sourcePath = r.getSourcePath()
		yield fs.writeFile(sourcePath, '', g.resume)
		yield fs.utimes(r.getSourcePath(), Math.floor(mtime / 1000), Math.floor(mtime / 1000), g.resume)

	}),

})
