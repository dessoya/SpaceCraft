
Sections.About = Class.inherit({

	pattern: 'about',

	onCreate: function() {
	},

	start: function() {
	},

	activate: function() {
		view_cont.innerHTML = _l('%component_path%/index');
	},

	deactivate: function() {
	}
});

applyLabels({

	'%component_path%/index': {
		ru: 'Космическая стратегия в реальном времени'
	},

});
