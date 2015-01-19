Class = function(){}
Class.prototype = {

	onCreate: function onCreate () { },
	inherit: function() {

		var child = arguments[0]
		var classes = Array.prototype.slice.call(arguments, 0)

		classes.push(this)

		var childContructor = function(){}
		var p = childContructor.prototype = {}

		p.parent = this.prototype
		p.parents = []

		var o = Class.prototype.onCreate, i = classes.length; while(i--) {
			var parent = classes[i]
			if('function' === typeof parent) {
				parent = parent.prototype
				p.parents.push(parent)
			}
			for(var name in parent) {
				if('parent' === name || 'parents' === name || 'onCreate' === name) continue
				p[name] = parent[name]
			}
		}
		
		if(classes.length > 2) {
			var a = classes.pop()
			classes.splice(1, 0, a)
		}

		for(var i = 0, l = classes.length; i < l; i++) {
			var parent = classes[i]
			if('function' === typeof parent) {
				parent = parent.prototype
			}

			if(parent.onCreate && parent.onCreate === o) continue

			if(parent.onCreate && !p.onCreate) {
				p.onCreate = parent.onCreate
				break
			}
		}

		if(!p.onCreate) p.onCreate = o

		childContructor.create = this.create
		childContructor.inherit = this.inherit
		childContructor.constructor = this.constructor

        return childContructor
	},	

	constructor: function(object) {
		return this.prototype.onCreate.bind(object)
	},

	'super': function(name) {
		var args = Array.prototype.slice.call(arguments)
		args.shift()

		this._super(this, name, args, [])
	},

	_super: function(object, name, args, e) {

		if(name in this) {
			if(e.indexOf(this[name]) === -1) {
				e.push(this[name])
				this[name].apply(object, args)
			}
		}

		var p = this.parents

		for(var i = 0, l = p.length; i < l; i++) {
			var item = p[i]
			if(name in item) {
				if(e.indexOf(item[name]) === -1) {
					e.push(item[name])
					item[name].apply(object, args)
				}
			}
			item._super(object, name, args, e)
		}
	},

	create: function() {

		var object = new this
		object.onCreate.apply(object, arguments)
		return object
	}
}

Class = Class.prototype.inherit({})
