var Class = function(){};
Class.prototype = {

	onCreate: function() {},
	inherit: function() {

		var child = arguments[0];
		var classes = Array.prototype.slice.call(arguments, 0);
		classes.push(this);

		var cc = function(){};
		var p = cc.prototype = {};

		p.parent = this.prototype;
		p.parents = [];

		var i = classes.length; while(i--) {
			var parent = classes[i];
			if('function' == typeof parent) {
				parent = parent.prototype;
				p.parents.push(parent);
			}
			for(var name in parent) {
				if('parent' == name || 'parents' == name ) continue;
				p[name] = parent[name];
			}
		}

		cc.create = this.create;
		cc.inherit = this.inherit;
		cc.asParent = this.asParent;

        return cc;
	},	

	asParent: function(e, funcName) {
		if(!funcName) return this.prototype.parent.onCreate.bind(e);
		return this.prototype.parent[funcName].bind(e);
	},

	create: function() {
		var object = new this;
		object.onCreate.apply(object, arguments);		
		return object;
	}
}

Class = Class.prototype.inherit({});
