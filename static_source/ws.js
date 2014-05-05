
window['WebSocket'] = window['WebSocket'] || window['MozWebSocket'];

var wsconnection = function(path) {
	this.path		= path;
	this.stillConnecting = false;
	this.connected	= false;
	this.queue		= [];
	this.listeners	= {};
}

wsconnection.prototype = {

	on: function(command, callback) {
		if(!(command in this.listeners)) this.listeners[command] = []
		this.listeners[command].push(callback)
	},

	emit: function(command, data) {
		if(!(command in this.listeners)) return;
		var c = this.listeners[command], l = c.length; while(l--) c[l](data);
	},

	connect: function() {
		if(this.stillConnecting) return;
		this.stillConnecting = true;

		this.ws				= new WebSocket(this.path);
		this.ws.onopen		= this.onConnect.bind(this);
		this.ws.onclose		= this.onClose.bind(this);;
		this.ws.onerror		= this.onError.bind(this);;
		this.ws.onmessage	= this.onPacket.bind(this);
	},

	onError: function(error) {
		this.stillConnecting = false;
		this.connected = false;
		this.emit('#error', error);
	},

	onClose: function(error) {
		this.stillConnecting = false;
		this.connected = false;
		this.emit('#close');
	},

	onConnect: function() {
		this.stillConnecting = false;
		this.connected = true;
		for(var i = 0, l = this.queue.length; i < l; i++)
			this.ws.send(this.queue[i]);
		this.queue = [];
		this.emit('#connect');
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
	}
}
