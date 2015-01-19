
var EventEmmiter = Class.inherit({

	onCreate: function() {
		this.listeners = {};
	},

	on: function(event, listener) {
		if(!this.listeners[event]) this.listeners[event] = [];
		this.listeners[event].push(listener);
	},

	emit: function(event, arg1, arg2, arg3, arg4, arg5, arg6) {
		if(!this.listeners[event]) return;
		var a = this.listeners[event], i = a.length; while(i--)
			a[i](arg1, arg2, arg3, arg4, arg5, arg6);
	}
});
