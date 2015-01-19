UI.Button = Control.inherit({

    controllName: 'button',	

	onInit: function(selector, caption) {
		this.bind(selector);
		this.caption = caption;
	},

	render: function() {
		return '<button mark-click="onClick()">' + this.caption + '</button>';
	},

	onClick: function() {
		this.emit('click');
	}
})


