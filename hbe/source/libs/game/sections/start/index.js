
Sections.Start = Class.inherit({

	pattern: 'start',

	onCreate: function() {
		// this.binded_onStatus = this.onStatus.bind(this);
	},

	start: function() {
	},
/*
	onStatus: function(message) {

		if( ! (message.statuses.logged && !message.statuses.playerCreated) ) {
			sections.setSection('main');
			return;
		}

		view_cont.innerHTML = 'some selections<br><div id="controls_cont"></div>';
		this.buttonStart = UI.Button.create('#controls_cont', 'start');
		this.buttonStart.on('click', function() {
			// console.log('button click');
			this.buttonStart.disable();
		}.bind(this));
		this.buttonStart.rePlace();
	},
*/
	activateProc: coroutine.method(function*(section, g) {

	    // ws.sendWithFeedBack({ command: 'getStatus', status: 'logged,playerCreated' }, this.binded_onStatus);

		var message = yield ws.sendWithFeedBack({ command: 'getStatus', status: 'logged,playerCreated' }, g.resume);

		if( ! (message.statuses.logged && !message.statuses.playerCreated) ) {
			section.sections.setSection('main');
			return;
		}

		view_cont.innerHTML = 'some selections<br><div id="controls_cont"></div>';
		section.buttonStart = UI.Button.create('#controls_cont', 'start');
		section.buttonStart.on('click', function() {
			// console.log('button click');
			this.buttonStart.disable();
		}.bind(section));
		section.buttonStart.rePlace();
	}),

	activate: function() {

		this.activateProc(function(err, result) {
			if(err) console.log(err)
		})

	},

	deactivate: function() {
		if(this.buttonStart) {
			this.buttonStart.destroy();
			delete this.buttonStart;
		}
		view_cont.innerHTML = '';
	}
});

applyLabels({

});
