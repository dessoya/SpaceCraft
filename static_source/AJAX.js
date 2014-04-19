
AJAX = Class.inherit({
	onCreate: function(prop) {

		this.ctx		= prop.ctx;
		this.type		= prop.type;
		this.onSuccess	= prop.success;
		this.req		= new XMLHttpRequest();
		this.req.onreadystatechange = this.onRequest.bind(this);

		var url = prop.url, list = ['ac='+Math.random()];
		for(var name in prop.params)
			list.push(name+'='+encodeURIComponent(prop.params[name]));
		if(list.length) url+='?'+list.join('&');

		if(prop.post) {
			this.method = "POST";
			this.request = prop.post;
		}
		else {
			this.method = "GET";
		}
		this.url = url;
		this.req.open(this.method, url, true);
    	this.req.send(this.request);
	},

	onRequest: function() {

		// console.log(this.url+' '+this.req.readyState+' '+this.req.status);
        if (this.req.readyState == 4 && this.req.status == 0) {
            this.onSuccess(null, this.ctx);
		}

        if (this.req.readyState == 4) {
			if(this.req.status == 200) {
				var answer = this.req.responseText;
				if('json' == this.type) {
					var json;
			        try {
						json = JSON.parse(answer);
			        } catch (e) {
						try {
							json = eval('('+answer+')');
			        	} catch (e) {
							json = null;
						}
					}
					answer = json;
				}
	            this.onSuccess(answer, this.ctx);
			}
			else {
            	this.onSuccess(null, this.ctx);
			}
		}
    }
});
