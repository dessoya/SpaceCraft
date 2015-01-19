
window['WebSocket'] = window['WebSocket'] || window['MozWebSocket'];

WSConnection = Class.inherit({

	onCreate: function(path, protocol) {
		this.path		= path;
		this.protocol	= protocol;
		this.connected	= false;
		this.queue		= [];
		this.listeners	= {};
	},

	on: function(command, callback) {
		if(!(command in this.listeners)) {
			this.listeners[command] = []
		}
		this.listeners[command].push(callback)
	},

	emit: function(command, data) {
		if(!(command in this.listeners)) return;
		var c = this.listeners[command], l = c.length; while(l--) {
			c[l](data)
		}
	},

	connect: function() {
		this.ws				= new WebSocket(this.path, this.protocol);
		this.ws.onopen		= this.onConnect_.bind(this);
		this.ws.onclose		= this.onClose.bind(this);
		this.ws.onerror		= this.onError.bind(this);
		this.ws.onmessage	= this.onPacket.bind(this);
	},

	onConnect_: function() {

		this.connected = true;
		for(var i = 0, l = this.queue.length; i < l; i++) {
			this.ws.send(this.queue[i]);
		}
		this.queue = [];
		this.onConnect();
	},

	onPacket: function (packet) {
		var message;
        try {
			message = JSON.parse(packet.data);
        } catch (e) {
			try {
				message = eval('('+packet.data+')');
	        } catch (e) {
				message = null;
			}
		}
		if('object' === typeof message && 'command' in message) {
			this.emit('#anyCommands', message);
			this.emit(message.command, message);
		}
		else {
			this.emit('#badPacket', message);
		}
	},
	
	send: function(message) {
		message = JSON.stringify(message);
		if(this.connected) {
			this.ws.send(message);
		}
		else {
			this.queue.push(message);
		}
	},

	onConnect: function() { this.emit('#connect'); },
	onClose: function() { this.emit('#close'); },
	onError: function (error) { this.emit('#error', error);	}

});
