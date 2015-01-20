
Sections.Logout = Class.inherit({

	pattern: 'logout',

	onCreate: function() {
	},

	start: function() {
	},

	activate: function() {
		ws.send({ command: 'logout' })
		this.sections.setSection('main')
	},

	deactivate: function() {
	}

});
