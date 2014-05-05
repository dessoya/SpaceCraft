
AppState = Class.inherit({

	onCreate: function() {
		this.state = null;
		this.states = {};
		this.setState('init');
	},

	setState: function(state, params) {

		if(this.state) {
			var stateTreator = this.states[this.state];
			if(stateTreator.deactivate) stateTreator.deactivate()
		}

		if(!(state in this.states)) {
			/* debug */ console.log('setState ' + state);
			this.states[state] = AppState[state].create();
		}
		this.state = state;

		var stateTreator = this.states[this.state];
		if(stateTreator.activate) stateTreator.activate(params)
	}
})
