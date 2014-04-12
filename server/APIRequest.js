'use strict'

var Phoenix			= require('phoenix')
  , coroutine		= require('coroutine')

var APIRequest = Phoenix.Request.inherit({

	onRequest: function() {
		if('POST' === this.req.method) {
			this.readPost();
		}
		else {
			this.process({})
		}
	},

	onPostReaded: function(data) {
		this.process(data)
	},

	process: function(data) {

		if(!this.opt.hideRequestMessage) {
			console.log(this.info.pathname + ' ' + JSON.stringify(data))
		}

		coroutine(this.request_gen, { request: data, self: this }, function(event, data) {
			var answer
			if(GE_ERROR === event) {
				// todo: handle error message
				console.showError(data)

				// todo: custom error message
				answer = { status: "error", "error": "error while execute script" }
			}
			else {
				answer = { status: "ok", result: data }
			}
			if(this.answerReceiver) {
				this.answerReceiver(answer)
			}
			else {
				var message = JSON.stringify(answer);
				this.writeHead(200, {'Content-Type': 'application/json; charset=utf-8','Content-Length': Buffer.byteLength(message, 'utf8')});
				this.end(message);
			}
		}.bind(this))
	}
})

module.exports = APIRequest