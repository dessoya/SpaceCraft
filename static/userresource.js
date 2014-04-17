
UserResource = Class.inherit({
	onCreate: function(userinfo) {
		this.time = Date.now();
		this.info = userinfo;
		this.makeInfo();
		this.interval = setInterval(this.onInterval.bind(this), 700);
	},

	onInterval: function() {
		var delta = Math.floor( (Date.now() - this.time) / 1000 );
		if(delta > 0) {
			this.info.population += delta * this.info.population_sinc;
			this.time += delta * 1000;
			this.makeInfo();
		}		
	},

	makeInfo: function() {
		var html = '<span class="title" title="population">pop</span> '+this.info.population.toFixed(1)+'M';
		header_userinfo.innerHTML = html;
	}
})