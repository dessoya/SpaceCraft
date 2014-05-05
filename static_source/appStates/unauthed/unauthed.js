
AppState.unauthed = Class.inherit({
	onCreate: function() {
	},

	activate: function(params) {
		topUserMenu.setUnauthMenu(params);
	}
})
