AuthMenu = Control.inherit({

    controllName: 'authmenu',

	onInit: function() {
		this.params = { };
	},

	setParams: function(params) {
		this.params = params;
		this.params._l = _l;
		this.params.component_path = '%component_path%';
	},

	render: function() {

	    if(this.params.connecting) {
			return _t['%template_path%/connecting'](this.params);
	    }

		if(this.params.auth) {
			return _t['%template_path%/auth'](this.params);
		}

		return _t['%template_path%/unauth'](this.params)
	},

	onClickAuthMethod: function(element) {
		var url = element.getAttribute('_href');
		this.params.connecting = true;
		this.rePlace();
		document.location.href = url;
	}

});

applyLabels({

	'%component_path%/connecting': {
		ru: 'загрузка . . .'
	},

	'%component_path%/join': {
		ru: 'Войти через:'
	}

});
