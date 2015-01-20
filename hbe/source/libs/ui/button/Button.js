UI.Button = Control.inherit({

    controllName: 'button',	

	onInit: function(selector, caption) {
		this.bind(selector);
		this.caption = caption;
	},

	render: function() {
		return '<button id="btn-' + this.id + '" mark-click="onClick()">' + this.caption + '</button>';
	},

	onClick: function() {
		this.emit('click');
	},

	disable: function() {
		document.getElementById('btn-' + this.id).setAttribute('disabled', 'disabled')		
	}
})


