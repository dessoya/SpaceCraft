
function makeEventFunction(event, event2) {
	if(event2) {
		return function(item, value, control) {
			item.addEventListener(event, function(e) {
				control.execute(value, this, e);
			});
			item.addEventListener(event2, function(e) {
				control.execute(value, this, e);
			});
		}
	}

	return function(item, value, control) {
		item.addEventListener(event, function(e) {
			control.execute(value, this, e);
		});
	}
}

var Control = EventEmmiter.inherit({

	global: {
		idIterator: 1,
		plugins: {}
	},

	globalInterface: {
		addPlugin: function(type, plugin) {
			if(!(this.global.plugins[type])) this.global.plugins[type] = [];
			this.global.plugins[type].push(plugin);
		}
	},
	onCreate: function() {
		EventEmmiter.prototype.onCreate.apply(this, [])
		this.id = Control.prototype.global.idIterator ++;
		this.elemId = 'ctrl-' + this.id;
		this.placeHolderElement = null;
		if(this.onInit) {
			this.onInit.apply(this, arguments)
		}
	},

	render: function() {
		return '';
	},

	getPlaceHolderElement: function() {
		return this.placeHolderElement;
	},

	remove: function() {
		var ph = this.getPlaceHolderElement();
		if(null === ph) return;
		ph.parentNode.removeChild(ph);
		this.placeHolderElement = null;
	},

	bind: function(selector) {
		var el = 'string' === typeof selector ? document.querySelector(selector) : selector;
		this.placeHolderElement = el;
	},

	place: function(selector) {
		this.bind(selector);
		var body = this.render();
		this.placeHolderElement.innerHTML = this.noWrap ? body : '<div id="'+this.elemId+'"'+(this.controllName ? ' class="ctrl-'+this.controllName+'"' : '')+'>' + body + '</div>';

		this.processMarks(this.placeHolderElement.querySelectorAll("*"));
		this.afterPlace(this.placeHolderElement);
	},

	rePlace: function() {
		if(null === this.placeHolderElement) return;
		this.place(this.placeHolderElement);
	},

	afterPlace: function() {},

	marks: [
		{ name: 'click',
		  process: makeEventFunction('click')
		},
		{ name: 'scroll',
		  process: makeEventFunction('scroll')
		},
		{ name: 'after-place',
		  process: function(item, value, control) {
			control.execute(value, item);
		  }
		},
		{ name: 'mousewheel',
		  process: makeEventFunction('mousewheel', 'DOMMouseScroll')
		}
	],

	processMarks: function(items) {
		var p = Control.prototype.global.plugins.DOMScanner ? Control.prototype.global.plugins.DOMScanner : [];
		for(var i = 0, l = items.length; i < l; i++) {
			var item = items[i];
			for(var j = 0, k = this.marks.length; j < k; j++) {
				var mark = this.marks[j];
				var attr = 'mark-' + mark.name, value;
				if(value = item.getAttribute(attr)) {
					item.removeAttribute(attr);
					mark.process(item, value, this);
				}
				var u = p.length; while(u--) {
					p[u].process(item);
				}
			}
		}
	},

	execute: function(code, element, arg1) {
		var index = 0, args = [], text = '';
		for(var name in this) {
			if(name === 'super') continue;
			var item = this[name];
			if('function' === typeof item) item = item.bind(this);
			args.push(item);
			text += 'var ' + name + '=_a[' + index++ + '];';		
		}
		var func = '_q = function(_a,_c,element,arg1){' + text + 'return eval(_c);}';
		// console.log(func);
		return eval(func)(args, code, element, arg1);
	},

	destroy: function() {
	}

});

UI = { };
