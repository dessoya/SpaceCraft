
errors = {}
Common = Class.inherit({
	onCreate: function(error, stack) {

		if(error instanceof Common) {
			if(stack) {
				for(var name in stack) this[name] = stack[name];
			}
			this.error = error.error;
			this.stack = [].concat(error.stack);
			
			if(error.info) {
				this.info = error.info
			}
			
		}
		else if(error instanceof Error) {
			if(stack) {
				for(var name in stack) this[name] = stack[name];
			}
			// console.log(error.message)
			if('string' === typeof error.stack) {
				this.stack = error.stack.split('\n')
			}
			else {
				this.stack = error.stack
			}
			
			if(error.message) {
				this.error = error.message
			}
			else {
				this.error = this.stack.shift() // .substr(7);
			}
		}
		else {
			this.error = error;
			this.stack = (new Error().stack).split('\n');
			/*
			this.stack.shift();
			this.stack.shift();
			this.stack.shift();
			*/
		}
	}
})

errors.Common = Common