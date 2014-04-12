var Class = function(){};
Class.prototype = {

	onCreate: function() {},
	inherit: function() {

		var child = arguments[0];
		var classes = Array.prototype.slice.call(arguments, 0);
		classes.push(this);

		var childContructor = function(){};
		var p = childContructor.prototype = {};

		p.parent = this.prototype;
		p.parents = [];

		if(child.global) {
			p.global = 'function' === typeof child.global ? child.global() : child.global;
			delete child.global;
		}
		else p.global = {};

		var i = classes.length; while(i--) {
			var parent = classes[i];
			if('function' == typeof parent) {
				parent = parent.prototype;
				p.parents.push(parent);
			}
			for(var name in parent) {
				if('parent' == name || 'parents' == name || 'global' == name) continue;
				p[name] = parent[name];
			}
		}

		childContructor.global = p.global;
		childContructor.create = this.create;
		childContructor.inherit = this.inherit;
		childContructor.asParent = this.asParent;

		if(child.globalInterface)
			for(var name in child.globalInterface) 
				childContructor[name] = child.globalInterface[name];

        return childContructor;
	},	

	asParent: function(e, funcName) {
		if(!funcName) return this.prototype.parent.onCreate.bind(e);
		return this.prototype.parent[funcName].bind(e);
	},

	create: function() {
		var object = new this;
		object.global = this.prototype.global;
		object.onCreate.apply(object, arguments);		
		return object;
	},

	defineProps: function(propsList) {
		propsList = propsList.split(',');
		var props = {}, i = propsList.length; while(i--) {
			var propParams = propsList[i].split(':'), prop = propParams[0];
			for(var j = 1, k = propParams.length; j < k; j++)
				this['propMaker_'+propParams[j]](prop);
			props[prop] = {
				get: this['get_' + prop],
				set: this['set_' + prop]
			}
		}		
		Object.defineProperties(this, props);
	}
}

Class = Class.prototype.inherit({});
