
Sections.Main = Class.inherit({

	pattern: 'main',

	onCreate: function() {
	},

	start: function() {
	},

	activate: function() {
	    view_cont.innerHTML = _l('%component_path%/main');
	},

	deactivate: function() {
	}
});

applyLabels({

	'%component_path%/main': {
		ru: 'Добро пожаловать в игру Space Craft'
	}

});
