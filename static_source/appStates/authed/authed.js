
AppState.authed = Class.inherit({
	onCreate: function() {
	},

	activate: function(params) {
		topUserMenu.setAuthMenu(params);
	}
})
