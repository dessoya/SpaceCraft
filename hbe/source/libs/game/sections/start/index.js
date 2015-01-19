
Sections.Start = Class.inherit({

	pattern: 'start',

	onCreate: function() {
	},

	start: function() {
		ws.on('#afterAuth', this.afterAuth.bind(this));
	},

	activate: function() {

		if(!menu.exists('start')) {
			sections.setSection('main');
			return;
		}

		view_cont.innerHTML = 'some selections<br><div id="controls_cont"></div>';
		this.buttonStart = UI.Button.create('#controls_cont', 'start');
		this.buttonStart.on('click', function() {
			console.log('button click');
		});
		this.buttonStart.rePlace();
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
