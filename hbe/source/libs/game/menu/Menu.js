Menu = Control.inherit({

    controllName: 'mainmenu',	

	onInit: function(ws, selector) {
		this.ws = ws;
		this.bind(selector);
		ws.on('mainmenu_composition', this.onChangeComposition.bind(this));
		this.itemsByName = {};
	},

	onChangeComposition: function(message) {
		this.itemsByName = {};
		this.items = message.items;
		for(var i = 0, c = this.items, l = c.length; i < l; i++) {
			this.itemsByName[c[i].hash] = true;
		}
		this.rePlace();
	},

	exists: function(name) {
		return name in this.itemsByName;
	},

	render: function() {
		return _t['%component_path%/items']({
			items: this.items,
			_l: _l,
			component_path: '%component_path%'
		});
	}
})

applyLabels({

	'%component_path%/main': {
		ru: 'Главная'
	},

	'%component_path%/about': {
		ru: 'Об игре'
	},

	'%component_path%/start': {
		ru: 'Начать'
	}
});
